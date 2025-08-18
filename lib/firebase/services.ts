import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import type { User, District, School, Class, Student } from './types';

// User Services
export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'users'), {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getUserById = async (id: string) => {
  const docRef = doc(db, 'users', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as User : null;
};

// District Services
export const createDistrict = async (districtData: Omit<District, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'districts'), {
    ...districtData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getDistrictsByAdminId = async (adminId: string) => {
  const q = query(collection(db, 'districts'), where('adminId', '==', adminId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as District);
};

// School Services
export const createSchool = async (schoolData: Omit<School, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'schools'), {
    ...schoolData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getSchoolsByDistrictId = async (districtId: string) => {
  const q = query(collection(db, 'schools'), where('districtId', '==', districtId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as School);
};

// Class Services
export const createClass = async (classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'classes'), {
    ...classData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getClassesByTeacherId = async (teacherId: string) => {
  const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Class);
};

// Student Services
export const createStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'students'), {
    ...studentData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getStudentsByClassId = async (classId: string) => {
  const q = query(collection(db, 'students'), where('classId', '==', classId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Student);
}; 