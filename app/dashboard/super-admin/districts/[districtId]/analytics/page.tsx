"use client"

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
import { BarChart3, Building2, School, Users, TrendingUp, ArrowLeft, ExternalLink, AlertTriangle, Mail } from "lucide-react";
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from "@/components/ui/button";
import { analyticsApi } from '@/lib/api';
import { AnalyzedData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

const navigation = [
  { title: "Districts & Admins", url: "/dashboard/super-admin/districts", icon: Building2 },
  { title: "Schools", url: "/dashboard/super-admin/schools", icon: Building2 },
  { title: "Analytics", url: "/dashboard/super-admin/analytics", icon: TrendingUp, isActive: true },
  { title: "Resources", url: "/dashboard/super-admin/resources", icon: ExternalLink },
  { title: "Demo Requests", url: "/dashboard/super-admin/emails", icon: Mail },
];

export default function DistrictAnalytics() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const districtId = typeof params?.districtId === 'string' ? params.districtId : '';

  const [analytics, setAnalytics] = useState<AnalyzedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [districtName, setDistrictName] = useState<string>('');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get district analytics
      const response = await analyticsApi.getAnalytics(token!);
      setAnalytics(response.data);

      // Get district name from the analytics data
      if (response.data?.districtStats?.[districtId]) {
        setDistrictName(response.data.districtStats[districtId].districtName);
      }

      // Get historical data
      const historicalResponse = await analyticsApi.getHistoricalAnalytics(token!);
      
      // Filter historical data for this district
      const filteredHistoricalData = historicalResponse.data.map(data => ({
        id: data.id,
        timestamp: data.timestamp,
        date: data.date,
        fullDate: data.fullDate,
        totalWords: data.totalWords,
        totalEntries: data.totalEntries,
        activeSchools: data.activeSchools,
        activeStudents: data.activeStudents
      }));
      
      setHistoricalData(filteredHistoricalData);
    } catch (err: any) {
      console.error('Error loading district analytics:', err);
      setError(err.message || 'Failed to load district analytics');
      toast({
        title: "Error",
        description: err.message || "Failed to load district analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && districtId) {
      loadAnalytics();
    }
  }, [token, districtId]);

  if (loading) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="Super Admin"
        userName={user?.displayName || "Super Admin"}
        userEmail={user?.email || ""}
      >
        <div className="container mx-auto p-6">
          <div className="text-center">Loading district analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analytics) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="Super Admin"
        userName={user?.displayName || "Super Admin"}
        userEmail={user?.email || ""}
      >
        <div className="container mx-auto p-6">
          <div className="text-center text-red-500">{error || 'No analytics data available'}</div>
        </div>
      </DashboardLayout>
    );
  }

  const districtStats = analytics.districtStats[districtId];
  if (!districtStats) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="Super Admin"
        userName={user?.displayName || "Super Admin"}
        userEmail={user?.email || ""}
      >
        <div className="container mx-auto p-6">
          <div className="text-center text-red-500">District not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      navigation={navigation}
      userRole="Super Admin"
      userName={user?.displayName || "Super Admin"}
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
            <h1 className="text-2xl font-bold">{districtName} Analytics</h1>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Words</CardTitle>
              <CardDescription>In this district</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{districtStats.totalWords.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Entries</CardTitle>
              <CardDescription>Journal entries</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{districtStats.totalEntries.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Schools</CardTitle>
              <CardDescription>Schools in district</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {Object.values(analytics.schoolStats).filter(s => s.districtId === districtId).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Students</CardTitle>
              <CardDescription>Students with entries</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{districtStats.activeStudents}</p>
            </CardContent>
          </Card>
        </div>

        {/* Historical Trends */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Historical Analytics</CardTitle>
            <CardDescription>District trends over time</CardDescription>
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
                    dataKey="activeSchools" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Active Schools"
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activeStudents" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Active Students"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* School Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>School Statistics</CardTitle>
            <CardDescription>Analytics breakdown by school (click for detailed view)</CardDescription>
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
                {Object.entries(analytics.schoolStats)
                  .filter(([_, stats]) => stats.districtId === districtId)
                  .map(([schoolId, stats]) => (
                    <TableRow 
                      key={schoolId}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => router.push(`/dashboard/super-admin/schools/${schoolId}/analytics`)}
                    >
                      <TableCell className="font-medium text-blue-600 hover:text-blue-800">
                        {stats.schoolName}
                      </TableCell>
                      <TableCell>{stats.totalWords.toLocaleString()}</TableCell>
                      <TableCell>{stats.avgWordsPerStudent.toLocaleString()}</TableCell>
                      <TableCell>{stats.totalEntries.toLocaleString()}</TableCell>
                      <TableCell>{stats.activeStudents}</TableCell>
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