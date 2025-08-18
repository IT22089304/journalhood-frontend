"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from './config';
import { api } from '../api';
import type { User } from '../types';

interface CustomClaims {
  role: string;
  schoolId: string;
  districtId?: string;
  gradeId?: string;
  gradeName?: string;
  division?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  logout: () => Promise<void>;
  token: string | undefined;
  error: string | null;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to get user data from server using Firebase token
const getUserFromServer = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  try {
    // Force token refresh to get latest claims
    await firebaseUser.getIdToken(true);
    const token = await firebaseUser.getIdToken();
    console.log('Fetching user data from server with token:', token?.substring(0, 50) + '...');
    const userData = await api.get<User>('/api/auth/me', token);
    console.log('Server returned user data:', {
      id: userData.id,
      role: userData.role,
      districtId: userData.districtId,
      schoolId: userData.schoolId
    });
    
    // Only validate districtId for admin roles - students don't need this validation
    if (!userData.districtId && (userData.role === 'district-admin' || userData.role === 'school-admin')) {
      console.error('User data missing district ID for admin role:', userData);
      // Try one more time with a forced token refresh
      await firebaseUser.getIdToken(true);
      const newToken = await firebaseUser.getIdToken();
      const refreshedUserData = await api.get<User>('/api/auth/me', newToken);
      if (!refreshedUserData.districtId) {
        throw new Error('User data missing required district ID');
      }
      return refreshedUserData;
    }

    // For students and teachers, accept user data even without districtId
    if (userData.role === 'student' || userData.role === 'teacher' || userData.role === 'super-admin') {
      console.log(`✅ ${userData.role} authentication successful:`, {
        id: userData.id,
        role: userData.role,
        email: userData.email
      });
      return userData;
    }
    
    return userData;
  } catch (error) {
    console.error('Error fetching user data from server:', error);
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const refreshToken = async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      try {
        setLoading(true);
        console.log('Starting token refresh...');
        
        // Force token refresh
        await firebaseUser.getIdToken(true);
        const newToken = await firebaseUser.getIdToken();
        console.log('Token refreshed, getting user data...');
        
        // Update token state and cookie (school-specific)
        setToken(newToken);
        document.cookie = `auth-token=${newToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
        
        // Get fresh user data with retries
        let userData = null;
        let retries = 3;
        
        while (retries > 0 && !userData) {
          try {
            userData = await getUserFromServer(firebaseUser);
            if (userData) {
              console.log('Successfully retrieved user data:', {
                id: userData.id,
                role: userData.role,
                districtId: userData.districtId
              });
              setUser(userData);
              break;
            }
          } catch (error) {
            console.error(`Retry ${4 - retries} failed:`, error);
            if (retries > 1) {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          retries--;
        }
        
        if (!userData) {
          throw new Error('Failed to get user data after retries');
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      console.error('No Firebase user found for token refresh');
      throw new Error('No user logged in');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          setLoading(true);
          setError(null);
          
          // Get the Firebase token
          const userToken = await firebaseUser.getIdToken();
          setToken(userToken);
          
          // Store token in cookies for middleware access (school-specific path)
          document.cookie = `auth-token=${userToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
          
          // Get complete user data from server
          const userData = await getUserFromServer(firebaseUser);
          if (!userData) {
            throw new Error('Failed to load user data');
          }
          setUser(userData);
        } catch (error) {
          console.error('Error getting user token or data:', error);
          setUser(null);
          setToken(undefined);
          setError(error instanceof Error ? error.message : 'Failed to load user data');
          // Clear school auth cookie on error
          document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setToken(undefined);
        setError(null);
        // Clear school auth cookie when logged out
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    // Additional user data will be created through the createUser service
  };

  const logout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Clear state first
      setUser(null);
      setToken(undefined);
      setError(null);
      
      // Clear auth token cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      // Sign out from Firebase
      await signOut(auth);
      
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if Firebase signOut fails, clear local state
      setUser(null);
      setToken(undefined);
      setError(null);
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      logout, 
      token, 
      error,
      refreshToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 