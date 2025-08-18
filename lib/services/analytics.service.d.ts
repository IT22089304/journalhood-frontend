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

export const analyticsService: {
  analyzeAllEntries(): Promise<AnalyticsData>;
}; 