"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  ExternalLink, 
  BarChart3, 
  TrendingUp, 
  Edit, 
  Trash2,
  Send,
  GraduationCap,
  BookOpen,
  Search,
  Users,
  Loader2
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useAuth } from "@/lib/firebase/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { teacherResourceApi, teacherApi, studentApi, teacherAnalyticsApi } from "@/lib/api"

const navigation = [
  { title: "Analytics", url: "/dashboard/teacher/analytics", icon: TrendingUp },
]

// Interface for assigned resources
interface AssignedResource {
  id: string
  title: string
  description: string
  url: string
  category: string
  topic: string
  status: "active" | "draft"
  assignmentInfo: {
    assignedAt: string
    assignedBy: string
    assignerName: string
    assignerEmail: string
    assignmentId: string
    targetType: 'teacher' | 'class'
    targetId: string
  }
}

// Interface for students
interface Student {
  uid: string
  displayName: string
  email: string
  customClaims: any
}

// Interface for teacher info
interface TeacherInfo {
  uid: string
  email: string
  displayName: string
  customClaims: any
  classInfo: {
    classId: string
    className: string
    gradeName: string
    division: string
    gradeId: string
    schoolId: string
    schoolName: string
    districtId: string
    districtName: string
  }
}



// Interface for delivered resources
interface DeliveredResource {
  id: string
  resourceId: string
  title: string
  description: string
  url: string
  category: string
  issueType: string
  deliveredAt: string
  deliveredReason: string
  viewedAt: string | null
  studentId: string
  student: {
    uid: string
    displayName: string
    email: string
    districtId: string
    schoolId: string
    dateFirstFlagged: string | null
    dateLastFlagged: string | null
    deliveredResourcesCount: number
    resourcesDelivered: boolean
    resourcesDeliveredAt: string | null
  }
  flags: Array<{
    id: string
    studentId: string
    studentName: string
    issueType: string
    flagCount: number
    resourcesDelivered: boolean
    dateFirstFlagged: string
    dateLastFlagged: string
  }>
  totalFlagCount: number
  flagsByType: Record<string, number>
  excerpts: string[]
  lastAnalysisDate: string | null
}

const resourceColumns = [
  {
    key: "title" as keyof AssignedResource,
    label: "Title",
    sortable: true,
  },
  {
    key: "category" as keyof AssignedResource,
    label: "Category",
    render: (value: string) => (
      <Badge variant="secondary">{value}</Badge>
    ),
  },
  {
    key: "topic" as keyof AssignedResource,
    label: "Topic",
    sortable: true,
  },
  {
    key: "status" as keyof AssignedResource,
    label: "Status",
    render: (value: string) => (
      <Badge variant={value === "active" ? "default" : "outline"}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
  },
  {
    key: "assignedBy" as keyof AssignedResource,
    label: "Assigned By",
    render: (value: any, row: AssignedResource) => (
      <div className="text-sm">
        <div className="font-medium">{row.assignmentInfo.assignerName}</div>
        <div className="text-gray-500">{row.assignmentInfo.assignerEmail}</div>
      </div>
    ),
  },
  {
    key: "assignedDate" as keyof AssignedResource,
    label: "Assigned Date",
    render: (value: any, row: AssignedResource) => {
      const date = new Date(row.assignmentInfo.assignedAt)
      return date.toLocaleDateString()
    },
  },
]

const flaggedStudentColumns = [
  {
    key: "studentName",
    label: "Student Name",
    render: (value: string, student: any) => (
      <div>
        <div className="font-medium">{value}</div>
        <div className="text-sm text-gray-500">{student.studentEmail}</div>
      </div>
    ),
  },
  {
    key: "issueType",
    label: "Issue Type",
    render: (value: string) => (
      <span className="capitalize">{value.replace('_', ' ')}</span>
    ),
  },
  {
    key: "flagCount",
    label: "Flag Count",
  },
  {
    key: "resourcesDelivered",
    label: "Resources",
    render: (value: boolean) => (
      <span>{value ? "Delivered" : "Pending"}</span>
    ),
  },
  {
    key: "dateFirstFlagged",
    label: "First Flagged",
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
  {
    key: "dateLastFlagged",
    label: "Last Flagged",
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
];

export default function TeacherResourcesPage() {
  const { user, token } = useAuth()
  const { toast } = useToast()

  // State
  const [flaggedStudents, setFlaggedStudents] = useState<any[]>([])
  const [flaggedLoading, setFlaggedLoading] = useState(true)

  // Load flagged students
  useEffect(() => {
    if (token) {
      teacherAnalyticsApi.getFlaggedStudentsReport(token).then((response: any) => {
        setFlaggedStudents(response.data.flaggedStudents || [])
      }).catch(() => setFlaggedStudents([])).finally(() => setFlaggedLoading(false))
    }
  }, [token])

  // List of all possible issue types
  const allIssueTypes = [
    'depression',
    'bullying',
    'introvert',
    'language_problem',
  ];

  // Calculate issue breakdown
  const issueCounts: Record<string, number> = {}
  flaggedStudents.forEach((student) => {
    const issue = student.issueType || 'unknown'
    issueCounts[issue] = (issueCounts[issue] || 0) + 1
  })

  return (
    <DashboardLayout 
      userRole="teacher"
      userName={user?.displayName || 'Teacher'}
      userEmail={user?.email || ''}
      navigation={navigation}
    >
      <div className="p-6 space-y-6">
        {/* Issue Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {allIssueTypes.map((issue) => (
            <Card key={issue}>
              <CardContent className="py-6 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-blue-600">{issueCounts[issue] || 0}</div>
                <div className="text-gray-600 mt-2 capitalize">{issue.replace(/_/g, ' ')}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Flagged Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Flagged Students</CardTitle>
            <CardDescription>
              Students in your class flagged for mental health issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            {flaggedLoading ? (
              <div className="text-center py-8 text-gray-500">Loading flagged students...</div>
            ) : flaggedStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No flagged students found.
              </div>
            ) : (
              <DataTable
                data={flaggedStudents}
                columns={flaggedStudentColumns}
                searchPlaceholder="Search flagged students..."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 