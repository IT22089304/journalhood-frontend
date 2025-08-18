import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

// Type definitions for our data structure
export interface User {
  id: string;
  email: string;
  role: 'super-admin' | 'district-admin' | 'school-admin' | 'teacher' | 'student';
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface District {
  id: string;
  name: string;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface School {
  id: string;
  name: string;
  districtId: string;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  id: string;
  name: string;
  schoolId: string;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  classId: string;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
} 