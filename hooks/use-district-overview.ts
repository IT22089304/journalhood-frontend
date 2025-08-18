import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { api } from '@/lib/api';

export interface SchoolOverview {
  id: string;
  name: string;
  address: string;
  students: number;
  teachers: number;
  classes: number;
  engagement: number;
  sentiment: 'Very Positive' | 'Positive' | 'Neutral' | 'Negative' | 'Very Negative';
  admin: {
    id: string;
    name: string;
  } | null;
}

export interface DistrictOverview {
  totalSchools: number;
  totalStudents: number;
  totalTeachers: number;
  averageEngagement: number;
  schools: SchoolOverview[];
  monthlyChanges: {
    schools: number;
    students: number;
    teachers: number;
    engagement: number;
  };
}

export function useDistrictOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DistrictOverview | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    async function fetchOverview() {
      if (!user?.id || !token) return;

      try {
        setLoading(true);
        setError(null);

        const response = await api.get<DistrictOverview>(`/api/district-admin/overview?districtId=${user.id}`, token);
        setData(response);
      } catch (err) {
        console.error('Error fetching district overview:', err);
        setError('Failed to load district overview data');
      } finally {
        setLoading(false);
      }
    }

    fetchOverview();
  }, [user?.id, token]);

  return { data, loading, error };
} 