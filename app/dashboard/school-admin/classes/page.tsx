"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, BarChart3, BookOpen, Users, AlertCircle, TrendingUp, Settings, GraduationCap, ExternalLink } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable, type Column } from "@/components/ui/data-table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useForm } from "@/hooks/use-form"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://journalhood-backend-production.up.railway.app'
import type { Class, DivisionConfig } from "@/lib/types"
import { useEffect as useEffectStudents, useState as useStateStudents } from "react";

// Helper to call backend with auth
const authFetch = async (url: string, token?: string, init?: RequestInit) => {
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
    const txt = await res.text().catch(() => '')
    throw new Error(txt || `Request failed (${res.status})`)
  }
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : res.text()
}

interface ExtendedClass extends Class {
  actions: string;
}

const gradeOptions = [
  { value: "k", label: "Kindergarten", level: 0 },
  { value: "1", label: "Grade 1", level: 1 },
  { value: "2", label: "Grade 2", level: 2 },
  { value: "3", label: "Grade 3", level: 3 },
  { value: "4", label: "Grade 4", level: 4 },
  { value: "5", label: "Grade 5", level: 5 },
  { value: "6", label: "Grade 6", level: 6 },
  { value: "7", label: "Grade 7", level: 7 },
  { value: "8", label: "Grade 8", level: 8 },
  { value: "9", label: "Grade 9", level: 9 },
  { value: "10", label: "Grade 10", level: 10 },
];

// Navigation without count in tab labels
function getNavigation(_studentsCount: number) {
  return [
    { title: "Classes", url: "/dashboard/school-admin/classes", icon: GraduationCap, isActive: true },
    { title: "Teachers", url: "/dashboard/school-admin/teachers", icon: Users },
    { title: "Analytics", url: "/dashboard/school-admin/analytics", icon: TrendingUp },
    { title: "Resources", url: "/dashboard/school-admin/resources", icon: ExternalLink },
  ];
}

