// API utility for making authenticated requests to the server

import axios from 'axios';
import { AnalyzedData, AnalyticsResponse } from './types';
import type { ApiResponse as ApiResponseType } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://journalhood-backend-production.up.railway.app';

interface ApiOptions extends RequestInit {
  token?: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export class ApiError extends Error {
  constructor(public message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to make authenticated API calls
export const apiCall = async <T = any>(
  endpoint: string, 
  options: ApiOptions = {}
): Promise<T> => {
  const { token, headers = {}, ...fetchOptions } = options;
  
  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    credentials: 'include',
    mode: 'cors'
  };

  try {
    console.log('🌐 Making API request:', {
      url: `${API_BASE_URL}${endpoint}`,
      method: fetchOptions.method || 'GET',
      hasToken: !!token,
      headers: config.headers
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    console.log('📥 API response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });

    if (!response.ok) {
      let errorMessage = 'Unknown error';
      try {
        const errorData = await response.json();
        console.error('❌ API error:', errorData);
        errorMessage = errorData.message || errorData.error || 'API Error';
      } catch (e) {
        // If parsing JSON fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new ApiError(errorMessage, response.status);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('✅ API success:', {
        endpoint,
        dataKeys: Object.keys(data)
      });
      return data;
    }
    
    return response.text() as Promise<T>;
  } catch (error) {
    console.error('❌ API call failed:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      // Network errors or other Error instances
      throw new ApiError(error.message || 'Network error');
    }
    // Unknown error type
    throw new ApiError('An unexpected error occurred');
  }
};

// Convenience methods for common HTTP verbs
export const api = {
  async get<T>(endpoint: string, token?: string): Promise<T> {
    return apiCall<T>(endpoint, { method: 'GET', token });
  },

  async post<T>(endpoint: string, data: any, token?: string): Promise<T> {
    console.log('🌐 API POST Request:', {
      endpoint,
      originalData: data,
      jsonStringified: JSON.stringify(data),
      hasToken: !!token
    });
    
    return apiCall<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  },
  // Convenience for form submissions without auth
  async postPublic<T>(endpoint: string, data: any): Promise<T> {
    return apiCall<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async put<T>(endpoint: string, data: any, token?: string): Promise<T> {
    return apiCall<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      token,
    });
  },

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return apiCall<T>(endpoint, { method: 'DELETE', token });
  }
}; 

// Class Management API functions
export const classApi = {
  // Create a new class
  async createClass(classData: {
    gradeName: string;
    division: string;
    maxStudents: number;
    schoolId: string;
  }, token?: string) {
    return api.post('/api/classes', classData, token);
  },

  // Get all classes for a school
  async getClasses(schoolId: string, token?: string) {
    console.log('ClassApi.getClasses called with:', { schoolId, hasToken: !!token });
    // Use the regular classes endpoint which handles role-based access control
    const url = `/api/classes?schoolId=${schoolId}`;
    console.log('Making request to:', url);
    return api.get(url, token);
  },

  // Update a class
  async updateClass(classId: string, updateData: any, token?: string) {
    return api.put(`/api/classes/${classId}`, updateData, token);
  },

  // Delete a class
  async deleteClass(classId: string, token?: string) {
    return api.delete(`/api/classes/${classId}`, token);
  },

  // Assign teacher to class
  async assignTeacher(classId: string, teacherData: {
    teacherId: string;
    teacherName: string;
  }, token?: string) {
    return api.post(`/api/classes/${classId}/assign-teacher`, teacherData, token);
  }
};

interface TeacherClassData {
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

interface TeacherDashboardData {
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

// Teacher Management API functions
export const teacherApi = {
  // Create a new teacher
  async createTeacher(teacherData: {
    name: string;
    email: string;
    phone?: string;
    gradeId?: string;
    gradeName?: string;
    division?: string;
  }, token?: string) {
    return api.post('/api/teachers', teacherData, token);
  },

  // Get a single teacher
  async getTeacher(teacherId: string, token?: string) {
    const response = await api.get<{ teacher: any }>(`/api/teachers/${teacherId}`, token);
    if (response.teacher) {
      return {
        ...response.teacher,
        name: response.teacher.name || '',
        email: response.teacher.email || '',
        phone: response.teacher.phone || '',
        gradeId: response.teacher.gradeId || '',
        gradeName: response.teacher.gradeName || '',
        division: response.teacher.division || '',
        status: response.teacher.disabled ? 'suspended' : 'active'
      };
    }
    return null;
  },

  // Get all teachers for a school
  async getTeachers(token?: string) {
    const response = await api.get<{ teachers: any[] }>('/api/teachers', token);
    
    // Transform teacher data to include class information and map disabled to status
    if (response.teachers) {
      response.teachers = response.teachers.map((teacher: any) => ({
        ...teacher,
        name: teacher.name || teacher.displayName || teacher.fullName || '',
        email: teacher.email || teacher.userEmail || '',
        phone: teacher.phone || '',
        gradeId: teacher.gradeId || '',
        gradeName: teacher.gradeName || '',
        division: teacher.division || '',
        status: teacher.status || 'active'
      }));
    }
    
    return response;
  },

  // Update a teacher
  async updateTeacher(teacherId: string, updateData: {
    name: string;
    email: string;
    phone?: string;
    gradeId?: string;
    gradeName?: string;
    division?: string;
  }, token?: string) {
    return api.put(`/api/teachers/${teacherId}`, updateData, token);
  },

  // Delete a teacher
  async deleteTeacher(teacherId: string, token?: string) {
    return api.delete(`/api/teachers/${teacherId}`, token);
  },

  // Toggle teacher status (suspend/unsuspend)
  async toggleTeacherStatus(teacherId: string, token?: string): Promise<{ message: string; status: 'active' | 'suspended' }> {
    return api.put(`/api/teachers/${teacherId}/status`, {}, token);
  },

  // Get teacher's class data
  getDashboardData: async (token: string): Promise<TeacherDashboardData> => {
    try {
      const response = await api.get<{
        class: TeacherClassData | null;
        students: Array<{
          uid: string;
          displayName: string;
          email: string;
          status: string;
          journalEntries: number;
          lastActivity: string | null;
          customClaims?: {
            role: string;
            gradeId: string;
            division: string;
            teacherIncharge: string;
            schoolId: string;
          };
        }>;
        analytics: {
          totalStudents: number;
          activeStudents: number;
          avgWordCount: number;
          totalEntries: number;
          classEngagement: number;
          weeklyGrowth?: number;
          monthlyGrowth?: number;
          weeklyEntries?: number;
          monthlyEntries?: number;
          weeklyAvgWords?: number;
          monthlyAvgWords?: number;
          sentimentDistribution?: {
            veryPositive: number;
            positive: number;
            neutral: number;
            negative: number;
          };
        };
      }>('/api/teachers/dashboard', token);
      
      // Ensure we have valid data structure
      if (!response) {
        throw new ApiError('Invalid response format');
      }

      // If no class is assigned, return empty data
      if (!response.class) {
        throw new ApiError('No class assigned');
      }

      // Transform and validate students data
      const students = response.students.map(student => ({
        uid: student.uid || '',
        displayName: student.displayName || '',
        email: student.email || '',
        status: student.status || 'pending',
        journalEntries: student.journalEntries || 0,
        lastActivity: student.lastActivity || null,
        customClaims: {
          role: student.customClaims?.role || 'student',
          gradeId: student.customClaims?.gradeId || '',
          division: student.customClaims?.division || '',
          teacherIncharge: student.customClaims?.teacherIncharge || '',
          schoolId: student.customClaims?.schoolId || ''
        }
      }));

      // Transform and validate analytics data
      const analytics = {
        totalStudents: response.analytics?.totalStudents || 0,
        activeStudents: response.analytics?.activeStudents || 0,
        avgWordCount: response.analytics?.avgWordCount || 0,
        totalEntries: response.analytics?.totalEntries || 0,
        classEngagement: response.analytics?.classEngagement || 0,
        weeklyGrowth: response.analytics?.weeklyGrowth || 0,
        monthlyGrowth: response.analytics?.monthlyGrowth || 0,
        weeklyEntries: response.analytics?.weeklyEntries || 0,
        monthlyEntries: response.analytics?.monthlyEntries || 0,
        weeklyAvgWords: response.analytics?.weeklyAvgWords || 0,
        monthlyAvgWords: response.analytics?.monthlyAvgWords || 0,
        sentimentDistribution: response.analytics?.sentimentDistribution || {
          veryPositive: 0,
          positive: 0,
          neutral: 0,
          negative: 0
        }
      };

      return {
        class: response.class,
        students,
        analytics
      };
    } catch (error) {
      if (error instanceof ApiError && error.message === 'No class assigned') {
        throw error; // Let the UI handle this specific case
      }
      if (error instanceof ApiError) {
        throw new ApiError('Invalid teacher data');
      }
      throw new ApiError('Failed to load dashboard data');
    }
  },

  // Get teacher's class details
  getClassDetails: async (token: string): Promise<TeacherClassData | null> => {
    try {
      const response = await api.get<TeacherClassData | null>('/api/teachers/class', token);
      
      if (!response) {
        return null;
      }

      return {
        id: response.id || '',
        gradeName: response.gradeName || '',
        division: response.division || '',
        teacherId: response.teacherId || '',
        teacherName: response.teacherName || '',
        studentCount: response.studentCount || 0,
        maxStudents: response.maxStudents || 25,
        status: response.status || 'active',
        createdAt: response.createdAt || new Date().toISOString(),
        updatedAt: response.updatedAt || new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to load class details');
    }
  },

  // Get teacher's information and class details
  getTeacherInfo: async (token?: string) => {
    try {
      const response = await api.get<{
        teacher: {
          uid: string;
          email: string;
          displayName: string;
          photoURL?: string;
          emailVerified: boolean;
          disabled: boolean;
          customClaims: {
            role: string;
            schoolId: string;
            schoolName: string;
            districtId: string;
            districtName: string;
            gradeId: string;
            gradeName: string;
            division: string;
            classId: string;
            teacherId?: string;
            teacherName?: string;
            teacherIncharge?: string;
          };
          classData: any;
          hasRequiredClaims: boolean;
        };
      }>('/api/teachers/info', token);
      return response.teacher;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to load teacher information');
    }
  },

  // Get students in the teacher's class
  async getStudents(token?: string) {
    return api.get<{ students: any[] }>('/api/teachers/students', token);
  },
};

// School Management API functions
export const schoolApi = {
  // Get school overview data
  async getOverview(schoolId: string, token?: string) {
    return api.get<{
      classes: Array<{
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
      }>;
      teachers: number;
      students: number;
    }>(`/api/school-admin/overview?schoolId=${schoolId}`, token);
  }
};

interface Student {
  uid: string;
  displayName: string;
  email: string;
  status: string;
  journalEntries: number;
  lastActivity: string | null;
  customClaims?: {
    role: string;
    gradeId: string;
    division: string;
    teacherIncharge: string;
    schoolId: string;
  };
}

interface CreateStudentResponse {
  message: string;
  uid: string;
}

interface GetStudentsResponse {
  students: Student[];
}

// Student API
export const studentApi = {
  // Get all students for a school
  async getBySchoolId(schoolId: string, token?: string) {
    return api.get(`/api/school-admin/get-students?schoolId=${schoolId}`, token);
  },

  // Get all students (for super admin)
  async getAll(token?: string) {
    return api.get('/api/school-admin/get-students', token);
  },

  // Get students by class ID
  async getByClassId(classId: string, token?: string) {
    return api.get(`/api/super-admin/get-students?classId=${classId}`, token);
  },

  // Get student profile
  async getProfile(token?: string) {
    return api.get('/api/student/profile', token);
  },

  // Update student profile
  async updateProfile(data: any, token?: string) {
    return api.put('/api/student/profile', data, token);
  },

  // Get student's diary entries
  async getDiaryEntries(token?: string) {
    return api.get('/api/student/diary-entries', token);
  },

  // Create diary entry
  async createDiaryEntry(data: any, token?: string) {
    return api.post('/api/student/diary-entries', data, token);
  },

  // Update diary entry
  async updateDiaryEntry(entryId: string, data: any, token?: string) {
    return api.put(`/api/student/diary-entries/${entryId}`, data, token);
  },

  // Delete diary entry
  async deleteDiaryEntry(entryId: string, token?: string) {
    return api.delete(`/api/student/diary-entries/${entryId}`, token);
  }
};

export const axiosInstance = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'https://journalhood-backend-production.up.railway.app') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Analytics API functions
export const analyticsApi = {
  // Analyze diary entries (Super Admin only) - Unified workflow
  async analyzeData(token?: string, analysisMethod: 'keyword' | 'openai' = 'keyword'): Promise<ApiResponseType<AnalyticsResponse>> {
    return api.post('/api/super-admin/analytics/analyze', { analysisMethod }, token);
  },

  // Get analyzed data (Super Admin only)
  async getAnalytics(token?: string): Promise<ApiResponseType<AnalyzedData>> {
    return api.get('/api/super-admin/analytics', token);
  },

  async getHistoricalAnalytics(token?: string): Promise<ApiResponseType<Array<{
    id: string;
    timestamp: string;
    date: string;
    fullDate: string;
    totalWords: number;
    totalEntries: number;
    activeDistricts: number;
    activeSchools: number;
    activeClasses: number;
    activeStudents: number;
  }>>> {
    return api.get('/api/super-admin/analytics/historical', token);
  },

  // Update analytics incrementally (Super Admin only)
  async updateAnalyticsIncremental(token?: string): Promise<ApiResponseType<{
    previousStats: {
      totalWords: number;
      totalEntries: number;
      students: number;
    };
    updatedStats: {
      totalWords: number;
      totalEntries: number;
      students: number;
    };
    changes: {
      wordsDiff: number;
      entriesDiff: number;
      entriesFromSources: {
        analyzedJournals: number;
        backupEntries: number;
        userJournals: number;
        totalUnique: number;
      };
    };
  }>> {
    return api.post('/api/super-admin/analytics/update-incremental', {}, token);
  },

  // Enhanced Mental Health Analysis (Super Admin only)
  async analyzeMentalHealth(token?: string, analysisMethod: 'keyword' | 'openai' = 'keyword'): Promise<ApiResponseType<{
    analyzedStudents: number;
    flaggedStudents: number;
    resourcesDelivered: number;
    newJournalsProcessed: number;
    journalsMovedToBackup: number;
    isIncremental: boolean;
    lastAnalysisDate: string | null;
    flaggedStudentsList: Array<{
      studentId: string;
      studentName: string;
      issueType: 'depression' | 'bullying' | 'introvert' | 'language_problem';
      flagCount: number;
      resourcesDelivered: boolean;
    }>;
  }>> {
    return api.post('/api/super-admin/mental-health/analyze', { analysisMethod }, token);
  },

  // Get Flagged Students Report (Super Admin only)
  async getFlaggedStudentsReport(token?: string): Promise<ApiResponseType<{
    flaggedStudents: Array<{
      id: string;
      studentId: string;
      studentName: string;
      studentEmail: string;
      issueType: 'depression' | 'bullying' | 'introvert' | 'language_problem';
      flagCount: number;
      resourcesDelivered: boolean;
      dateFirstFlagged: string;
      dateLastFlagged: string;
      schoolId: string;
      districtId: string;
    }>;
    summary: Record<string, {
      totalFlags: number;
      studentsAffected: number;
      resourcesDelivered: number;
    }>;
    totalFlagged: number;
  }>> {
    return api.get('/api/super-admin/mental-health/flagged-students', token);
  },

  // Get teacher analytics (Teacher only)
  async getTeacherAnalytics(token?: string): Promise<ApiResponseType<AnalyzedData>> {
    return api.get('/api/teachers/analytics', token);
  },

  // Get school analytics (Super Admin only)
  async getSchoolAnalytics(schoolId: string, token?: string): Promise<ApiResponseType<AnalyzedData>> {
    return api.get(`/api/super-admin/schools/${schoolId}/analytics`, token);
  },

  async getSchoolHistoricalAnalytics(schoolId: string, token?: string): Promise<ApiResponseType<Array<{
    id: string;
    timestamp: string;
    date: string;
    fullDate: string;
    totalWords: number;
    totalEntries: number;
    activeClasses: number;
    activeStudents: number;
  }>>> {
    return api.get(`/api/super-admin/schools/${schoolId}/analytics/historical`, token);
  },

  // Get district analytics (District Admin only)
  async getDistrictAnalytics(token?: string): Promise<ApiResponseType<AnalyzedData>> {
    return api.get('/api/district-admin/analytics', token);
  },

  // Get district historical analytics (District Admin only)
  async getDistrictHistoricalAnalytics(token?: string): Promise<ApiResponseType<Array<{
    id: string;
    timestamp: string;
    date: string;
    fullDate: string;
    totalWords: number;
    totalEntries: number;
    activeSchools: number;
    activeStudents: number;
  }>>> {
    return api.get('/api/district-admin/analytics/historical', token);
  },

  // Get class analytics (Super Admin only)
  async getClassAnalytics(classId: string, token?: string): Promise<ApiResponseType<AnalyzedData>> {
    return api.get(`/api/super-admin/classes/${classId}/analytics`, token);
  },

  async getClassHistoricalAnalytics(classId: string, token?: string): Promise<ApiResponseType<Array<{
    id: string;
    timestamp: string;
    date: string;
    fullDate: string;
    totalWords: number;
    totalEntries: number;
    activeStudents: number;
    avgWordsPerStudent: number;
  }>>> {
    return api.get(`/api/super-admin/classes/${classId}/analytics/historical`, token);
  },

  // Get class analytics (District Admin only)
  async getDistrictAdminClassAnalytics(classId: string, token?: string): Promise<ApiResponseType<AnalyzedData>> {
    return api.get(`/api/district-admin/classes/${classId}/analytics`, token);
  },

  async getDistrictAdminClassHistoricalAnalytics(classId: string, token?: string): Promise<ApiResponseType<Array<{
    id: string;
    timestamp: string;
    date: string;
    fullDate: string;
    totalWords: number;
    totalEntries: number;
    activeStudents: number;
    avgWordsPerStudent: number;
  }>>> {
    return api.get(`/api/district-admin/classes/${classId}/analytics/historical`, token);
  },

  // Get school admin flagged students (School Admin only)
  async getSchoolFlaggedStudents(token?: string) {
    return api.get('/api/school-admin/mental-health/flagged-students', token);
  },

  // Get class analytics (School Admin only)
  async getSchoolAdminClassAnalytics(classId: string, token?: string): Promise<ApiResponseType<AnalyzedData>> {
    return api.get(`/api/school-admin/classes/${classId}/analytics`, token);
  },

  async getSchoolAdminClassHistoricalAnalytics(classId: string, token?: string): Promise<ApiResponseType<Array<{
    id: string;
    timestamp: string;
    date: string;
    fullDate: string;
    totalWords: number;
    totalEntries: number;
    activeStudents: number;
    avgWordsPerStudent: number;
  }>>> {
    return api.get(`/api/school-admin/classes/${classId}/analytics/historical`, token);
  },
};

// Super Admin School Management API functions
export const superAdminSchoolApi = {
  // Create school (unassigned by default)
  async createSchool(data: { name: string; address?: string; zipCode?: string }, token?: string): Promise<ApiResponseType<{ message: string; schoolId: string }>> {
    return api.post('/api/super-admin/create-school', data, token);
  },

  // Get unassigned schools
  async getUnassignedSchools(token?: string): Promise<ApiResponseType<{ schools: any[]; count: number }>> {
    return api.get('/api/super-admin/get-unassigned-schools', token);
  },

  // Update school
  async updateSchool(schoolId: string, data: { name?: string; address?: string; zipCode?: string }, token?: string): Promise<ApiResponseType<{ message: string }>> {
    return api.put(`/api/super-admin/update-school/${schoolId}`, data, token);
  },

  // Delete school
  async deleteSchool(schoolId: string, token?: string): Promise<ApiResponseType<{ message: string }>> {
    return api.delete(`/api/super-admin/delete-school/${schoolId}`, token);
  },

  // Assign school to district
  async assignSchoolToDistrict(data: { schoolId: string; districtId: string }, token?: string): Promise<ApiResponseType<{ message: string }>> {
    return api.post('/api/super-admin/assign-school-to-district', data, token);
  },

  // Unassign school from district
  async unassignSchoolFromDistrict(data: { schoolId: string }, token?: string): Promise<ApiResponseType<{ message: string }>> {
    return api.post('/api/super-admin/unassign-school-from-district', data, token);
  },

  // Toggle school status
  async toggleSchoolStatus(schoolId: string, token?: string): Promise<ApiResponseType<{ message: string }>> {
    return api.put(`/api/super-admin/toggle-school-status/${schoolId}`, {}, token);
  },
};

// =============================================================================
// RESOURCE MANAGEMENT API
// =============================================================================

import { 
  Resource, 
  ResourceAssignment, 
  CreateResourceRequest, 
  UpdateResourceRequest, 
  AssignResourceRequest 
} from './types';

export const resourceApi = {
  // Create Resource (Super Admin only)
  async createResource(data: CreateResourceRequest, token?: string): Promise<{ 
    message: string; 
    resourceId: string; 
    resource: Resource 
  }> {
    return api.post('/api/super-admin/resources', data, token);
  },

  // Get Resources (Super Admin only)
  async getResources(params?: {
    status?: 'active' | 'archived' | 'all';
    limit?: number;
    offset?: number;
  }, token?: string): Promise<{
    resources: Resource[];
    count: number;
    pagination: { limit: number; offset: number };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    const queryString = searchParams.toString();
    const endpoint = `/api/super-admin/resources${queryString ? `?${queryString}` : ''}`;
    
    return api.get(endpoint, token);
  },

  // Update Resource (Super Admin only)
  async updateResource(resourceId: string, data: UpdateResourceRequest, token?: string): Promise<{
    message: string;
    resourceId: string;
  }> {
    return api.put(`/api/super-admin/resources/${resourceId}`, data, token);
  },

  // Delete Resource (Super Admin only) - Soft delete
  async deleteResource(resourceId: string, token?: string): Promise<{
    message: string;
    resourceId: string;
  }> {
    return api.delete(`/api/super-admin/resources/${resourceId}`, token);
  },

  // Assign Resource (Super Admin only)
  async assignResource(data: AssignResourceRequest, token?: string): Promise<{
    message: string;
    assignmentId: string;
    assignment: ResourceAssignment;
  }> {
    return api.post('/api/super-admin/resources/assign', data, token);
  },

  // Get Resource Assignments (Super Admin only)
  async getResourceAssignments(params?: {
    resourceId?: string;
    assignedTo?: string;
    targetType?: 'district' | 'school' | 'class';
    targetId?: string;
    status?: 'active' | 'archived' | 'all';
  }, token?: string): Promise<{
    assignments: ResourceAssignment[];
    count: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.resourceId) searchParams.append('resourceId', params.resourceId);
    if (params?.assignedTo) searchParams.append('assignedTo', params.assignedTo);
    if (params?.targetType) searchParams.append('targetType', params.targetType);
    if (params?.targetId) searchParams.append('targetId', params.targetId);
    if (params?.status) searchParams.append('status', params.status);
    
    const queryString = searchParams.toString();
    const endpoint = `/api/super-admin/resources/assignments${queryString ? `?${queryString}` : ''}`;
    
    return api.get(endpoint, token);
  },
}; 

// =============================================================================
// DISTRICT ADMIN RESOURCE MANAGEMENT API
// =============================================================================

export const districtAdminResourceApi = {
  // Get Resources assigned to District Admin
  async getAssignedResources(params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'archived' | 'all';
    type?: string;
  }, token?: string): Promise<{
    resources: Resource[];
    count: number;
    totalPages: number;
    currentPage: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    
    const queryString = searchParams.toString();
    const endpoint = `/api/district-admin/resources${queryString ? `?${queryString}` : ''}`;
    
    return api.get(endpoint, token);
  },

  // Assign Resource to School Admin
  async assignResourceToSchoolAdmin(data: {
    resourceId: string;
    schoolAdminId: string;
    targetSchoolId: string;
  }, token?: string): Promise<{
    message: string;
    assignmentId: string;
  }> {
    return api.post('/api/district-admin/resources/assign', data, token);
  },

  // Get Resource Assignments made by District Admin
  async getResourceAssignments(params?: {
    page?: number;
    limit?: number;
    resourceId?: string;
  }, token?: string): Promise<{
    assignments: any[];
    count: number;
    totalPages: number;
    currentPage: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.resourceId) searchParams.append('resourceId', params.resourceId);
    
    const queryString = searchParams.toString();
    const endpoint = `/api/district-admin/resource-assignments${queryString ? `?${queryString}` : ''}`;
    
    return api.get(endpoint, token);
  },

  // Get Available School Admins for assignment
  async getAvailableSchoolAdmins(token?: string): Promise<{
    schoolAdmins: Array<{
      uid: string;
      email: string;
      displayName: string;
      schoolId: string;
      school: { id: string; name: string } | null;
    }>;
    schools: Array<{
      id: string;
      name: string;
      districtId: string;
    }>;
  }> {
    return api.get('/api/district-admin/school-admins', token);
  },
}; 

// =============================================================================
// SCHOOL ADMIN RESOURCE MANAGEMENT API
// =============================================================================

export const schoolAdminResourceApi = {
  // Get Resources assigned to School Admin
  async getAssignedResources(params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'archived' | 'all';
    type?: string;
  }, token?: string): Promise<{
    resources: Resource[];
    count: number;
    totalPages: number;
    currentPage: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    
    const queryString = searchParams.toString();
    const endpoint = `/api/school-admin/resources/assigned${queryString ? `?${queryString}` : ''}`;
    
    return api.get(endpoint, token);
  },

