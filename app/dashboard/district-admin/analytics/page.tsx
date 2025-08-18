"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/firebase/auth-context";
import { analyticsApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { School, TrendingUp, Users, ExternalLink, BookOpen } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

const navigation = [
  { title: "Analytics", url: "/dashboard/district-admin/analytics", icon: TrendingUp, isActive: true },
  { title: "Admins", url: "/dashboard/district-admin/admins", icon: Users },
];

export default function DistrictAdminAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && token) {
      analyticsApi.getDistrictAnalytics(token!).then((response) => {
        setAnalytics(response.data);
        setLoading(false);
      });
      analyticsApi.getDistrictHistoricalAnalytics(token!).then((response) => {
        setHistoricalData(response.data || []);
      });
    }
  }, [token, authLoading]);

  if (loading || authLoading) {
    return (
      <DashboardLayout navigation={navigation} userRole="District Admin" userName={user?.displayName || "District Admin"} userEmail={user?.email || ""}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading analytics...</span>
        </div>
      </DashboardLayout>
    );
  }

  // Get the only district in districtStats
  const districtStats = analytics?.districtStats || {};
  const districtId = Object.keys(districtStats)[0];
  const districtData = districtStats[districtId] || {};

  // Only show schools for this district
  const schoolStats = analytics?.schoolStats || {};

  // Prepare district-level daily data for the line graph
  const getDistrictDailyData = () => {
    if (historicalData.length > 0) {
      return historicalData;
    } else if (districtData) {
      return [{
        date: format(new Date(), 'MMM dd'),
        fullDate: format(new Date(), 'yyyy-MM-dd'),
        totalWords: districtData.totalWords,
        totalEntries: districtData.totalEntries,
        activeStudents: districtData.activeStudents,
        avgWordsPerStudent: districtData.avgWordsPerStudent
      }];
    } else {
      return [];
    }
  };
  const districtDailyData = getDistrictDailyData();

  return (
    <DashboardLayout navigation={navigation} userRole="District Admin" userName={user?.displayName || "District Admin"} userEmail={user?.email || ""}>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{districtData.districtName || "District"} Analytics</h1>
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Words</CardTitle>
              <CardDescription>Across all journals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{districtData.totalWords?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Entries</CardTitle>
              <CardDescription>All journal entries</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{districtData.totalEntries?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Students</CardTitle>
              <CardDescription>Students with entries</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{districtData.activeStudents || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Avg Words/Student</CardTitle>
              <CardDescription>District average</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{districtData.avgWordsPerStudent?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
        </div>
        {/* District Daily Trends Line Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Historical Analytics Data</CardTitle>
            <CardDescription>
              {historicalData.length > 0
                ? `Real historical data from ${historicalData.length} analysis reports over time`
                : "Current analytics snapshot (run more analyses to see historical trends)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={districtDailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => [
                      value.toLocaleString(),
                      name === 'totalWords' ? 'Total Words' :
                      name === 'totalEntries' ? 'Total Entries' :
                      name === 'activeStudents' ? 'Active Students' :
                      'Avg Words/Student'
                    ]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="totalWords" stroke="#6366f1" strokeWidth={2} name="Total Words" dot={{ fill: '#6366f1', strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="totalEntries" stroke="#10b981" strokeWidth={2} name="Total Entries" dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="activeStudents" stroke="#f59e0b" strokeWidth={2} name="Active Students" dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="avgWordsPerStudent" stroke="#ef4444" strokeWidth={2} name="Avg Words/Student" dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>School Statistics</CardTitle>
            <CardDescription>Analytics breakdown by school</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>Total Words</TableHead>
                  <TableHead>Avg Words/Student</TableHead>
                  <TableHead>Total Entries</TableHead>
                  <TableHead>Active Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(schoolStats).map(([schoolId, stats]: any) => (
                  <TableRow key={schoolId} className="cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/dashboard/district-admin/schools/${schoolId}/analytics`)}>
                    <TableCell className="font-medium text-blue-600 hover:text-blue-800">{stats.schoolName}</TableCell>
                    <TableCell>{stats.totalWords?.toLocaleString() || 0}</TableCell>
                    <TableCell>{stats.avgWordsPerStudent?.toLocaleString() || 0}</TableCell>
                    <TableCell>{stats.totalEntries?.toLocaleString() || 0}</TableCell>
                    <TableCell>{stats.activeStudents || 0}</TableCell>
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