export default function SchoolAdminClasses() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [classes, setClasses] = useState<ExtendedClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false)
  const [isDivisionDialogOpen, setIsDivisionDialogOpen] = useState(false)

  // Students count state
  const [studentsCount, setStudentsCount] = useState(0);
  // Fetch students count on mount
  useEffect(() => {
    async function fetchStudentsCount() {
      try {
        let response: { students: any[] };
        if (user?.role === 'school-admin') {
          response = await authFetch(`${API_BASE_URL}/api/school-admin/get-students?schoolId=${user?.schoolId || ''}`, token || undefined) as { students: any[] };
        } else {
          response = await authFetch(`${API_BASE_URL}/api/school-admin/get-students`, token || undefined) as { students: any[] };
        }
        setStudentsCount(response.students?.length || 0);
      } catch (error) {
        console.error("Error fetching students:", error);
        // Fallback: sum studentCount from all classes
        setStudentsCount(classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0));
      }
    }
    if (token) fetchStudentsCount();
  }, [token, user?.role, user?.schoolId, classes]);

  // For school admins, their own user ID is their school ID
  const schoolId = user?.schoolId || user?.id

  // Grade form
  const gradeForm = useForm(
    {
      gradeValue: "",
      gradeName: "",
      divisions: [] as DivisionConfig[],
    },
    {
      gradeValue: (value: string) => (!value ? "Please select a grade" : null),
      gradeName: (value: string) => null, // No validation needed as it's derived from gradeValue
      divisions: (value: DivisionConfig[]) => (value.length === 0 ? "At least one division is required" : null),
    },
  )

  // Division form
  const divisionForm = useForm(
    {
      name: "",
      maxStudents: 25,
    },
    {
      name: (value: string) => {
        if (!value?.trim()) return "Division name is required"
        if (!/^[A-Z]$/.test(value.trim())) return "Division name must be a single letter (A-Z)"
        return null
      },
      maxStudents: (value: number) => {
        if (!value || value < 1) return "Max students must be at least 1"
        if (value > 50) return "Max students cannot exceed 50"
        return null
      },
    },
  )

  // Load classes when auth and schoolId are ready
  useEffect(() => {
    if (token && schoolId) {
      loadClasses()
    }
  }, [token, schoolId])

  const loadClasses = async (retryCount = 0) => {
    try {
      if (!schoolId) {
        setError("School ID not found")
        return
      }

      if (!token) {
        setError("Not authenticated")
        return
      }

      setLoading(true)
      setError(null)

      // Get the classes
      const response = await authFetch(`${API_BASE_URL}/api/classes?schoolId=${schoolId}`, token) as { classes: Class[] }
      if (!response || !(response as any).classes) {
        throw new Error('Failed to load classes')
      }
      // Transform classes to include actions field
      const extendedClasses = (response as any).classes.map((cls: Class) => ({
        ...cls,
        actions: '', // Placeholder for actions column
      })) as ExtendedClass[]
      setClasses(extendedClasses)
    } catch (err: any) {
      console.error("Error loading classes:", err)
      
      // If it's a "School not found" error and this is the first attempt, retry once
      if (err.message === "School not found" && retryCount === 0) {
        console.log("School not found, retrying...")
        setTimeout(() => loadClasses(1), 1000) // Retry after 1 second
        return
      }
      
      setError(err.message || "Failed to load classes")
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClass = async (cls: Class) => {
    try {
      if (cls.studentCount > 0) {
        toast({
          title: "Error",
          description: "Cannot delete class with enrolled students. Please remove all students first.",
          variant: "destructive",
        });
        return;
      }

      await authFetch(`${API_BASE_URL}/api/classes/${cls.id}`, token, { method: 'DELETE' });
      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
      loadClasses();
    } catch (error: any) {
      console.error("Error deleting class:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete class. Please try again.",
        variant: "destructive",
      })
    }
  };

  const handleGradeSubmit = async () => {
    if (!gradeForm.validateForm() || !schoolId) return

    gradeForm.setLoading(true)

    try {
      const selectedGradeOption = gradeOptions.find((g) => g.value === gradeForm.data.gradeValue)
      if (!selectedGradeOption) return

      // Create classes for each division via API
      const classCreationPromises = gradeForm.data.divisions.map(async (division) => {
        const classData = {
          gradeName: selectedGradeOption.label,
          division: division.name,
          maxStudents: division.maxStudents,
          schoolId: schoolId,
        }
        
        return await authFetch(`${API_BASE_URL}/api/classes`, token, { method: 'POST', body: JSON.stringify(classData) })
      })

      await Promise.all(classCreationPromises)
      
      // Reload classes from server to get updated data
      await loadClasses()
      
      toast({
        title: "Success",
        description: `Successfully created ${gradeForm.data.divisions.length} classes for ${selectedGradeOption.label}`,
      })
      setIsGradeDialogOpen(false)
      gradeForm.resetForm()
    } catch (error: any) {
      console.error("Error creating classes:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create classes",
        variant: "destructive",
      })
    } finally {
      gradeForm.setLoading(false)
    }
  }

  const handleAddDivision = () => {
    if (!divisionForm.validateForm()) return

    const existingDivision = gradeForm.data.divisions.find((div) => div.name === divisionForm.data.name.toUpperCase())
    if (existingDivision) {
      toast({
        title: "Error",
        description: "Division already exists",
        variant: "destructive",
      })
      divisionForm.updateField("name", "")
      return
    }

    const newDivision: DivisionConfig = {
      id: `div-${Date.now()}`,
      name: divisionForm.data.name.toUpperCase(),
      maxStudents: divisionForm.data.maxStudents,
    }

    gradeForm.updateField("divisions", [...gradeForm.data.divisions, newDivision])
    divisionForm.resetForm()
    setIsDivisionDialogOpen(false)
  }

  const handleRemoveDivision = (divisionId: string) => {
    gradeForm.updateField(
      "divisions",
      gradeForm.data.divisions.filter((div) => div.id !== divisionId),
    )
  }

  const handleToggleClassStatus = async (cls: Class) => {
    const newStatus = cls.status === "active" ? "inactive" : "active"
    
    try {
      await authFetch(`${API_BASE_URL}/api/classes/${cls.id}`, token, { method: 'PUT', body: JSON.stringify({ status: newStatus }) })
      await loadClasses() // Reload classes after update
      toast({
        title: "Success",
        description: `Class ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
      })
    } catch (error: any) {
      console.error("Error updating class status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update class status",
        variant: "destructive",
      })
    }
  }

  const handleGradeDialogClose = () => {
    setIsGradeDialogOpen(false)
    gradeForm.resetForm()
  }

  const handleClassClick = (cls: Class) => {
    // Navigate to students page with the selected class
    router.push(`/dashboard/school-admin/students?classId=${cls.id}&className=${encodeURIComponent(cls.gradeName + ' ' + cls.division)}`);
  }

  // Group classes by grade for better organization
  const groupedClasses = classes.reduce((acc, cls) => {
    if (!acc[cls.gradeName]) {
      acc[cls.gradeName] = []
    }
    acc[cls.gradeName].push(cls)
    return acc
  }, {} as Record<string, Class[]>)

  const stats = {
    totalGrades: Object.keys(groupedClasses).length,
    totalClasses: classes.length,
    activeClasses: classes.filter((c) => c.status === "active").length,
    unassignedClasses: classes.filter((c) => !c.teacherId && c.status === "active").length,
  }

  const columns: Column<ExtendedClass>[] = [
    {
      key: "gradeName" as keyof ExtendedClass,
      label: "Grade",
      sortable: true,
    },
    {
      key: "division" as keyof ExtendedClass,
      label: "Division",
      sortable: true,
    },
    {
      key: "teacherName" as keyof ExtendedClass,
      label: "Teacher",
      render: (value: string) => value || <Badge variant="outline">Unassigned</Badge>,
    },
    {
      key: "studentCount" as keyof ExtendedClass,
      label: "Students",
      render: (value: number, row: ExtendedClass) => `${value}/${row.maxStudents}`,
    },
    {
      key: "status" as keyof ExtendedClass,
      label: "Status",
      render: (value: string) => (
        <Badge variant={value === "active" ? "default" : "secondary"}>
          {value === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions" as keyof ExtendedClass,
      label: "Actions",
      render: (value: string, row: ExtendedClass) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClass(row)}
            disabled={row.studentCount > 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggleClassStatus(row)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <DashboardLayout
        navigation={getNavigation(studentsCount)}
        userRole="School Admin"
        userName={user?.displayName || "School Admin"}
        userEmail={user?.email || ""}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading classes...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        navigation={getNavigation(studentsCount)}
        userRole="School Admin"
        userName={user?.displayName || "School Admin"}
        userEmail={user?.email || ""}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="mt-2 text-red-600">{error}</p>
            <Button onClick={() => loadClasses()} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      navigation={getNavigation(studentsCount)}
      userRole="School Admin"
      userName={user?.displayName || "School Admin"}
      userEmail={user?.email || ""}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
            <p className="text-gray-600">Configure grades, divisions, and manage class assignments</p>
          </div>
          <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Grade
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Grade</DialogTitle>
                <DialogDescription>
                  Configure a new grade level with divisions for your school.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade Level</Label>
                  <Select
                    value={gradeForm.data.gradeValue}
                    onValueChange={(value) => {
                      const selectedOption = gradeOptions.find((g) => g.value === value)
                      gradeForm.updateField("gradeValue", value)
                      gradeForm.updateField("gradeName", selectedOption?.label || "")
                    }}
                  >
                    <SelectTrigger className={gradeForm.errors.gradeValue ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map((grade) => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {gradeForm.errors.gradeValue && <p className="text-sm text-red-500">{gradeForm.errors.gradeValue}</p>}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Divisions</Label>
                    <Dialog open={isDivisionDialogOpen} onOpenChange={setIsDivisionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Division
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add Division</DialogTitle>
                          <DialogDescription>Create a new division for this grade level.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="divisionName">Division Name</Label>
                            <Input
                              id="divisionName"
                              value={divisionForm.data.name}
                              onChange={(e) => divisionForm.updateField("name", e.target.value.toUpperCase())}
                              placeholder="A"
                              maxLength={1}
                              className={divisionForm.errors.name ? "border-red-500" : ""}
                            />
                            {divisionForm.errors.name && (
                              <p className="text-sm text-red-500">{divisionForm.errors.name}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="maxStudents">Max Students</Label>
                            <Input
                              id="maxStudents"
                              type="number"
                              value={divisionForm.data.maxStudents}
                              onChange={(e) => divisionForm.updateField("maxStudents", parseInt(e.target.value) || 0)}
                              min={1}
                              max={50}
                              className={divisionForm.errors.maxStudents ? "border-red-500" : ""}
                            />
                            {divisionForm.errors.maxStudents && (
                              <p className="text-sm text-red-500">{divisionForm.errors.maxStudents}</p>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddDivision}>Add Division</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {gradeForm.data.divisions.length > 0 ? (
                    <div className="space-y-2">
                      {gradeForm.data.divisions.map((division) => (
                        <div
                          key={division.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                        >
                          <div>
                            <span className="font-medium">Division {division.name}</span>
                            <span className="text-sm text-gray-600 ml-2">Max: {division.maxStudents} students</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDivision(division.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 italic">No divisions added yet</p>
                  )}
                  {gradeForm.errors.divisions && <p className="text-sm text-red-500">{gradeForm.errors.divisions}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleGradeDialogClose}>
                  Cancel
                </Button>
                <Button onClick={handleGradeSubmit} disabled={gradeForm.isLoading}>
                  {gradeForm.isLoading ? "Creating..." : "Create Classes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentsCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGrades}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClasses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unassignedClasses}</div>
            </CardContent>
          </Card>
        </div>

        {/* Classes Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Classes</CardTitle>
            <CardDescription>Manage all classes in your school</CardDescription>
          </CardHeader>
          <CardContent>
            {classes.length > 0 ? (
            <DataTable<ExtendedClass>
              data={classes}
              columns={columns}
                isLoading={loading}
                onDelete={handleDeleteClass}
                onRowClick={handleClassClick}
              searchPlaceholder="Search classes..."
            />
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No classes found. Add your first grade to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