  // Assign Resource to Teacher
  async assignResourceToTeacher(data: {
    resourceId: string;
    teacherId: string;
    targetClassId?: string;
  }, token?: string): Promise<{
    message: string;
    assignmentId: string;
  }> {
    return api.post('/api/school-admin/resources/assign-to-teacher', data, token);
  },

  // Get Resource Assignments made by School Admin
  async getResourceAssignments(params?: {
    page?: number;
    limit?: number;
    resourceId?: string;
  }, token?: string): Promise<{
    assignments: any[];
    count: number;
    totalPages: number;
    currentPage: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.resourceId) searchParams.append('resourceId', params.resourceId);
    
    const queryString = searchParams.toString();
    const endpoint = `/api/school-admin/resources/assignments${queryString ? `?${queryString}` : ''}`;
    
    return api.get(endpoint, token);
  },

  // Get Available Teachers for assignment
  async getAvailableTeachers(token?: string): Promise<{
    teachers: Array<{
      uid: string;
      email: string;
      displayName: string;
      classes: Array<{
        id: string;
        gradeName: string;
        division: string;
        studentCount: number;
        maxStudents: number;
      }>;
    }>;
    classes: Array<{
      id: string;
      gradeName: string;
      division: string;
      teacherId: string;
      teacherName: string;
      studentCount: number;
      maxStudents: number;
      status: string;
    }>;
  }> {
    return api.get('/api/school-admin/resources/teachers', token);
  },
}; 

