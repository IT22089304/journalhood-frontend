"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from '@/lib/firebase/auth-context';
import { GraduationCap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import { teacherApi, teacherAnalyticsApi } from '@/lib/api';

const navigation = [
  { title: "Students", url: "/dashboard/teacher/students", icon: GraduationCap },
  { title: "Analytics", url: "/dashboard/teacher/analytics", icon: TrendingUp, isActive: true },
];

export default function TeacherAnalytics() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    totalStudents: 0,
    activeStudents: 0,
    avgWordCount: 0,
    totalEntries: 0,
    weeklyEntries: 0,
    monthlyEntries: 0,
  });

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        setError(null);
        const resp = await teacherApi.getDashboardData(token);

        // Update students immediately
        setStudents(resp.students || []);

        // Start with backend-provided analytics
        let nextAnalytics: any = {
          ...(resp.analytics || {})
        };

        // Derive/override key metrics using analyzed data if available
        try {
          const analyzed = await teacherAnalyticsApi.getTeacherAnalytics(token);
          const studentStats = analyzed?.data?.studentStats || analyzed?.studentStats || {};

          if (studentStats && typeof studentStats === 'object') {
            const stats = Object.values(studentStats as Record<string, any>);

            const totalStudentsFromList = resp.students?.length || nextAnalytics.totalStudents || 0;
            const activeStudentsFromStats = stats.filter((s: any) => (s.totalEntries || 0) > 0).length;
            const totalEntriesFromStats = stats.reduce((sum: number, s: any) => sum + (s.totalEntries || 0), 0);
            const totalWordsFromStats = stats.reduce((sum: number, s: any) => sum + (s.totalWords || 0), 0);
            const avgWordFromStats = totalEntriesFromStats > 0 ? Math.round(totalWordsFromStats / totalEntriesFromStats) : 0;

            nextAnalytics = {
              ...nextAnalytics,
              totalStudents: totalStudentsFromList,
              activeStudents: activeStudentsFromStats || nextAnalytics.activeStudents || 0,
              totalEntries: totalEntriesFromStats || nextAnalytics.totalEntries || 0,
              avgWordCount: avgWordFromStats || nextAnalytics.avgWordCount || 0,
            };
          }
        } catch (e) {
          // If analyzed data is unavailable, fall back to backend values silently
        }

        // Additional fallbacks using students list if needed
        const fallbackActive = (resp.students || []).filter((s: any) => (s.journalEntries || 0) > 0).length;
        const fallbackTotalEntries = (resp.students || []).reduce((sum: number, s: any) => sum + (s.journalEntries || 0), 0);
        if (!nextAnalytics.activeStudents) nextAnalytics.activeStudents = fallbackActive;
        if (!nextAnalytics.totalStudents) nextAnalytics.totalStudents = (resp.students || []).length;
        if (!nextAnalytics.totalEntries) nextAnalytics.totalEntries = fallbackTotalEntries;
        if (!nextAnalytics.avgWordCount && (nextAnalytics.weeklyAvgWords || nextAnalytics.monthlyAvgWords)) {
          nextAnalytics.avgWordCount = Math.round((nextAnalytics.weeklyAvgWords || nextAnalytics.monthlyAvgWords) || 0);
        }

        setAnalytics(nextAnalytics);
      } catch (e: any) {
        setError(e?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const dailyData = useMemo(() => {
    // Approximate daily trend from weekly/monthly entries
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const weekly = Number(analytics.weeklyEntries || 0);
    const avg = Math.max(0, Math.round(weekly / 7));
    return days.map((d, i) => ({
      date: d,
      avgWordsPerStudent: analytics.avgWordCount || 0,
      totalEntries: i < 6 ? avg : weekly - avg * 6
    }));
  }, [analytics]);

  return (
    <DashboardLayout
      navigation={navigation}
      userRole="Teacher"
      userName={user?.displayName || "Teacher"}
      userEmail={user?.email || "teacher@journalhood.com"}
    >
      <div className="container mx-auto p-6 space-y-8">
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Class Avg Words</CardTitle>
              <CardDescription>Average words per student</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{analytics.avgWordCount || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Class Engagement</CardTitle>
              <CardDescription>Active students</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{analytics.activeStudents || 0} / {analytics.totalStudents || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Entries</CardTitle>
              <CardDescription>All time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{analytics.totalEntries || 0}</p>
            </CardContent>
          </Card>
        </div>
        {/* Line Chart for Daily Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity Trends</CardTitle>
            <CardDescription>Track your class's daily writing activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                  <Line type="monotone" dataKey="avgWordsPerStudent" stroke="#6366f1" strokeWidth={2} name="Avg Words" dot={{ fill: '#6366f1', strokeWidth: 2, r: 3 }} />
                  <Line type="monotone" dataKey="totalEntries" stroke="#10b981" strokeWidth={2} name="Total Entries" dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        {/* Student Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
            <CardDescription>Current students in your class</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="px-4 py-2 whitespace-nowrap">{student.displayName || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{student.email || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{student.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}