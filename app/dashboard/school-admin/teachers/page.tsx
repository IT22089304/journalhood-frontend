"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, StatusBadge } from "@/components/ui/data-table"
import { BookOpen, Users, Plus, BarChart3, TrendingUp, UserPlus, AlertCircle, GraduationCap, ExternalLink } from "lucide-react"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://journalhood-backend-production.up.railway.app'
import { useForm } from "@/hooks/use-form"
import { useAuth } from "@/lib/firebase/auth-context"
import { useToast } from "@/hooks/use-toast"
import { PhoneInput } from "@/components/ui/phone-input"
import { usePhoneValidation } from "@/hooks/use-phone-validation"
import type { Class } from "@/lib/types"

const navigation = [
  { title: "Classes", url: "/dashboard/school-admin/classes", icon: GraduationCap },
  { title: "Teachers", url: "/dashboard/school-admin/teachers", icon: Users, isActive: true },
  { title: "Analytics", url: "/dashboard/school-admin/analytics", icon: TrendingUp },
  { title: "Resources", url: "/dashboard/school-admin/resources", icon: ExternalLink },
]

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: "active" | "suspended";
  gradeId?: string;
  gradeName?: string;
  division?: string;
  className?: string;
  createdAt: string;
  updatedAt: string;
}

const teacherColumns = [
  {
    key: "name" as keyof Teacher,
    label: "Name",
    sortable: true,
  },
  {
    key: "email" as keyof Teacher,
    label: "Email",
    sortable: true,
  },
  {
    key: "phone" as keyof Teacher,
    label: "Phone",
    render: (value: string) => value || "Not provided",
  },
  {
    key: "class" as keyof Teacher,
    label: "Class",
    render: (value: string, row: Teacher) => {
      if (!row.gradeName || !row.division) {
        return <Badge variant="outline">Unassigned</Badge>
      }
      return `${row.gradeName} - Division ${row.division}`
    },
  },
  {
    key: "status" as keyof Teacher,
    label: "Status",
    render: (value: "active" | "suspended") => <StatusBadge status={value} />,
  },
]

