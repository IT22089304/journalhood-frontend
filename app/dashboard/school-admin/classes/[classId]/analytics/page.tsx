"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/dashboard-layout";
import { GraduationCap, Users, TrendingUp, ArrowLeft, ExternalLink } from "lucide-react";
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from "@/components/ui/button";
import { analyticsApi } from '@/lib/api';
import { AnalyzedData } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const navigation = [
  { title: "Classes", url: "/dashboard/school-admin/classes", icon: GraduationCap },
  { title: "Teachers", url: "/dashboard/school-admin/teachers", icon: Users },
  { title: "Analytics", url: "/dashboard/school-admin/analytics", icon: TrendingUp },
  { title: "Resources", url: "/dashboard/school-admin/resources", icon: ExternalLink },
];

export default function SchoolAdminClassAnalytics() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const classId = typeof params?.classId === 'string' ? params.classId : '';

  const [analytics, setAnalytics] = useState<AnalyzedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [className, setClassName] = useState<string>('');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error('No authentication token available');
      }
      if (!classId) {
        throw new Error('No class ID provided');
      }
      // Use the school admin endpoint
      const response = await analyticsApi.getSchoolAdminClassAnalytics(classId, token);
      setAnalytics(response.data);
      if (response.data?.classStats?.[classId]) {
        setClassName(response.data.classStats[classId].className);
      }
      const historicalResponse = await analyticsApi.getSchoolAdminClassHistoricalAnalytics(classId, token);
      if (historicalResponse?.data) {
        setHistoricalData(historicalResponse.data);
      }
    } catch (err: any) {
      console.error('Error loading class analytics:', err);
      setError(err.message || 'Failed to load class analytics');
      toast({
        title: "Error",
        description: err.message || "Failed to load class analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && classId) {
      loadAnalytics();
    }
  }, [token, classId]);

  if (loading) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="School Admin"
        userName={user?.displayName || "School Admin"}
        userEmail={user?.email || ""}
      >
        <div className="container mx-auto p-6">
          <div className="text-center">Loading class analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analytics) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="School Admin"
        userName={user?.displayName || "School Admin"}
        userEmail={user?.email || ""}
      >
        <div className="container mx-auto p-6">
          <div className="text-center text-red-500">{error || 'No analytics data available'}</div>
        </div>
      </DashboardLayout>
    );
  }

  const classStats = analytics.classStats[classId];
  if (!classStats) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="School Admin"
        userName={user?.displayName || "School Admin"}
        userEmail={user?.email || ""}
      >
        <div className="container mx-auto p-6">
          <div className="text-center text-red-500">Class not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      navigation={navigation}
      userRole="School Admin"
      userName={user?.displayName || "School Admin"}
      userEmail={user?.email || ""}
    >
      <div className="container mx-auto p-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Button>
            <h1 className="text-2xl font-bold">{className} Analytics</h1>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Words</CardTitle>
              <CardDescription>In this class</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{classStats.totalWords?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Entries</CardTitle>
              <CardDescription>Journal entries</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{classStats.totalEntries?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Students</CardTitle>
              <CardDescription>Students with entries</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{classStats.activeStudents || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avg Words/Student</CardTitle>
              <CardDescription>Average word count per student</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{classStats.avgWordsPerStudent?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Historical Trends */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Historical Analytics</CardTitle>
            <CardDescription>Class trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="totalWords" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    name="Total Words"
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalEntries" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Total Entries"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activeStudents" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Active Students"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgWordsPerStudent" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Avg Words/Student"
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Student Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Student Statistics</CardTitle>
            <CardDescription>Analytics breakdown by student</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Total Words</TableHead>
                  <TableHead>Avg Words/Entry</TableHead>
                  <TableHead>Total Entries</TableHead>
                  <TableHead>Last Entry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(analytics.studentStats)
                  .filter(([_, stats]) => stats.classId === classId)
                  .map(([studentId, stats]) => (
                    <TableRow 
                      key={studentId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {stats.studentName}
                      </TableCell>
                      <TableCell>{stats.totalWords?.toLocaleString() || 0}</TableCell>
                      <TableCell>{stats.avgWordsPerEntry?.toLocaleString() || 0}</TableCell>
                      <TableCell>{stats.totalEntries?.toLocaleString() || 0}</TableCell>
                      <TableCell>{typeof (stats as any)?.lastEntryDate === 'string' && (stats as any)?.lastEntryDate ? new Date((stats as any).lastEntryDate).toLocaleDateString() : 'Never'}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 