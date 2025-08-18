import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, setDoc, Timestamp } from 'firebase/firestore';

export interface EntryAnalytics {
  studentId: string;
  studentName: string;
  schoolId: string;
  districtId: string;
  teacherId: string;
  classId: string;
  wordCount: number;
  emotion: string;
  timestamp: Date;
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

export const analyticsService = {
  async analyzeAllEntries(): Promise<AnalyticsData> {
    try {
      // Get all users to map student IDs to names
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = new Map();
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.role === 'student') {
          users.set(doc.id, userData);
        }
      });

      // Get all classes to get teacher IDs
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      const classes = new Map();
      classesSnapshot.forEach(doc => {
        const classData = doc.data();
        classes.set(doc.id, classData);
      });

      // Get all schools to get district IDs
      const schoolsSnapshot = await getDocs(collection(db, 'schools'));
      const schools = new Map();
      schoolsSnapshot.forEach(doc => {
        const schoolData = doc.data();
        schools.set(doc.id, schoolData);
      });

      const entries: EntryAnalytics[] = [];
      let totalWords = 0;
      let totalEntries = 0;
      const districtStats: Record<string, number> = {};
      const schoolStats: Record<string, number> = {};
      const classStats: Record<string, number> = {};
      const emotionStats: Record<string, number> = {};
      const studentStats: Record<string, StudentStats> = {};

      // Process each student's entries
      for (const [studentId, studentData] of users) {
        // Get class and school data
        const classData = classes.get(studentData.classId || '') || {};
        const schoolData = schools.get(studentData.schoolId || '') || {};
        const districtId = schoolData.districtId || '';

        // Initialize student stats
        studentStats[studentId] = {
          studentId,
          studentName: studentData.name || 'Unknown Student',
          schoolId: studentData.schoolId || '',
          districtId,
          teacherId: classData.teacherId || '',
          classId: studentData.classId || '',
          totalEntries: 0,
          totalWords: 0,
          emotionDistribution: {},
          averageWordsPerEntry: 0,
          lastEntryDate: null
        };

        // Get entries from diaryEntriesBackup
        const entriesSnapshot = await getDocs(
          collection(db, 'diaryEntriesBackup', studentId, 'entries')
        );

        let studentEntries: EntryAnalytics[] = [];
        
        entriesSnapshot.forEach(entryDoc => {
          const entryData = entryDoc.data();
          
          // Calculate word count from content
          const wordCount = Array.isArray(entryData.content) 
            ? entryData.content.reduce((count: number, item: any) => {
                if (typeof item.insert === 'string') {
                  return count + item.insert.trim().split(/\s+/).length;
                }
                return count;
              }, 0)
            : 0;

          const entryDate = (entryData.timestamp as Timestamp)?.toDate() || new Date();
          const emotion = entryData.emotion || 'unknown';

          // Update student statistics
          studentStats[studentId].totalWords += wordCount;
          studentStats[studentId].totalEntries++;
          studentStats[studentId].emotionDistribution[emotion] = 
            (studentStats[studentId].emotionDistribution[emotion] || 0) + 1;
          
          if (!studentStats[studentId].lastEntryDate || 
              entryDate > studentStats[studentId].lastEntryDate) {
            studentStats[studentId].lastEntryDate = entryDate;
          }

          // Update global statistics
          totalWords += wordCount;
          totalEntries++;
          districtStats[districtId] = (districtStats[districtId] || 0) + wordCount;
          schoolStats[studentData.schoolId || ''] = (schoolStats[studentData.schoolId || ''] || 0) + wordCount;
          classStats[studentData.classId || ''] = (classStats[studentData.classId || ''] || 0) + wordCount;
          emotionStats[emotion] = (emotionStats[emotion] || 0) + 1;

          const entryAnalytics: EntryAnalytics = {
            studentId,
            studentName: studentData.name || 'Unknown Student',
            schoolId: studentData.schoolId || '',
            districtId,
            teacherId: classData.teacherId || '',
            classId: studentData.classId || '',
            wordCount,
            emotion,
            timestamp: entryDate,
          };

          entries.push(entryAnalytics);
          studentEntries.push(entryAnalytics);
        });

        // Calculate average words per entry
        if (studentStats[studentId].totalEntries > 0) {
          studentStats[studentId].averageWordsPerEntry = 
            studentStats[studentId].totalWords / studentStats[studentId].totalEntries;
        }
      }

      // Store analytics data with today's date as document ID
      const today = new Date();
      const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const analyticsData: AnalyticsData = {
        data: entries,
        totalWords,
        totalEntries,
        districtStats,
        schoolStats,
        classStats,
        emotionStats,
        studentStats,
        analyzedAt: new Date()
      };

      await setDoc(doc(db, 'analyzedData', dateString), {
        ...analyticsData,
        analyzedAt: Timestamp.fromDate(analyticsData.analyzedAt),
        studentStats: Object.entries(analyticsData.studentStats).reduce((acc, [id, student]) => {
          acc[id] = {
            ...student,
            lastEntryDate: student.lastEntryDate ? Timestamp.fromDate(student.lastEntryDate) : null
          };
          return acc;
        }, {} as Record<string, any>)
      });

      return analyticsData;
    } catch (error) {
      console.error('Error analyzing entries:', error);
      throw error;
    }
  }
}; 