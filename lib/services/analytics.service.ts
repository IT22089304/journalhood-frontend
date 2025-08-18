import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, setDoc, Timestamp, query, where } from 'firebase/firestore';
import { axiosInstance } from '../api';

export interface EntryAnalytics {
  studentId: string;
  schoolId: string;
  districtId: string;
  totalEntries: number;
  averageWords: number;
  emotionDistribution: {
    [key: string]: number;  // e.g., { "happy": 5, "sad": 3 }
  };
  wordCountTrend: number[];
  analyzedAt: Date;
}

export interface StudentStats {
  studentId: string;
  studentName: string;
  schoolId: string;
  districtId: string;
  teacherId: string;
  classId: string;
  totalEntries: number;
  totalWords: number;
  emotionDistribution: Record<string, number>;
  averageWordsPerEntry: number;
  lastEntryDate: Date | null;
}

export interface AnalyticsData {
  data: EntryAnalytics[];
  totalWords: number;
  totalEntries: number;
  districtStats: Record<string, number>;
  schoolStats: Record<string, number>;
  classStats: Record<string, number>;
  emotionStats: Record<string, number>;
  studentStats: Record<string, StudentStats>;
  analyzedAt: Date;
}

export interface DiaryEntry {
  id: string;
  studentId: string;
  student?: {
    id: string;
    name: string;
    email: string;
    role: string;
    schoolId: string;
    schoolName: string;
    gradeId: string;
    gradeName: string;
    division: string;
  };
  title: string;
  content: { insert: string }[];
  emotion: string;
  timestamp: string;
}

export interface DiaryAnalyticsResponse {
  entries: DiaryEntry[];
  students: any[];
  totalEntries: number;
  totalStudents: number;
}

// Helper function to count words in diary content
export const countWordsInContent = (content: { insert: string }[]): number => {
  return content
    .map(item => item.insert || '')
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length;
};

export const analyticsService = {
  // Get student diary entries
  async getStudentDiaryAnalytics(): Promise<DiaryAnalyticsResponse> {
    try {
      const response = await axiosInstance.get<DiaryAnalyticsResponse>('/api/student/diary-backup-entries');
      return response.data;
    } catch (error) {
      console.error('Error fetching diary analytics:', error);
      throw error;
    }
  },

  // Store analyzed data for a specific student
  async storeAnalyzedData(studentId: string, schoolId: string, entries: DiaryEntry[]): Promise<void> {
    try {
      // Calculate analytics
      const totalEntries = entries.length;
      const wordCounts = entries.map(entry => countWordsInContent(entry.content));
      const averageWords = totalEntries > 0 
        ? Math.round(wordCounts.reduce((sum, count) => sum + count, 0) / totalEntries) 
        : 0;

      // Calculate emotion distribution
      const emotionDistribution = entries.reduce((acc, entry) => {
        acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      const analyticsData: EntryAnalytics = {
        studentId,
        schoolId,
        districtId: '',
        totalEntries,
        averageWords,
        emotionDistribution,
        wordCountTrend: wordCounts,
        analyzedAt: new Date()
      };

      // Store in Firestore
      const analyticsRef = doc(db, 'analytics', studentId);
      await setDoc(analyticsRef, {
        ...analyticsData,
        analyzedAt: Timestamp.fromDate(analyticsData.analyzedAt)
      });

      console.log('Analytics stored successfully for student:', studentId);
    } catch (error) {
      console.error('Error storing analytics:', error);
      throw error;
    }
  },

  // Get analytics for super admin (all schools)
  async getSuperAdminAnalytics(): Promise<EntryAnalytics[]> {
    try {
      const analyticsRef = collection(db, 'analytics');
      const analyticsSnapshot = await getDocs(analyticsRef);
      
      return analyticsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          analyzedAt: (data.analyzedAt as Timestamp).toDate()
        } as EntryAnalytics;
      });
    } catch (error) {
      console.error('Error fetching super admin analytics:', error);
      throw error;
    }
  },

  // Get analytics for a specific school
  async getSchoolAnalytics(schoolId: string): Promise<EntryAnalytics[]> {
    try {
      const analyticsRef = collection(db, 'analytics');
      const q = query(analyticsRef, where('schoolId', '==', schoolId));
      const analyticsSnapshot = await getDocs(q);
      
      return analyticsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          analyzedAt: (data.analyzedAt as Timestamp).toDate()
        } as EntryAnalytics;
      });
    } catch (error) {
      console.error('Error fetching school analytics:', error);
      throw error;
    }
  }
}; 