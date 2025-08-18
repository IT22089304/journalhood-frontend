import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface DistrictAdmin {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  disabled: boolean;
  customClaims?: {
    role: string;
    districtId?: string;
    districtName?: string;
  };
  metadata: {
    creationTime: string;
    lastSignInTime?: string;
  };
}

interface UseDistrictAdminsReturn {
  districtAdmins: DistrictAdmin[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createDistrictAdmin: (data: {
    email: string;
    name: string;
    phone?: string;
    districtId: string;
  }) => Promise<{ success: boolean; message: string; data: { emailSent: boolean; id: string; email: string; } }>;
  updateDistrictAdmin: (uid: string, data: {
    email: string;
    name: string;
    phone?: string;
    districtId: string;
  }) => Promise<void>;
  deleteDistrictAdmin: (uid: string) => Promise<void>;
  toggleDistrictAdminStatus: (uid: string) => Promise<void>;
}

export const useDistrictAdmins = (): UseDistrictAdminsReturn => {
  const [districtAdmins, setDistrictAdmins] = useState<DistrictAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const { toast } = useToast();

  const fetchDistrictAdmins = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await api.get<{ districtAdmins: DistrictAdmin[] }>(
        `/api/super-admin/get-district-admins?_t=${timestamp}`,
        token
      );
      setDistrictAdmins(response.districtAdmins || []);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch district admins';
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

  const createDistrictAdmin = async (data: {
    email: string;
    name: string;
    phone?: string;
    districtId: string;
  }) => {
    if (!token) throw new Error('No authentication token');

    try {
      const response = await api.post<{ 
        success: boolean; 
        message: string; 
        data: { 
          emailSent: boolean; 
          id: string; 
          email: string; 
        } 
      }>(
        '/api/super-admin/create-district-admin', 
        data, 
        token
      );
      
      // Show success message with email status
      if (response.success) {
        toast({
          title: 'Success',
          description: response.data.emailSent 
            ? "District admin created successfully! Welcome email sent via Firebase." 
            : "District admin created successfully! Email delivery pending.",
        });
      }
      
      // Wait a moment for Firebase to process custom claims, then refetch
      setTimeout(() => {
        fetchDistrictAdmins();
      }, 1000);
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create district admin';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateDistrictAdmin = async (uid: string, data: {
    email: string;
    name: string;
    phone?: string;
    districtId: string;
  }) => {
    if (!token) throw new Error('No authentication token');

    try {
      await api.put(`/api/super-admin/update-district-admin/${uid}`, data, token);
      toast({
        title: 'Success',
        description: 'District admin updated successfully',
      });
      await fetchDistrictAdmins(); // Refetch data
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update district admin';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteDistrictAdmin = async (uid: string) => {
    if (!token) throw new Error('No authentication token');

    try {
      await api.delete(`/api/super-admin/delete-district-admin/${uid}`, token);
      toast({
        title: 'Success',
        description: 'District admin deleted successfully',
      });
      await fetchDistrictAdmins(); // Refetch data
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete district admin';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const toggleDistrictAdminStatus = async (uid: string) => {
    if (!token) throw new Error('No authentication token');

    try {
      await api.put(`/api/super-admin/suspend-district-admin/${uid}`, {}, token);
      toast({
        title: 'Success',
        description: 'District admin status updated successfully',
      });
      await fetchDistrictAdmins(); // Refetch data
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update district admin status';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchDistrictAdmins();
  }, [token]);

  return {
    districtAdmins,
    loading,
    error,
    refetch: fetchDistrictAdmins,
    createDistrictAdmin,
    updateDistrictAdmin,
    deleteDistrictAdmin,
    toggleDistrictAdminStatus,
  };
}; 