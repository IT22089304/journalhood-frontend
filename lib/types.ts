import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string
  name: string
  email: string
  displayName: string
  phoneNumber?: string
  role: "super-admin" | "district-admin" | "school-admin" | "teacher" | "student"
  status: "active" | "suspended"
  createdAt: Date
  updatedAt: Date
  // Role-specific fields
  districtId?: string
  districtName?: string
  schoolId?: string
  schoolName?: string
  schoolAddress?: string
  schoolZipCode?: string
  gradeId?: string
  gradeName?: string
  division?: string
  // Teacher-specific fields
  classId?: string
  studentCount?: number
  customClaims?: {
    role: string
    schoolId: string
    gradeId?: string
    gradeName?: string
    division?: string
  }
}

export interface District {
  id: string
  name: string
  country: string
  adminId: string
  adminName: string
  adminEmail: string
  schoolCount: number
  classCount: number
  studentCount: number
  createdAt: Date
  status: "active" | "suspended"
}

export interface School {
  id: string
  name: string
  address: string
  zipCode: string
  districtId: string
  districtName: string
  adminId: string
  adminName: string
  adminEmail: string
  teacherCount: number
  studentCount: number
  grades: Grade[]
  createdAt: Date
  status: "active" | "suspended"
}

export interface Grade {
  id: string
  name: string
  level: number
  divisions: string[]
}

export interface Teacher {
  id: string
  email: string
  displayName: string
  phoneNumber?: string
  schoolId: string
  schoolName: string
  gradeId: string
  gradeName: string
  division: string
  studentCount: number
  status: "active" | "suspended"
  createdAt: Date
}

export interface Student {
  uid: string;
  displayName: string;
  email: string;
  status: string;
  journalEntries: number;
  lastActivity: string | null;
  weeklyEntries?: number;
  monthlyEntries?: number;
  weeklyWordCount?: number;
  monthlyWordCount?: number;
  weeklyGrowth?: number;
  monthlyGrowth?: number;
  sentiment?: 'Very Positive' | 'Positive' | 'Neutral' | 'Negative';
  customClaims?: {
    role: string;
    gradeId: string;
    division: string;
    teacherIncharge: string;
    schoolId: string;
  };
}

export interface FormState<T> {
  data: T
  errors: Record<string, string>
  isLoading: boolean
  isValid: boolean
  setError?: (field: string, error: string) => void
}

export interface TableState<T> {
  data: T[]
  filteredData: T[]
  searchTerm: string
  sortField: keyof T | null
  sortDirection: "asc" | "desc"
  currentPage: number
  itemsPerPage: number
  isLoading: boolean
}

export interface Class {
  id: string
  gradeId: string
  gradeName: string
  division: string
  schoolId: string
  teacherId?: string
  teacherName?: string
  studentCount: number
  maxStudents: number
  status: "active" | "inactive"
  createdAt: Date
  updatedAt: Date
}

export interface GradeConfig {
  id: string
  name: string
  level: number
  divisions: DivisionConfig[]
  schoolId: string
  isActive: boolean
}

export interface DivisionConfig {
  id: string
  name: string
  maxStudents: number
}

