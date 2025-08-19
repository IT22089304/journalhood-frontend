"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { 
  ExternalLink, 
  BarChart3, 
  School as SchoolIcon, 
  Users, 
  TrendingUp, 
  Send,
  BookOpen,
  Search,
  Plus,
  Brain,
  UserX,
  Languages,
  Frown,
  LinkIcon,
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
import { schoolAdminResourceApi } from "@/lib/api"
import { Resource } from "@/lib/types"
// import { analyticsApi } from "@/lib/api";

const navigation = [
  { title: "Classes", url: "/dashboard/school-admin/classes", icon: SchoolIcon },
  { title: "Teachers", url: "/dashboard/school-admin/teachers", icon: Users },
  { title: "Analytics", url: "/dashboard/school-admin/analytics", icon: TrendingUp },
  { title: "Resources", url: "/dashboard/school-admin/resources", icon: ExternalLink, isActive: true },
];

// Predefined issue categories
const ISSUE_CATEGORIES = [
  {
    key: "depression",
    label: "Depression",
    icon: Frown,
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Resources for students dealing with depression and mental health issues"
  },
  {
    key: "bullying",
    label: "Bullying",
    icon: UserX,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Anti-bullying resources and support materials"
  },
  {
    key: "introvert",
    label: "Introvert",
    icon: Brain,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Resources for introverted students and social confidence building"
  },
  {
    key: "language_problem",
    label: "Language Problem",
    icon: Languages,
    color: "bg-green-100 text-green-800 border-green-200",
    description: "English language learning and comprehension resources"
  }
]

interface Teacher {
  uid: string
  email: string
  displayName: string
  classes: Array<{
    id: string
    gradeName: string
    division: string
    studentCount: number
    maxStudents: number
  }>
}

interface Class {
  id: string
  gradeName: string
  division: string
  teacherId: string
  teacherName: string
  studentCount: number
  maxStudents: number
  status: string
}

const resourceColumns = [
  {
    key: "title" as keyof Resource,
    label: "Title",
    sortable: true,
    render: (value: string, resource: Resource) => (
      <div className="flex items-center gap-2">
        <LinkIcon className="h-4 w-4 text-blue-500" />
        <div>
          <div className="font-medium">{value}</div>
          {resource.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {resource.description}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "url" as keyof Resource,
    label: "URL",
    render: (value: string) => (
      <a 
        href={value} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-700 flex items-center gap-1 max-w-xs truncate"
      >
        {value}
        <ExternalLink className="h-3 w-3" />
      </a>
    ),
  },
  {
    key: "category" as keyof Resource,
    label: "Category",
    render: (value: string) => {
      const category = ISSUE_CATEGORIES.find(cat => cat.key === value)
      return (
        <Badge variant="secondary" className={category?.color}>
          {category?.label || value}
        </Badge>
      )
    },
  },
  {
    key: "status" as keyof Resource,
    label: "Status",
    render: (value: string) => (
      <Badge variant={value === "active" ? "default" : "secondary"}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
  },
  {
    key: "createdAt" as keyof Resource,
    label: "Created",
    render: (value: Date) => new Date(value).toLocaleDateString(),
  },
]

export default function SchoolAdminResourcesPage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  
  // State
  const [resources, setResources] = useState<Resource[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<string>("")

  const [assigningResource, setAssigningResource] = useState(false)
  const [activeCategory, setActiveCategory] = useState<"depression" | "bullying" | "introvert" | "language_problem">("depression")

  // Removed flagged students table per request


  // Load initial data
  useEffect(() => {
    if (token) {
      loadData()
    }
  }, [token])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load resources, teachers, and assignments in parallel
      const [resourcesResponse, teachersResponse] = await Promise.all([
        schoolAdminResourceApi.getAssignedResources({ page: 1, limit: 100 }, token),
        schoolAdminResourceApi.getAvailableTeachers(token)
      ])

      setResources(resourcesResponse.resources)
      setTeachers(teachersResponse.teachers)
      setClasses(teachersResponse.classes)



      console.log('📊 Loaded school admin resources:', {
        resources: resourcesResponse.count,
        teachers: teachersResponse.teachers.length,
        classes: teachersResponse.classes.length
      })

    } catch (error) {
      console.error('❌ Error loading school admin resources:', error)
      toast({
        title: "Error",
        description: "Failed to load resources. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssignResource = async () => {
    if (!selectedResource || !selectedTeacher) {
      toast({
        title: "Error",
        description: "Please select both a resource and teacher.",
        variant: "destructive",
      })
      return
    }

    try {
      setAssigningResource(true)
      
      const assignmentData: any = {
        resourceId: selectedResource.id,
        teacherId: selectedTeacher,
      }

      // Add class if specified
      if (selectedClass && selectedClass !== "all") {
        assignmentData.targetClassId = selectedClass
      }

      await schoolAdminResourceApi.assignResourceToTeacher(assignmentData, token)

      toast({
        title: "Success",
        description: "Resource assigned to teacher successfully!",
      })

      // Reset form
      setSelectedResource(null)
      setSelectedTeacher("")
      setSelectedClass("")
      setAssignDialogOpen(false)

      // Reload data to reflect changes
      loadData()

    } catch (error: any) {
      console.error('❌ Error assigning resource:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to assign resource. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAssigningResource(false)
    }
  }

    

  // Get teacher classes for assignment dialog
  const getTeacherClasses = (teacherId: string) => {
    const teacher = teachers.find(t => t.uid === teacherId)
    return teacher?.classes || []
  }

  const getResourcesByCategory = (category: string) => {
    return resources.filter(resource => resource.category === category)
  }

  const renderActions = (resource: Resource) => (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setSelectedResource(resource)
          setAssignDialogOpen(true)
        }}
        disabled={resource.status !== 'active'}
      >
        <Send className="h-4 w-4 mr-1" />
        Assign to Teacher
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(resource.url, '_blank')}
      >
        <ExternalLink className="h-4 w-4 mr-1" />
        View
      </Button>
    </div>
  )

  if (loading) {
    return (
      <DashboardLayout 
        userRole="school-admin"
        userName={user?.displayName || 'School Admin'}
        userEmail={user?.email || ''}
        navigation={navigation}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading resources...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      userRole="school-admin"
      userName={user?.displayName || 'School Admin'}
      userEmail={user?.email || ''}
      navigation={navigation}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mental Health Resources</h1>
          <p className="text-muted-foreground">
            Manage and assign resources for the 4 predefined issue categories to your teachers
          </p>
        </div>



        {/* Issue Categories Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {ISSUE_CATEGORIES.map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.key} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{category.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent />
              </Card>
            )
          })}
        </div>

        {/* Flagged Students Table removed */}



        {/* Assignment Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Assign Resource to Teacher</DialogTitle>
              <DialogDescription>
                Select a teacher to assign "{selectedResource?.title}" to.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Teacher</label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.uid} value={teacher.uid}>
                        {teacher.displayName} ({teacher.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTeacher && (
                <div>
                  <label className="text-sm font-medium">Target Class (Optional)</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a specific class or assign to teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Assign to Teacher (All Classes)</SelectItem>
                      {getTeacherClasses(selectedTeacher).map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.gradeName} - {cls.division} ({cls.studentCount} students)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssignResource}
                disabled={!selectedTeacher || assigningResource}
              >
                {assigningResource && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign Resource
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
} 