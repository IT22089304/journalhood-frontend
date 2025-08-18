import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import type { User } from '@/lib/types';

interface SchoolAdmin {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  disabled: boolean;
  customClaims?: {
    role: string;
    districtId?: string;
    districtName?: string;
    schoolId?: string;
    schoolName?: string;
  };
  metadata: {
    creationTime: string;
    lastSignInTime?: string;
  };
}

interface UseSchoolAdminsReturn {
  schoolAdmins: User[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createSchoolAdmin: (data: {
    email: string;
    name: string;
    phone?: string;
    schoolId: string;
  }) => Promise<void>;
  updateSchoolAdmin: (uid: string, data: {
    email: string;
    name: string;
    phone?: string;
    schoolId: string;
  }) => Promise<void>;
  deleteSchoolAdmin: (uid: string) => Promise<void>;
  toggleSchoolAdminStatus: (uid: string) => Promise<void>;
}

export const useSchoolAdmins = (): UseSchoolAdminsReturn => {
  const [schoolAdmins, setSchoolAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token, refreshToken } = useAuth();
  const { toast } = useToast();

  const fetchSchoolAdmins = async () => {
    if (!token) {
      console.error('No authentication token available');
      setError('Authentication token not available');
      return;
    }

    if (!user?.districtId) {
      console.error('No district ID available:', user);
      setError('District ID not available');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching school admins with district ID:', user.districtId);
      
      // Fetch both school admins and schools data
      const [adminsResponse, schoolsResponse] = await Promise.all([
        api.get<{ schoolAdmins: SchoolAdmin[] }>(
          `/api/district-admin/get-school-admins?districtId=${user.districtId}`,
          token
        ),
        api.get<{ schools: any[] }>(
          `/api/district-admin/schools?districtId=${user.districtId}`,
          token
        )
      ]);

      // Create a map of schools for easy lookup
      const schoolsMap = schoolsResponse.schools.reduce((map, school) => {
        map[school.id] = school;
        return map;
      }, {} as Record<string, any>);

      // Transform Firebase Auth users into our User type
      const transformedAdmins: User[] = adminsResponse.schoolAdmins.map(admin => {
        const schoolId = admin.customClaims?.schoolId || '';
        const school = schoolsMap[schoolId];

        return {
          id: admin.uid,
          email: admin.email,
          name: admin.displayName || admin.email.split('@')[0],
          displayName: admin.displayName || admin.email.split('@')[0],
          phoneNumber: admin.phoneNumber || '',
          role: 'school-admin',
          status: admin.disabled ? 'suspended' : 'active',
          districtId: user.districtId,
          districtName: user.districtName || '',
          schoolId: schoolId,
          schoolName: school?.name || 'No School Assigned',
          schoolAddress: school?.address || '',
          schoolZipCode: school?.zipCode || '',
          createdAt: new Date(admin.metadata.creationTime),
          updatedAt: admin.metadata.lastSignInTime 
            ? new Date(admin.metadata.lastSignInTime)
            : new Date(admin.metadata.creationTime),
        };
      });

      setSchoolAdmins(transformedAdmins);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch school admins';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    if (token && user?.districtId) {
      fetchSchoolAdmins();
    }
  }, [token, user?.districtId]);

  const createSchoolAdmin = async (data: {
    email: string;
    name: string;
    phone?: string;
    schoolId: string;
  }) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    if (!user?.districtId) {
      throw new Error('District ID not available');
    }

    try {
      await api.post('/api/district-admin/create-school-admin', {
        email: data.email,
        name: data.name,
        phone: data.phone,
        districtId: user.districtId,
        schoolId: data.schoolId
      }, token);

      toast({
        title: 'Success',
        description: 'School admin created successfully',
      });

      await fetchSchoolAdmins();
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create school admin';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateSchoolAdmin = async (uid: string, data: {
    email: string;
    name: string;
    phone?: string;
    schoolId: string;
  }) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    if (!user?.districtId) {
      throw new Error('District ID not available');
    }

    try {
      await api.put(`/api/district-admin/update-school-admin/${uid}`, {
        ...data,
        districtId: user.districtId
      }, token);

      toast({
        title: 'Success',
        description: 'School admin updated successfully',
      });

      await fetchSchoolAdmins();
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update school admin';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteSchoolAdmin = async (uid: string) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    try {
      await api.delete(`/api/district-admin/delete-school-admin/${uid}`, token);

      toast({
        title: 'Success',
        description: 'School admin deleted successfully',
      });

      await fetchSchoolAdmins();
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete school admin';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const toggleSchoolAdminStatus = async (uid: string) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    try {
      await api.put(`/api/district-admin/suspend-school-admin/${uid}`, {}, token);

      toast({
        title: 'Success',
        description: 'School admin status updated successfully',
      });

      await fetchSchoolAdmins();
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update school admin status';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    schoolAdmins,
    loading,
    error,
    refetch: fetchSchoolAdmins,
    createSchoolAdmin,
    updateSchoolAdmin,
    deleteSchoolAdmin,
    toggleSchoolAdminStatus,
  };
}; 