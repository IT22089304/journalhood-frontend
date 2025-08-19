"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from '@/lib/firebase/auth-context';
import { GraduationCap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import { teacherApi, analyticsApi } from '@/lib/api';

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
        setStudents(resp.students || []);
        // Fetch teacher class analytics (new API)
        const analyticsResp = await analyticsApi.getTeacherClassAnalytics(token);
        const data = analyticsResp?.data || {};
        // Use the classStats and avgWordsPerStudent directly
        let avgWordCount = 0;
        let totalEntries = 0;
        let activeStudents = 0;
        let totalStudents = 0;
        if (data.classStats) {
          const classObj = Object.values(data.classStats)[0];
          if (classObj) {
            avgWordCount = classObj.avgWordsPerStudent || 0;
            totalEntries = classObj.totalEntries || 0;
            activeStudents = classObj.activeStudents || 0;
          }
        }
        if (resp.students) {
          totalStudents = resp.students.length;
        }
        setAnalytics({
          avgWordCount,
          totalEntries,
          activeStudents,
          totalStudents,
          weeklyEntries: 0,
          monthlyEntries: 0,
        });
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