// Teacher Types
export interface TeacherClassData {
  id: string;
  gradeName: string;
  division: string;
  teacherId: string;
  teacherName: string;
  studentCount: number;
  maxStudents: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherDashboardData {
  class: TeacherClassData | null;
  students: Student[];
  analytics: {
    totalStudents: number;
    activeStudents: number;
    avgWordCount: number;
    totalEntries: number;
    classEngagement: number;
    weeklyGrowth: number;
    monthlyGrowth: number;
    weeklyEntries: number;
    monthlyEntries: number;
    weeklyAvgWords: number;
    monthlyAvgWords: number;
    sentimentDistribution: {
      veryPositive: number;
      positive: number;
      neutral: number;
      negative: number;
    };
  };
}

export interface AnalyzedData {
  id: string;  // Analysis timestamp or batch ID
  timestamp: Timestamp;
  totalWords: number;
  totalEntries: number;
  districtStats: {
    [districtId: string]: {
      totalWords: number;
      avgWordsPerStudent: number;
      totalEntries: number;
      activeStudents: number;
      districtName: string;
    }
  };
  schoolStats: {
    [schoolId: string]: {
      totalWords: number;
      avgWordsPerStudent: number;
      totalEntries: number;
      activeStudents: number;
      schoolName: string;
      districtId: string;
    }
  };
  classStats: {
    [classId: string]: {  // classId = gradeId_division
      totalWords: number;
      avgWordsPerStudent: number;
      totalEntries: number;
      activeStudents: number;
      className: string;
      schoolId: string;
    }
  };
  studentStats: {
    [studentId: string]: {
      totalWords: number;
      avgWordsPerEntry: number;
      totalEntries: number;
      studentName: string;
      classId: string;
      schoolId: string;
      districtId: string;
    }
  };
}

export interface DistrictAnalytics {
  districtId: string;
  districtName: string;
  metrics: {
    totalEntries: number;
    totalWords: number;
    activeStudents: number;
    totalStudents: number;
    schoolPerformance: {
      [schoolId: string]: {
        name: string;
        metrics: {
          totalEntries: number;
          activeStudents: number;
          averageWordsPerEntry: number;
          dominantEmotions: string[];
        }
      }
    };
    timeBasedMetrics: {
      daily: Record<string, { entries: number; words: number; activeStudents: number }>;
      weekly: Record<string, { entries: number; words: number; activeStudents: number }>;
      monthly: Record<string, { entries: number; words: number; activeStudents: number }>;
    }
  }
}

export interface SchoolAnalytics {
  schoolId: string;
  schoolName: string;
  metrics: {
    totalEntries: number;
    totalWords: number;
    activeStudents: number;
    totalStudents: number;
    classPerformance: {
      [classId: string]: {
        name: string;
        metrics: {
          totalEntries: number;
          activeStudents: number;
          averageWordsPerEntry: number;
          dominantEmotions: string[];
        }
      }
    };
    timeBasedMetrics: {
      daily: Record<string, { entries: number; words: number; activeStudents: number }>;
      weekly: Record<string, { entries: number; words: number; activeStudents: number }>;
      monthly: Record<string, { entries: number; words: number; activeStudents: number }>;
    }
  }
}

export interface ClassAnalytics {
  classId: string;
  className: string;
  metrics: {
    totalEntries: number;
    totalWords: number;
    activeStudents: number;
    totalStudents: number;
    studentPerformance: {
      [studentId: string]: {
        name: string;
        metrics: {
          totalEntries: number;
          averageWordsPerEntry: number;
          lastEntryDate: Timestamp;
          streak: number;
          dominantEmotions: string[];
        }
      }
    };
    timeBasedMetrics: {
      daily: Record<string, { entries: number; words: number; activeStudents: number }>;
      weekly: Record<string, { entries: number; words: number; activeStudents: number }>;
      monthly: Record<string, { entries: number; words: number; activeStudents: number }>;
    }
  }
}

export interface SchoolAdmin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  schoolId: string;
  schoolName: string;
  status: "active" | "suspended";
}

// =============================================================================
// RESOURCE MANAGEMENT TYPES
// =============================================================================

export interface Resource {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: 'link'; // future: 'file', 'video', etc.
  category: 'depression' | 'bullying' | 'introvert' | 'language_problem';
  createdBy: string; // uid of creator
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived';
}

export interface ResourceAssignment {
  id: string;
  resourceId: string;
  resourceTitle: string; // denormalized for efficiency
  resourceUrl: string; // denormalized for efficiency
  assignedBy: string; // uid of assigner
  assignedByRole: "super-admin" | "district-admin" | "school-admin" | "teacher";
  assignedTo: string; // uid of recipient
  assignedToRole: "district-admin" | "school-admin" | "teacher" | "student";
  targetType: 'district' | 'school' | 'class' | 'student';
  targetId: string; // districtId, schoolId, classId, or studentId
  targetName?: string; // denormalized name
  assignedAt: Date;
  status: 'active' | 'archived';
  viewedAt?: Date; // when recipient first viewed
}

export interface CreateResourceRequest {
  title: string;
  description?: string;
  url: string;
  type?: 'link';
  category: 'depression' | 'bullying' | 'introvert' | 'language_problem';
}

export interface UpdateResourceRequest {
  title?: string;
  description?: string;
  url?: string;
  status?: 'active' | 'archived';
  category?: 'depression' | 'bullying' | 'introvert' | 'language_problem';
}

export interface AssignResourceRequest {
  resourceId: string;
  assignedTo: string;
  assignedToRole: "district-admin" | "school-admin" | "teacher";
  targetType: 'district' | 'school' | 'class';
  targetId: string;
  targetName?: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

export interface AnalyticsResponse {
  analytics: AnalyzedData;
  mentalHealth: {
    flaggedStudents: number;
    flaggedStudentsList: Array<{
      studentId: string;
      studentName: string;
      issueType: 'depression' | 'bullying' | 'introvert' | 'language_problem';
      flagCount: number;
      resourcesDelivered: boolean;
    }>;
    resourcesDelivered: number;
  };
  processing: {
    totalJournalsProcessed: number;
    journalsMovedToArchive: number;
    journalsRemovedFromBackup: number;
  };
}
