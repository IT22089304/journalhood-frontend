import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  role: 'super-admin' | 'district-admin' | 'school-admin' | 'teacher' | 'student';
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface District {
  id: string;
  name: string;
  adminId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface School {
  id: string;
  name: string;
  districtId: string;
  adminId: string;
  adminName?: string;
  adminEmail?: string;
  status: 'active' | 'suspended';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Class {
  id: string;
  name: string;
  schoolId: string;
  teacherId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  classId: string;
  schoolId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
} 