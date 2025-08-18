import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import type { User } from './types';

// Create initial users for testing
export const createInitialUsers = async () => {
  const users = [
    {
      email: 'superadmin@journalhood.com',
      password: 'password123',
      role: 'super-admin' as const,
      name: 'Super Admin'
    },
    {
      email: 'districtadmin@journalhood.com',
      password: 'password123',
      role: 'district-admin' as const,
      name: 'District Admin'
    },
    {
      email: 'schooladmin@journalhood.com',
      password: 'password123',
      role: 'school-admin' as const,
      name: 'School Admin'
    },
    {
      email: 'teacher@journalhood.com',
      password: 'password123',
      role: 'teacher' as const,
      name: 'Teacher'
    },
    {
      email: 'student@journalhood.com',
      password: 'password123',
      role: 'student' as const,
      name: 'Student'
    }
  ];

  for (const userData of users) {
    try {
      // Create Firebase Auth user
      const { user } = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: userData.email,
        role: userData.role,
        name: userData.name,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`Created user: ${userData.email} with role: ${userData.role}`);
    } catch (error) {
      console.error(`Error creating user ${userData.email}:`, error);
    }
  }
};

// Individual user creation function
export const createTestUser = async (email: string, password: string, role: User['role'], name: string) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    await setDoc(doc(db, 'users', user.uid), {
      email,
      role,
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return { success: true, message: `User ${email} created successfully` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}; 