export default function SchoolAdminTeachers() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const { validatePhoneForSubmission } = usePhoneValidation()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [assigningTeacher, setAssigningTeacher] = useState<Teacher | null>(null)

  // For school admins, their own user ID is their school ID
  const schoolId = user?.schoolId || user?.id

  // Teacher form
  const teacherForm = useForm(
    {
      name: "",
      email: "",
      phone: "",
      classId: "",
    },
    {
      name: (value: string) => {
        if (!value?.trim()) return "Name is required"
        if (value.length < 2) return "Name must be at least 2 characters"
        return null
      },
      email: (value: string) => {
        if (!value?.trim()) return "Email is required"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format"
        return null
      },
      phone: (value: string) => {
        if (value) {
          return validatePhoneForSubmission(value)
        }
        return null
      },
      classId: () => null, // Optional field, no validation required
    },
  )

  // Assignment form
  const assignmentForm = useForm(
    {
      classId: "",
    },
    {
      classId: (value: string) => (!value ? "Please select a class" : null),
    },
  )

  // Load data from API
  const authFetch = async (url: string, init?: RequestInit) => {
    const res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    })
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      throw new Error(t || `Request failed (${res.status})`)
    }
    const ct = res.headers.get('content-type') || ''
    return ct.includes('application/json') ? res.json() : res.text()
  }

  const loadData = async () => {
    try {
      if (!schoolId) {
        setError("School ID not found")
        return
      }

      setLoading(true)
      setError(null)

      // Get teachers and classes in parallel
      const [teachersResponse, classesResponse] = await Promise.all([
        authFetch(`${API_BASE_URL}/api/teachers`),
        authFetch(`${API_BASE_URL}/api/classes?schoolId=${schoolId}`)
      ]) as [{ teachers: Teacher[] }, { classes: Class[] }]

      setTeachers(teachersResponse.teachers || [])
      setClasses(classesResponse.classes || [])
    } catch (err: any) {
      console.error("Error loading data:", err)
      setError(err.message || "Failed to load data")
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    if (token && schoolId) {
      loadData()
    }
  }, [token, schoolId])

  const handleTeacherSubmit = async () => {
    if (!teacherForm.validateForm()) return

    teacherForm.setLoading(true)

    try {
      const selectedClass = teacherForm.data.classId && teacherForm.data.classId !== "none"
        ? classes.find((cls) => cls.id === teacherForm.data.classId)
        : null

      const teacherData = {
        name: teacherForm.data.name,
        email: teacherForm.data.email,
        phone: teacherForm.data.phone || undefined,
        gradeId: selectedClass?.gradeId,
        gradeName: selectedClass?.gradeName,
        division: selectedClass?.division,
      }

      if (editingTeacher) {
        // Update existing teacher
        await authFetch(`${API_BASE_URL}/api/teachers/${editingTeacher.id}`, { method: 'PUT', body: JSON.stringify(teacherData) })
        toast({
          title: "Success",
          description: "Teacher updated successfully",
        })
      } else {
        // Create new teacher
        await authFetch(`${API_BASE_URL}/api/teachers`, { method: 'POST', body: JSON.stringify(teacherData) })
        toast({
          title: "Success",
          description: "Teacher created successfully",
        })
      }

      // Reload data to get updated information
      await loadData()
      
      setIsTeacherDialogOpen(false)
      teacherForm.resetForm()
      setEditingTeacher(null)
    } catch (err: any) {
      console.error("Error submitting teacher:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to save teacher",
        variant: "destructive",
      })
    } finally {
      teacherForm.setLoading(false)
    }
  }

  const handleAssignmentSubmit = async () => {
    if (!assignmentForm.validateForm() || !assigningTeacher) return

    assignmentForm.setLoading(true)

    try {
      const selectedClass = classes.find((cls) => cls.id === assignmentForm.data.classId)
      if (!selectedClass) throw new Error("Selected class not found")

      // Update teacher with class information
      await authFetch(`${API_BASE_URL}/api/teachers/${assigningTeacher.id}`, { method: 'PUT', body: JSON.stringify({
        name: assigningTeacher.name,
        email: assigningTeacher.email,
        phone: assigningTeacher.phone || undefined,
        gradeId: selectedClass.gradeId,
        gradeName: selectedClass.gradeName,
        division: selectedClass.division,
      }) })

      // Update class with teacher information
      await authFetch(`${API_BASE_URL}/api/classes/${selectedClass.id}/assign-teacher`, { method: 'POST', body: JSON.stringify({
        teacherId: assigningTeacher.id,
        teacherName: assigningTeacher.name,
      }) })

      toast({
        title: "Success",
        description: "Teacher assigned successfully",
      })

      await loadData()
      setIsAssignDialogOpen(false)
      assignmentForm.resetForm()
      setAssigningTeacher(null)
    } catch (err: any) {
      console.error("Error assigning teacher:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to assign teacher",
        variant: "destructive",
      })
    } finally {
      assignmentForm.setLoading(false)
    }
  }

  const handleEditTeacher = async (teacher: Teacher) => {
    try {
      setEditingTeacher(teacher)
      teacherForm.updateField("name", teacher.name)
      teacherForm.updateField("email", teacher.email)
      teacherForm.updateField("phone", teacher.phone || "")
      setIsTeacherDialogOpen(true)
    } catch (error: any) {
      console.error("Error setting up edit form:", error)
      toast({
        title: "Error",
        description: "Failed to load teacher data",
        variant: "destructive",
      })
    }
  }

  const handleAssignTeacher = async (teacher: Teacher) => {
    try {
      setAssigningTeacher(teacher)
      setIsAssignDialogOpen(true)
    } catch (error: any) {
      console.error("Error setting up assignment form:", error)
      toast({
        title: "Error",
        description: "Failed to load teacher data",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (!confirm(`Are you sure you want to delete ${teacher.name}?`)) return

    try {
      await authFetch(`${API_BASE_URL}/api/teachers/${teacher.id}`, { method: 'DELETE' })
      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      })
      await loadData()
    } catch (err: any) {
      console.error("Error deleting teacher:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to delete teacher",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (teacher: Teacher) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/teachers/${teacher.id}/status`, { method: 'PUT' }) as { message: string; status: 'active' | 'suspended' }
      toast({
        title: "Success",
        description: `Teacher ${response.status === "active" ? "unsuspended" : "suspended"} successfully`,
      })
      await loadData()
    } catch (err: any) {
      console.error("Error toggling teacher status:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to update teacher status",
        variant: "destructive",
      })
    }
  }

  const handleTeacherDialogClose = () => {
    setIsTeacherDialogOpen(false)
    teacherForm.resetForm()
    setEditingTeacher(null)
  }

  const handleAssignDialogClose = () => {
    setIsAssignDialogOpen(false)
    assignmentForm.resetForm()
    setAssigningTeacher(null)
  }

  // Get available classes (not assigned to other teachers)
  const availableClasses = classes.filter((cls) => cls.status === "active" && !cls.teacherId)

  const stats = {
    totalTeachers: teachers.length,
    activeTeachers: teachers.filter((t) => t.status === "active").length,
    assignedTeachers: teachers.filter((t) => t.gradeName && t.division && t.status === "active").length,
    unassignedTeachers: teachers.filter((t) => (!t.gradeName || !t.division) && t.status === "active").length,
  }

  if (loading) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="School Admin"
        userName={user?.displayName || "School Admin"}
        userEmail={user?.email || ""}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading teachers...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="School Admin"
        userName={user?.displayName || "School Admin"}
        userEmail={user?.email || ""}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="mt-2 text-red-600">{error}</p>
            <Button onClick={() => loadData()} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
            <p className="text-gray-600">Manage teachers and assign them to classes</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isTeacherDialogOpen} onOpenChange={setIsTeacherDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Teacher
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingTeacher ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
                  <DialogDescription>
                    {editingTeacher
                      ? "Update the teacher information."
                      : "Add a new teacher to your school. You can assign them to a class later."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={teacherForm.data.name}
                      onChange={(e) => teacherForm.updateField("name", e.target.value)}
                      onBlur={() => teacherForm.validateField("name")}
                      placeholder="Enter full name"
                      className={teacherForm.errors.name ? "border-red-500" : ""}
                    />
                    {teacherForm.errors.name && (
                      <p className="text-sm text-red-500">{teacherForm.errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={teacherForm.data.email}
                      onChange={(e) => teacherForm.updateField("email", e.target.value)}
                      onBlur={() => teacherForm.validateField("email")}
                      placeholder="teacher@school.edu"
                      className={teacherForm.errors.email ? "border-red-500" : ""}
                    />
                    {teacherForm.errors.email && <p className="text-sm text-red-500">{teacherForm.errors.email}</p>}
                  </div>
                  <PhoneInput
                    value={teacherForm.data.phone}
                    onChange={(value) => teacherForm.updateField("phone", value)}
                    onBlur={() => teacherForm.validateField("phone")}
                    error={teacherForm.errors.phone}
                    placeholder="+1-555-0123"
                    label="Phone Number"
                    required={false}
                  />

                  {/* Add this new field */}
                  {!editingTeacher && (
                    <div className="space-y-2">
                      <Label htmlFor="classId">Assign to Class (Optional)</Label>
                      <Select
                        value={teacherForm.data.classId}
                        onValueChange={(value) => teacherForm.updateField("classId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a class (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No assignment</SelectItem>
                          {availableClasses.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.gradeName} - Division {cls.division} ({cls.studentCount}/{cls.maxStudents} students)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        You can assign the teacher to a class now or do it later from the teacher list.
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleTeacherDialogClose} disabled={teacherForm.isLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleTeacherSubmit} disabled={teacherForm.isLoading || !teacherForm.isValid}>
                    {teacherForm.isLoading ? "Saving..." : editingTeacher ? "Update Teacher" : "Add Teacher"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
              <p className="text-xs text-muted-foreground">{stats.activeTeachers} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Teachers</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assignedTeachers}</div>
              <p className="text-xs text-muted-foreground">Have class assignments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unassignedTeachers}</div>
              <p className="text-xs text-muted-foreground">Need class assignment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Classes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableClasses.length}</div>
              <p className="text-xs text-muted-foreground">Without teachers</p>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Teacher to Class</DialogTitle>
              <DialogDescription>
                Assign {assigningTeacher?.name} to a class division.
                {assigningTeacher?.gradeId && (
                  <span className="block mt-1 text-amber-600">
                    Currently assigned to {assigningTeacher.gradeName} - Division {assigningTeacher.division}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="classId">Select Class</Label>
                <Select
                  value={assignmentForm.data.classId}
                  onValueChange={(value) => assignmentForm.updateField("classId", value)}
                >
                  <SelectTrigger className={assignmentForm.errors.classId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Choose a class division" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.gradeName} - Division {cls.division} ({cls.studentCount}/{cls.maxStudents} students)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {assignmentForm.errors.classId && (
                  <p className="text-sm text-red-500">{assignmentForm.errors.classId}</p>
                )}
                {availableClasses.length === 0 && (
                  <p className="text-sm text-amber-600">
                    No available classes. All classes are already assigned to teachers.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleAssignDialogClose} disabled={assignmentForm.isLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleAssignmentSubmit}
                disabled={assignmentForm.isLoading || !assignmentForm.isValid || availableClasses.length === 0}
              >
                {assignmentForm.isLoading ? "Assigning..." : "Assign Teacher"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Teachers</CardTitle>
            <CardDescription>Manage teachers and their class assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={teachers}
              columns={[
                ...teacherColumns,
                {
                  key: "assign" as keyof Teacher,
                  label: "Actions",
                  render: (_, row: Teacher) => (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignTeacher(row)}
                      disabled={row.status === "suspended"}
                    >
                      {row.gradeId ? "Reassign" : "Assign Class"}
                    </Button>
                  ),
                },
              ]}
              searchPlaceholder="Search teachers..."
              onEdit={handleEditTeacher}
              onDelete={handleDeleteTeacher}
              onToggleStatus={handleToggleStatus}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
