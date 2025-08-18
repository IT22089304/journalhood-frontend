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
  LinkIcon
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
import { districtAdminResourceApi } from "@/lib/api"
import { districtAdminAnalyticsApi } from "@/lib/api"
import { Resource } from "@/lib/types"

const navigation = [
  { title: "Analytics", url: "/dashboard/district-admin/analytics", icon: TrendingUp },
  { title: "Admins", url: "/dashboard/district-admin/admins", icon: Users },
]

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

interface AssignResourceDialogProps {
  resource: Resource | null
  isOpen: boolean
  onClose: () => void
  onAssigned: () => void
}

function AssignResourceDialog({ resource, isOpen, onClose, onAssigned }: AssignResourceDialogProps) {
  const { token } = useAuth()
  const { toast } = useToast()
  const [schoolAdmins, setSchoolAdmins] = useState<any[]>([])
  const [schools, setSchools] = useState<any[]>([])
  const [selectedSchoolAdmin, setSelectedSchoolAdmin] = useState("")
  const [selectedSchool, setSelectedSchool] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && token) {
      loadSchoolAdmins()
    }
  }, [isOpen, token])

  const loadSchoolAdmins = async () => {
    try {
      const response = await districtAdminResourceApi.getAvailableSchoolAdmins(token)
      setSchoolAdmins(response.schoolAdmins)
      setSchools(response.schools)
    } catch (error) {
      console.error('Error loading school admins:', error)
      toast({
        title: "Error",
        description: "Failed to load school admins",
        variant: "destructive",
      })
    }
  }

  const handleAssign = async () => {
    if (!resource || !selectedSchoolAdmin || !selectedSchool) {
      toast({
        title: "Error",
        description: "Please select both a school admin and a school",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await districtAdminResourceApi.assignResourceToSchoolAdmin({
        resourceId: resource.id,
        schoolAdminId: selectedSchoolAdmin,
        targetSchoolId: selectedSchool,
      }, token)

      toast({
        title: "Success",
        description: "Resource assigned successfully",
      })
      onAssigned()
      onClose()
    } catch (error: any) {
      console.error('Error assigning resource:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to assign resource",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Resource to School</DialogTitle>
          <DialogDescription>
            Select a school admin and school to assign "{resource?.title}" to.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="schoolAdmin">School Admin</Label>
            <Select value={selectedSchoolAdmin} onValueChange={setSelectedSchoolAdmin}>
              <SelectTrigger>
                <SelectValue placeholder="Select a school admin" />
              </SelectTrigger>
              <SelectContent>
                {schoolAdmins.map((admin) => (
                  <SelectItem key={admin.uid} value={admin.uid}>
                    {admin.displayName || admin.email} {admin.school && `(${admin.school.name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="school">Target School</Label>
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger>
                <SelectValue placeholder="Select a school" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isLoading}>
            {isLoading ? "Assigning..." : "Assign Resource"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function DistrictAdminResourcesPage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  // New: State for flagged students
  const [flaggedStudents, setFlaggedStudents] = useState<any[]>([])
  const [flaggedLoading, setFlaggedLoading] = useState(true)

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [activeCategory, setActiveCategory] = useState<"depression" | "bullying" | "introvert" | "language_problem">("depression")

  useEffect(() => {
    if (token) {
      loadResources()
      loadFlaggedStudents()
    }
  }, [token])

  const loadResources = async () => {
    setLoading(true)
    try {
      const response = await districtAdminResourceApi.getAssignedResources({
        page: 1,
        limit: 100,
        status: undefined,
        type: undefined,
      }, token)
      setResources(response.resources)
    } catch (error: any) {
      console.error('Error loading resources:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load resources",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // New: Load flagged students and filter by districtId
  const loadFlaggedStudents = async () => {
    setFlaggedLoading(true)
    try {
      const response = await districtAdminAnalyticsApi.getFlaggedStudentsReport(token) as any
      // Filter flagged students by districtId
      const districtId = user?.districtId
      const filtered = (response.data.flaggedStudents || []).filter(
        (student: any) => student.districtId === districtId
      )
      setFlaggedStudents(filtered)
    } catch (error: any) {
      console.error('Error loading flagged students:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load flagged students",
        variant: "destructive",
      })
    } finally {
      setFlaggedLoading(false)
    }
  }

  const getResourcesByCategory = (category: string) => {
    return resources.filter(resource => resource.category === category)
  }

  // New: Get flagged students by category
  const getFlaggedStudentsByCategory = (category: string) => {
    return flaggedStudents.filter(student => student.issueType === category)
  }

  const handleAssignResource = (resource: Resource) => {
    setSelectedResource(resource)
    setIsAssignDialogOpen(true)
  }

  const handleAssignmentComplete = () => {
    loadResources() // Refresh the list
  }



  const resourceColumns = [
    {
      key: "title" as keyof Resource,
      label: "Title",
      sortable: true,
      render: (value: string, resource: Resource) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {resource.description || "No description"}
          </div>
        </div>
      ),
    },
    {
      key: "type" as keyof Resource,
      label: "Type",
      render: (value: string) => (
        <Badge variant="secondary">{value}</Badge>
      ),
    },
    {
      key: "url" as keyof Resource,
      label: "Link",
      render: (value: string) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(value, '_blank')}
          className="h-8 px-2"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      ),
    },
    {
      key: "status" as keyof Resource,
      label: "Status",
      render: (value: string) => (
        <Badge variant={value === "active" ? "default" : "outline"}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: "createdAt" as keyof Resource,
      label: "Date Added",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ]

  const renderActions = (resource: Resource) => (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAssignResource(resource)}
        disabled={resource.status !== 'active'}
      >
        <Send className="h-4 w-4 mr-1" />
        Assign
      </Button>
    </div>
  )

  // Add columns for flagged students table
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

  return (
    <DashboardLayout
      navigation={navigation}
      userRole="District Admin"
      userName={user?.displayName || "District Admin"}
      userEmail={user?.email || "admin@journalhood.com"}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mental Health Resources</h1>
            <p className="text-gray-500">Manage and assign resources for the 4 predefined issue categories to schools in your district</p>
          </div>
        </div>

        {/* Issue Categories Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {ISSUE_CATEGORIES.map((category) => {
            const Icon = category.icon
            const categoryResources = getResourcesByCategory(category.key)
            const categoryFlagged = getFlaggedStudentsByCategory(category.key)
            return (
              <Card key={category.key} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{category.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold mt-1">{categoryFlagged.length} <span className="text-base font-normal text-gray-400">flagged students</span></div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Resources by Category */}
        {/* Removed Resources by Category section */}

        {/* Flagged Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Flagged Students</CardTitle>
            <CardDescription>
              View and manage flagged students by issue type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={flaggedStudents}
              columns={flaggedStudentColumns}
              searchPlaceholder="Search flagged students..."
              isLoading={flaggedLoading}
            />
          </CardContent>
        </Card>

      </div>

      {/* Assign Resource Dialog */}
      <AssignResourceDialog
        resource={selectedResource}
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        onAssigned={handleAssignmentComplete}
      />
    </DashboardLayout>
  )
} 