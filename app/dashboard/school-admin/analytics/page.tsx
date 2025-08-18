"use client"

import { useEffect, useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard-layout";
import { BarChart3, GraduationCap, Users, TrendingUp, RefreshCw, ExternalLink } from "lucide-react";
import { useAuth } from '@/lib/firebase/auth-context';
import { analyticsApi } from '@/lib/api';
import { AnalyzedData } from '@/lib/types';
import { useToast } from "@/components/ui/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays } from 'date-fns';

const navigation = [
  { title: "Classes", url: "/dashboard/school-admin/classes", icon: GraduationCap },
  { title: "Teachers", url: "/dashboard/school-admin/teachers", icon: Users },
  { title: "Analytics", url: "/dashboard/school-admin/analytics", icon: TrendingUp, isActive: true },
  { title: "Resources", url: "/dashboard/school-admin/resources", icon: ExternalLink },
];

export default function SchoolAdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyzedData | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!token) {
          setError('Missing authentication token.');
          setLoading(false);
          return;
        }
        const schoolId = user?.customClaims?.schoolId;
        if (!schoolId) {
          setError('No school ID found for this user.');
          setLoading(false);
          return;
        }
        const [analyticsResponse, historicalResponse] = await Promise.all([
          analyticsApi.getSchoolAnalytics(schoolId, token),
          analyticsApi.getSchoolHistoricalAnalytics(schoolId, token)
        ]);
        setAnalytics(analyticsResponse.data);
        setHistoricalData((historicalResponse as any).data || []);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [token, user?.customClaims?.schoolId]);

  if (loading) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="School Admin"
        userName={user?.displayName || "School Admin"}
        userEmail={user?.email || "admin@journalhood.com"}
      >
        <div className="flex items-center justify-center min-h-screen">Loading...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="School Admin"
        userName={user?.displayName || "School Admin"}
        userEmail={user?.email || "admin@journalhood.com"}
      >
        <div className="container mx-auto p-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-red-500 p-4">{error}</div>
          </div>
      </div>
      </DashboardLayout>
    );
  }

  // Get school stats
  const schoolId = user?.customClaims?.schoolId;
  const schoolData = analytics && schoolId && analytics.schoolStats[schoolId] ? analytics.schoolStats[schoolId] : {
    schoolName: (user && user.customClaims && typeof (user.customClaims as any).schoolName === 'string') ? (user.customClaims as any).schoolName : 'School',
    totalWords: 0,
    totalEntries: 0,
    activeStudents: 0,
    avgWordsPerStudent: 0,
  };

  // Get class stats for this school
  const classStats = analytics && analytics.classStats ?
    Object.entries(analytics.classStats).filter(([_, stats]) => stats.schoolId === schoolId) :
    [];

  // Use real historical data or fallback to current data point
  const getSchoolDailyData = () => {
    if (historicalData.length > 0) {
      return historicalData;
    } else if (schoolData) {
      return [{
        date: format(new Date(), 'MMM dd'),
        fullDate: format(new Date(), 'yyyy-MM-dd'),
        avgWordsPerStudent: schoolData.avgWordsPerStudent,
        totalEntries: schoolData.totalEntries,
        totalWords: schoolData.totalWords,
        activeStudents: schoolData.activeStudents
      }];
    } else {
      return [];
    }
  };
  const schoolDailyData = getSchoolDailyData();

  return (
    <DashboardLayout
      navigation={navigation}
      userRole="School Admin"
      userName={user?.displayName || "School Admin"}
      userEmail={user?.email || "admin@journalhood.com"}
    >
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{schoolData.schoolName} Analytics</h1>
            <p className="text-gray-600">School-wide writing activity and engagement insights</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Words</CardTitle>
              <CardDescription>Across all journals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{schoolData ? schoolData.totalWords.toLocaleString() : 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Entries</CardTitle>
              <CardDescription>All journal entries</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{schoolData ? schoolData.totalEntries.toLocaleString() : 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Students</CardTitle>
              <CardDescription>Students with entries</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{schoolData ? schoolData.activeStudents : 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avg Words/Student</CardTitle>
              <CardDescription>School average</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{schoolData ? schoolData.avgWordsPerStudent.toLocaleString() : 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Historical Trends Line Chart */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle>School Activity Trends (Real Historical Data)</CardTitle>
            <CardDescription>Track your school's actual writing activity based on analysis reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={schoolDailyData}>
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
                    formatter={(value, name) => [
                      value,
                      name === 'totalWords' ? 'Total Words' : 
                      name === 'totalEntries' ? 'Total Entries' : 
                      'Active Students'
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="totalWords" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Total Words"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalEntries" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Total Entries"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activeStudents" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Active Students"
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Class Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Class Statistics</CardTitle>
            <CardDescription>Analytics breakdown by class</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead className="text-right">Total Words</TableHead>
                  <TableHead className="text-right">Total Entries</TableHead>
                  <TableHead className="text-right">Active Students</TableHead>
                  <TableHead className="text-right">Avg Words/Student</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classStats.length > 0 ? (
                  classStats.map(([classId, stats]) => (
                    <TableRow key={classId} className="cursor-pointer hover:bg-gray-50" onClick={() => window.location.href = `/dashboard/school-admin/classes/${classId}/analytics`}>
                      <TableCell>{stats.className}</TableCell>
                      <TableCell className="text-right">{stats.totalWords.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{stats.totalEntries.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{stats.activeStudents}</TableCell>
                      <TableCell className="text-right">{stats.avgWordsPerStudent.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      0
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
