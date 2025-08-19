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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/dashboard-layout";
import { BarChart3, Building2, School, Users, TrendingUp, RefreshCw, ExternalLink, Loader2, AlertTriangle, Brain, Zap, Mail } from "lucide-react";
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { analyticsApi } from '@/lib/api';
import { AnalyzedData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays } from 'date-fns';
import { useRouter } from 'next/navigation';

const navigation = [
  { title: "Districts & Admins", url: "/dashboard/super-admin/districts", icon: Building2 },
  { title: "Schools", url: "/dashboard/super-admin/schools", icon: Building2 },
  { title: "Analytics", url: "/dashboard/super-admin/analytics", icon: TrendingUp, isActive: true },
  { title: "Resources", url: "/dashboard/super-admin/resources", icon: ExternalLink },
  { title: "Demo Requests", url: "/dashboard/super-admin/emails", icon: Mail },
];

export default function SuperAdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyzedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [updatingAnalytics, setUpdatingAnalytics] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [flaggedStudents, setFlaggedStudents] = useState<any[]>([]);
  const [flaggedStudentsLoading, setFlaggedStudentsLoading] = useState(false);
  const [analysisMethod, setAnalysisMethod] = useState<'keyword' | 'openai'>('keyword');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const { user, token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const analyzeEntries = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      setProgress(0);
      setProgressMessage('Initializing unified journal analysis workflow...');

      const unifiedProgressSteps = [
        { percent: 10, message: 'Fetching ALL journals from diaryEntriesBackup collection...' },
        { percent: 25, message: 'Generating analytics report (word counts, statistics)...' },
        { percent: 45, message: `Analyzing mental health using ${analysisMethod === 'openai' ? 'OpenAI' : 'keyword matching'}...` },
        { percent: 60, message: 'Detecting depression, bullying, introvert, and language issues...' },
        { percent: 75, message: 'Flagging students with 4+ issue occurrences...' },
        { percent: 85, message: 'Saving analytics report to analyzedData collection...' },
        { percent: 92, message: 'Moving processed journals to analyzedjournals collection...' },
        { percent: 98, message: 'Cleaning up processed journals from diaryEntriesBackup...' },
      ];

      for (const step of unifiedProgressSteps) {
        setProgress(step.percent);
        setProgressMessage(step.message);
        await new Promise(resolve => setTimeout(resolve, 1200));
      }

      setProgressMessage('Running unified analysis workflow...');
      const unifiedResponse = await analyticsApi.analyzeData(token!, analysisMethod);
      console.log('🔍 Unified Response:', unifiedResponse);

      if (!unifiedResponse.data) {
        console.error('❌ Invalid response structure:', unifiedResponse);
        throw new Error('Analysis response has invalid structure. Please try again.');
      }

      const payload: any = unifiedResponse.data;
      const analyticsData = payload?.analytics || payload;
      const mentalHealth = payload?.mentalHealth || { flaggedStudents: 0 };
      const processing = payload?.processing || {
        totalJournalsProcessed: analyticsData?.totalEntries ?? 0,
        journalsMovedToArchive: 0,
        journalsRemovedFromBackup: 0,
      };

      const journalInfo = `${processing?.totalJournalsProcessed ?? 'N/A'} journals processed, ${processing?.journalsMovedToArchive ?? 'N/A'} moved to archive, ${processing?.journalsRemovedFromBackup ?? 'N/A'} removed from backup`;

      setProgress(100);
      setProgressMessage('Analysis finished');
      toast({
        title: 'Unified Analysis Complete',
        description: `Analytics generated! ${analyticsData?.totalEntries ?? 0} entries (${analyticsData?.totalWords ?? 0} words), ${mentalHealth?.flaggedStudents ?? 0} students flagged for issues. ${journalInfo}.`,
        variant: 'default',
      });

      await loadAnalytics(false);
      await loadFlaggedStudents();
      await loadHistoricalData();
    } catch (err: any) {
      setError(err?.message || 'Failed to run analysis');
      toast({
        title: 'Analysis Failed',
        description: err?.message || 'Failed to run analysis',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const loadAnalytics = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      const response = await analyticsApi.getAnalytics(token!);
      setAnalytics(response.data);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      if (err.message === 'Please run the analysis first') {
        setAnalytics(null);
      } else {
        setError(err.message || 'Failed to load analytics data');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadFlaggedStudents = async () => {
    try {
      setFlaggedStudentsLoading(true);
      const response = await analyticsApi.getFlaggedStudentsReport(token!);
      setFlaggedStudents(response.data.flaggedStudents || []);
    } catch (err: any) {
      console.error('Error loading flagged students:', err);
      // Don't show error toast for this, as it's not critical
    } finally {
      setFlaggedStudentsLoading(false);
    }
  };

  const loadHistoricalData = async () => {
    try {
      const response = await analyticsApi.getHistoricalAnalytics(token!);
      setHistoricalData(response.data || []);
    } catch (err: any) {
      console.error('Error loading historical data:', err);
      // Don't show error toast for this, fallback to mock data
      setHistoricalData([]);
    }
  };

  // Add a function to refresh analytics and flagged students
  const refreshAnalyticsAndFlags = async () => {
    await Promise.all([
      loadAnalytics(),
      loadHistoricalData(),
      loadFlaggedStudents()
    ]);
  };

  useEffect(() => {
    if (token) {
      loadAnalytics();
      loadFlaggedStudents();
      loadHistoricalData();
    }
  }, [token]);

  if (loading) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="Super Admin"
        userName={user?.displayName || "Super Admin"}
        userEmail={user?.email || "admin@journalhood.com"}
      >
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">System-wide Analytics</h1>
          </div>
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-600">Loading analytics data...</div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="Super Admin"
        userName={user?.displayName || "Super Admin"}
        userEmail={user?.email || "admin@journalhood.com"}
      >
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Comprehensive Analytics</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Analysis Method:</span>
                <Select value={analysisMethod} onValueChange={(value: 'keyword' | 'openai') => setAnalysisMethod(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="font-medium">Keyword Matching</div>
                          <div className="text-xs text-gray-500">Fast & Free</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="openai">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <div>
                          <div className="font-medium">OpenAI Analysis</div>
                          <div className="text-xs text-gray-500">Advanced AI (API Key Required)</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            <Button 
              onClick={analyzeEntries} 
              disabled={analyzing}
              className="bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Analysis...
                </>
              ) : (
                  'Run Comprehensive Analysis'
              )}
            </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          {analyzing && (
            <Card className="mb-6">
              <CardContent className="py-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {progressMessage}
                    </span>
                    <span className="text-sm text-gray-500">
                      {progress}%
                    </span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-red-500">{error}</div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="Super Admin"
        userName={user?.displayName || "Super Admin"}
        userEmail={user?.email || "admin@journalhood.com"}
      >
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Comprehensive Analytics</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Analysis Method:</span>
                <Select value={analysisMethod} onValueChange={(value: 'keyword' | 'openai') => setAnalysisMethod(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="font-medium">Keyword Matching</div>
                          <div className="text-xs text-gray-500">Fast & Free</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="openai">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <div>
                          <div className="font-medium">OpenAI Analysis</div>
                          <div className="text-xs text-gray-500">Advanced AI (API Key Required)</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            <Button 
              onClick={analyzeEntries} 
              disabled={analyzing}
              className="bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Analysis...
                </>
              ) : (
                  'Run Comprehensive Analysis'
              )}
            </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          {analyzing && (
            <Card className="mb-6">
              <CardContent className="py-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {progressMessage}
                    </span>
                    <span className="text-sm text-gray-500">
                      {progress}%
                    </span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-600">
                No analytics data available. Click "Run Comprehensive Analysis" to start.
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
    }

  // Calculate totals
  const totalWords = analytics.totalWords;
  const totalEntries = analytics.totalEntries;
  const totalDistricts = Object.keys(analytics.districtStats).length;
  const totalSchools = Object.keys(analytics.schoolStats).length;

  // Use real historical data or fallback to current data point
  const getSystemDailyData = () => {
    if (historicalData.length > 0) {
      // Use real historical data
      return historicalData;
    } else {
      // Fallback: create a single data point with current data
      return [{
        date: format(new Date(), 'MMM dd'),
        fullDate: format(new Date(), 'yyyy-MM-dd'),
        totalWords: totalWords,
        totalEntries: totalEntries,
        activeDistricts: totalDistricts,
        activeSchools: totalSchools
      }];
    }
  };

  const systemDailyData = getSystemDailyData();

  return (
    <DashboardLayout
      navigation={navigation}
      userRole="Super Admin"
      userName={user?.displayName || "Super Admin"}
      userEmail={user?.email || "admin@journalhood.com"}
    >
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">System-wide Analytics</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Analysis Method:</span>
              <Select value={analysisMethod} onValueChange={(value: 'keyword' | 'openai') => setAnalysisMethod(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keyword">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-medium">Keyword Matching</div>
                        <div className="text-xs text-gray-500">Fast & Free</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="openai">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <div>
                        <div className="font-medium">OpenAI Analysis</div>
                        <div className="text-xs text-gray-500">Advanced AI (API Key Required)</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          <Button 
            onClick={analyzeEntries} 
            disabled={analyzing}
            className="bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Analysis...
              </>
            ) : (
                'Run Comprehensive Analysis'
            )}
          </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        {analyzing && (
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {progressMessage}
                  </span>
                  <span className="text-sm text-gray-500">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Words</CardTitle>
              <CardDescription>Across all journals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalWords.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Entries</CardTitle>
              <CardDescription>All journal entries</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalEntries.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Districts</CardTitle>
              <CardDescription>Districts with entries</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalDistricts}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Schools</CardTitle>
              <CardDescription>Schools with entries</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalSchools}</p>
            </CardContent>
          </Card>
        </div>

        {/* System-wide Daily Trends Line Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Historical Analytics Data</CardTitle>
            <CardDescription>
              {historicalData.length > 0 
                ? `Real historical data from ${historicalData.length} analysis reports over time`
                : "Current analytics snapshot (run more analyses to see historical trends)"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={systemDailyData}>
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
                      value.toLocaleString(),
                      name === 'totalWords' ? 'Total Words' : 
                      name === 'totalEntries' ? 'Total Entries' : 
                      name === 'activeDistricts' ? 'Active Districts' :
                      'Active Schools'
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="totalWords" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    name="Total Words"
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 3 }}
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
                    dataKey="activeDistricts" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Active Districts"
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activeSchools" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Active Schools"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* District Statistics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>District Statistics</CardTitle>
            <CardDescription>Analytics breakdown by district (click for detailed view)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>District Name</TableHead>
                  <TableHead>Total Words</TableHead>
                  <TableHead>Avg Words/Student</TableHead>
                  <TableHead>Total Entries</TableHead>
                  <TableHead>Active Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(analytics.districtStats).map(([districtId, stats]) => (
                  <TableRow 
                    key={districtId}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => router.push(`/dashboard/super-admin/districts/${districtId}/analytics`)}
                  >
                    <TableCell className="font-medium text-blue-600 hover:text-blue-800">
                      {stats.districtName}
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

        {/* School Statistics */}
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
                {Object.entries(analytics.schoolStats).map(([schoolId, stats]) => (
                    <TableRow key={schoolId}>
                    <TableCell>{stats.schoolName}</TableCell>
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