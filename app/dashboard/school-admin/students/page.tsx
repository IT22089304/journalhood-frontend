"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { DataTable } from "@/components/ui/data-table"
import { useAuth } from "@/lib/firebase/auth-context"
import { GraduationCap, Plus, BarChart3, Loader2, TrendingUp, ArrowLeft, ChevronRight, Users, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { studentApi } from "@/lib/api"
import { Student } from "@/lib/types"
import { Column } from "@/components/ui/data-table"

const navigation = [
  { title: "Classes", url: "/dashboard/school-admin/classes", icon: GraduationCap },
  { title: "Students", url: "/dashboard/school-admin/students", icon: Users, isActive: true },
  { title: "Teachers", url: "/dashboard/school-admin/teachers", icon: Users },
  { title: "Analytics", url: "/dashboard/school-admin/analytics", icon: TrendingUp },
  { title: "Resources", url: "/dashboard/school-admin/resources", icon: ExternalLink },
]

function SchoolAdminStudentsPageInner() {
  const { user, token, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [isAddingStudent, setIsAddingStudent] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
  })

  const classId = searchParams.get('classId')
  const className = searchParams.get('className')
  const schoolId = searchParams.get('schoolId')
  const schoolName = searchParams.get('schoolName')

  useEffect(() => {
    if (!authLoading && token) {
      loadStudents()
    }
  }, [authLoading, token, classId])

  const loadStudents = async () => {
    try {
      setLoading(true)
      // For school admin, get all students in their school
      // The backend will automatically filter by school based on the user's role
      const data = await studentApi.getAll(token!)
      setStudents(data)
    } catch (error: any) {
      console.error("Error loading students:", error)
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async () => {
    try {
      const studentData = {
        ...newStudent,
        classId: classId || undefined,
      }
      await studentApi.create(studentData, token!)
      toast({
        title: "Success",
        description: "Student invitation sent successfully",
      })
      setIsAddingStudent(false)
      setNewStudent({ name: "", email: "" })
      loadStudents() // Refresh the list
    } catch (error: any) {
      console.error("Error adding student:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (student: Student) => {
    try {
      await studentApi.toggleStatus(student.uid, token!)
      toast({
        title: "Success",
        description: "Student status updated successfully",
      })
      loadStudents() // Refresh the list
    } catch (error: any) {
      console.error("Error updating student status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update student status",
        variant: "destructive",
      })
    }
  }

  const handleResetPin = async (student: Student) => {
    try {
      await studentApi.resetDiaryPin(student.uid, token!)
      toast({
        title: "Success",
        description: "Student's diary pin has been reset",
      })
    } catch (error: any) {
      console.error("Error resetting diary pin:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to reset diary pin",
        variant: "destructive",
      })
    }
  }

  const handleBackToClasses = () => {
    router.push('/dashboard/school-admin/classes')
  }

  const studentColumns: Column<Student>[] = [
    {
      key: "displayName",
      label: "Student Name",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "journalEntries",
      label: "Journal Entries",
      sortable: true,
      render: (value: number) => (
        <div className="text-center">
          <div className="font-medium">{value}</div>
          <div
            className={`text-xs ${value >= 30 ? "text-green-600" : value >= 15 ? "text-yellow-600" : "text-red-600"}`}
          >
            {value >= 30 ? "Great!" : value >= 15 ? "Good" : "Encourage"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: Student['status']) => (
        <div className="text-center">
          <Badge
            className={
              value === "active"
                ? "bg-green-100 text-green-800"
                : value === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        </div>
      ),
    },
    {
      key: "lastActivity",
      label: "Last Activity",
      render: (value: string | null) => (
        <div className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleDateString() : "Never"}
        </div>
      ),
    },
  ]

  if (authLoading || loading) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="School Admin"
        userName={user?.displayName || "Loading..."}
        userEmail={user?.email || ""}
      >
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      navigation={navigation}
      userRole="School Admin"
      userName={user?.displayName || "School Admin"}
      userEmail={user?.email || ""}
    >
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        {classId && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToClasses}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Classes
            </Button>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-gray-900">{className}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-500">Students</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {className ? `Students in ${className}` : 'Students'}
            </h1>
            <p className="text-gray-600">
              {className 
                ? `Manage students in ${className} class`
                : 'Manage all students in your school'
              }
            </p>
          </div>
          <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Send an invitation to a new student {className ? `to join ${className}` : 'to join your school'}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-name">Student Name</Label>
                  <Input
                    id="student-name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter student's full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email Address</Label>
                  <Input
                    id="student-email"
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter student's email address"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingStudent(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddStudent}
                  disabled={!newStudent.name || !newStudent.email}
                >
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">
                {className ? `In ${className}` : 'In your school'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter(s => s.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((students.filter(s => s.status === 'active').length / students.length) * 100) || 0}% of total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Journal Entries</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.length > 0 
                  ? Math.round(students.reduce((sum, s) => sum + (s.journalEntries || 0), 0) / students.length)
                  : 0
                }
              </div>
              <p className="text-xs text-muted-foreground">Per student</p>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {className ? `Students in ${className}` : 'All Students'}
            </CardTitle>
            <CardDescription>
              {className 
                ? `Manage students enrolled in ${className} class`
                : 'Manage all students in your school'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={students}
              columns={studentColumns}
              searchPlaceholder="Search students..."
              onToggleStatus={handleToggleStatus}
              isLoading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 

export default function SchoolAdminStudentsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SchoolAdminStudentsPageInner />
    </Suspense>
  )
}