// =============================================================================
// TEACHER RESOURCE MANAGEMENT API
// =============================================================================

export const teacherResourceApi = {
  // Get Assigned Resources
  async getAssignedResources(params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'draft' | 'all';
    category?: string;
    topic?: string;
  }, token?: string): Promise<{
    resources: Array<{
      id: string;
      title: string;
      description: string;
      url: string;
      category: string;
      topic: string;
      status: 'active' | 'draft';
      assignmentInfo: {
        assignedAt: string;
        assignedBy: string;
        assignerName: string;
        assignerEmail: string;
        assignmentId: string;
        targetType: 'teacher' | 'class';
        targetId: string;
      };
    }>;
    count: number;
    totalPages: number;
    currentPage: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.topic) searchParams.append('topic', params.topic);
    
    const queryString = searchParams.toString();
    const endpoint = `/api/teachers/resources/assigned${queryString ? `?${queryString}` : ''}`;
    
    return api.get(endpoint, token);
  },

  // Get Resource Details
  async getResourceDetails(resourceId: string, token?: string): Promise<{
    resource: {
      id: string;
      title: string;
      description: string;
      url: string;
      category: string;
      topic: string;
      status: 'active' | 'draft';
      createdAt: string;
      updatedAt: string;
    };
  }> {
    return api.get(`/api/teachers/resources/details/${resourceId}`, token);
  },

  // Share Resource with Students
  async shareResourceWithStudents(data: {
    resourceId: string;
    studentIds?: string[];
    classId?: string;
    message?: string;
  }, token?: string): Promise<{
    message: string;
  }> {
    return api.post('/api/teachers/resources/share', data, token);
  },

  // Get Shared Resources
  async getSharedResources(params?: {
    page?: number;
    limit?: number;
    resourceId?: string;
  }, token?: string): Promise<{
    assignments: Array<{
      id: string;
      resourceId: string;
      assignedAt: string;
      message: string;
      resource: {
        id: string;
        title: string;
        description: string;
        url: string;
        category: string;
        topic: string;
      };
      student: {
        uid: string;
        email: string;
        displayName: string;
        customClaims: any;
      };
    }>;
    count: number;
    totalPages: number;
    currentPage: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.resourceId) searchParams.append('resourceId', params.resourceId);
    
    const queryString = searchParams.toString();
    const endpoint = `/api/teachers/resources/shared${queryString ? `?${queryString}` : ''}`;
    
    return api.get(endpoint, token);
  },

  // Get Delivered Resources
  async getDeliveredResources(params?: {
    page?: number;
    limit?: number;
    studentId?: string;
    issueType?: string;
  }, token?: string): Promise<{
    deliveredResources: Array<{
      id: string;
      resourceId: string;
      title: string;
      description: string;
      url: string;
      category: string;
      issueType: string;
      deliveredAt: string;
      deliveredReason: string;
      viewedAt: string | null;
      studentId: string;
      student: {
        uid: string;
        displayName: string;
        email: string;
        districtId: string;
        schoolId: string;
        dateFirstFlagged: string | null;
        dateLastFlagged: string | null;
        deliveredResourcesCount: number;
        resourcesDelivered: boolean;
        resourcesDeliveredAt: string | null;
      };
      flags: Array<{
        id: string;
        studentId: string;
        studentName: string;
        issueType: string;
        flagCount: number;
        resourcesDelivered: boolean;
        dateFirstFlagged: string;
        dateLastFlagged: string;
      }>;
      totalFlagCount: number;
      flagsByType: Record<string, number>;
      excerpts: string[];
      lastAnalysisDate: string | null;
    }>;
    count: number;
    totalPages: number;
    currentPage: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.studentId) searchParams.append('studentId', params.studentId);
    if (params?.issueType) searchParams.append('issueType', params.issueType);
    
    const queryString = searchParams.toString();
    const endpoint = `/api/teachers/resources/delivered${queryString ? `?${queryString}` : ''}`;
    
    return api.get(endpoint, token);
  },

  // Get Teacher Info (for proper class information)
  async getTeacherInfo(token?: string): Promise<{
    teacher: {
      uid: string;
      email: string;
      displayName: string;
      customClaims: any;
      classInfo: {
        classId: string;
        className: string;
        gradeName: string;
        division: string;
        gradeId: string;
        schoolId: string;
        schoolName: string;
        districtId: string;
        districtName: string;
      };
    };
  }> {
    return api.get('/api/teachers/info', token);
  },

  // Mental Health Analysis API
  async analyzeMentalHealth(token?: string): Promise<{
    success: boolean;
    data: Array<{
      studentId: string;
      studentName: string;
      email: string;
      totalIssues: number;
      flaggedIssues: number;
      lastAnalyzed: string;
      overallRisk: 'low' | 'medium' | 'high' | 'critical';
      issues: Array<{
        id: string;
        studentId: string;
        studentName: string;
        issueType: 'bullying' | 'depression' | 'lack-of-english';
        severity: 'low' | 'medium' | 'high' | 'critical';
        count: number;
        firstDetected: string;
        lastDetected: string;
        isFlagged: boolean;
        journalExcerpts: string[];
        confidence: number;
      }>;
    }>;
    summary: {
      totalStudents: number;
      flaggedStudents: number;
      highRiskStudents: number;
      totalIssues: number;
    };
  }> {
    return api.post('/api/teachers/mental-health/analyze', {}, token);
  },

  async getMentalHealthAnalysis(token?: string): Promise<{
    success: boolean;
    data: Array<{
      studentId: string;
      studentName: string;
      email: string;
      totalIssues: number;
      flaggedIssues: number;
      lastAnalyzed: string;
      overallRisk: 'low' | 'medium' | 'high' | 'critical';
      issues: Array<{
        id: string;
        studentId: string;
        studentName: string;
        issueType: 'bullying' | 'depression' | 'lack-of-english';
        severity: 'low' | 'medium' | 'high' | 'critical';
        count: number;
        firstDetected: string;
        lastDetected: string;
        isFlagged: boolean;
        journalExcerpts: string[];
        confidence: number;
      }>;
    }>;
    summary: {
      totalStudents: number;
      flaggedStudents: number;
      highRiskStudents: number;
      totalIssues: number;
    };
  }> {
    return api.get('/api/teachers/mental-health/results', token);
  },
}; 

export const districtAdminAnalyticsApi = {
  async getFlaggedStudentsReport(token?: string) {
    return api.get('/api/district-admin/mental-health/flagged-students', token);
  }
};

export const schoolAdminAnalyticsApi = {
  async getFlaggedStudentsReport(token?: string) {
    return api.get('/api/school-admin/mental-health/flagged-students', token);
  }
};

export const teacherAnalyticsApi = {
  async getFlaggedStudentsReport(token?: string) {
    return api.get('/api/teachers/mental-health/flagged-students', token);
  }
}; 