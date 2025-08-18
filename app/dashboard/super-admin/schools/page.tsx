"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, StatusBadge } from "@/components/ui/data-table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Users, GraduationCap, BarChart3, TrendingUp, School, MapPin, Loader2, ArrowLeft, ChevronRight, ExternalLink, Plus, AlertTriangle, Mail } from "lucide-react"
import { useAuth } from '@/lib/firebase/auth-context'
import { useSchools } from '@/hooks/use-schools'
import { useToast } from "@/components/ui/use-toast"
import { api } from '@/lib/api'
import type { School as SchoolType, District } from '@/lib/types'

const navigation = [
  { title: "Districts & Admins", url: "/dashboard/super-admin/districts", icon: Building2 },
  { title: "Schools", url: "/dashboard/super-admin/schools", icon: Building2, isActive: true },
  { title: "Analytics", url: "/dashboard/super-admin/analytics", icon: TrendingUp },
  { title: "Resources", url: "/dashboard/super-admin/resources", icon: ExternalLink },
  { title: "Demo Requests", url: "/dashboard/super-admin/emails", icon: Mail },
];

type Column<T> = {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

const schoolColumns: Column<SchoolType>[] = [
  {
    key: "name" as keyof SchoolType,
    label: "School Name",
    sortable: true,
    render: (value: string, row: SchoolType) => (
      <div>
        <div className="font-medium">{value}</div>
        <div className="text-sm text-gray-500 flex items-center">
          <MapPin className="w-3 h-3 mr-1" />
          {row.address}
        </div>
      </div>
    ),
  },
  {
    key: "districtName" as keyof SchoolType,
    label: "District",
    sortable: true,
  },
  {
    key: "studentCount" as keyof SchoolType,
    label: "Students",
    sortable: true,
    render: (value: number) => (
      <div className="text-center">
        <div className="font-medium">{value.toLocaleString()}</div>
      </div>
    ),
  },
  {
    key: "teacherCount" as keyof SchoolType,
    label: "Teachers",
    sortable: true,
    render: (value: number) => (
      <div className="text-center">
        <div className="font-medium">{value}</div>
      </div>
    ),
  },
  {
    key: "status" as keyof SchoolType,
    label: "Status",
    render: (value: "active" | "suspended") => <StatusBadge status={value} />, 
  },
  // Removed the 'createdAt' column
]

function SuperAdminSchoolsInner() {
  const { user, token } = useAuth()
  const { schools, loading, error, toggleSchoolStatus, createSchool } = useSchools()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const districtId = searchParams?.get('districtId')
  const districtName = searchParams?.get('districtName')

  // State for create school dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])
  const [createSchoolData, setCreateSchoolData] = useState({
    name: '',
    address: '',
    districtId: districtId || '',
    adminName: '',
    adminEmail: '',
    contactPhone: ''
  })
  const [isCreatingSchool, setIsCreatingSchool] = useState(false)
  
  // Debug URL parameters
  console.log('🌐 URL Parameters:', {
    districtId,
    districtName,
    searchParams: searchParams?.toString(),
    currentDistrictInForm: createSchoolData.districtId
  })

  // Filter schools by district if districtId is provided
  const filteredSchools = districtId 
    ? schools.filter(school => school.districtId === districtId)
    : schools

  // Debug logging
  useEffect(() => {
    console.log('🔍 Schools Debug Info:', {
      districtId,
      districtName,
      totalSchools: schools.length,
      filteredSchools: filteredSchools.length,
      allSchools: schools.map(s => ({ id: s.id, name: s.name, districtId: s.districtId }))
    })
  }, [schools, districtId, districtName, filteredSchools.length])

  // Ensure districtId is set in form when available from URL
  useEffect(() => {
    if (districtId && createSchoolData.districtId !== districtId) {
      console.log('🔧 Setting districtId from URL:', districtId)
      setCreateSchoolData(prev => ({
        ...prev,
        districtId: districtId
      }))
    }
  }, [districtId, createSchoolData.districtId])

  const stats = {
    totalSchools: filteredSchools.length,
    activeSchools: filteredSchools.filter((s) => s.status === "active").length,
    totalStudents: filteredSchools.reduce((sum, school) => sum + school.studentCount, 0),
    totalTeachers: filteredSchools.reduce((sum, school) => sum + school.teacherCount, 0),
  }

  // Fetch districts for the create school form
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!token || user?.role !== 'super-admin') return

      try {
        const response = await api.get<{ districts: District[] }>('/api/super-admin/get-all-districts', token)
        setDistricts(response.districts || [])
      } catch (error) {
        console.error('Error fetching districts:', error)
      }
    }

    fetchDistricts()
  }, [token, user?.role])

  const handleToggleStatus = async (school: SchoolType) => {
    try {
      await toggleSchoolStatus(school.id)
      toast({
        title: "Success",
        description: `School status has been ${school.status === "active" ? "suspended" : "activated"}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update school status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBackToDistricts = () => {
    router.push('/dashboard/super-admin/districts')
  }

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔍 Form Debug - Current form data:', {
      formData: createSchoolData,
      urlDistrictId: districtId,
      urlDistrictName: districtName,
      selectedDistrict: districts.find(d => d.id === createSchoolData.districtId),
      allDistricts: districts.map(d => ({ id: d.id, name: d.name }))
    })
    
    // Check for empty or missing required fields
    const missingFields = []
    if (!createSchoolData.name?.trim()) missingFields.push('School Name')
    if (!createSchoolData.address?.trim()) missingFields.push('Address')
    if (!createSchoolData.districtId?.trim()) missingFields.push('District')
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields)
      toast({
        title: "Error", 
        description: `Please fill in all required fields: ${missingFields.join(', ')}.`,
        variant: "destructive",
      })
      return
    }

    setIsCreatingSchool(true)
    try {
      console.log('🏫 Creating school with data:', {
        ...createSchoolData,
        currentDistrictId: districtId,
        currentDistrictName: districtName
      })
      
      await createSchool(createSchoolData)
      toast({
        title: "Success",
        description: "School created successfully!",
      })
      setIsCreateDialogOpen(false)
      setCreateSchoolData({
        name: '',
        address: '',
        districtId: districtId || '',
        adminName: '',
        adminEmail: '',
        contactPhone: ''
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create school. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingSchool(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setCreateSchoolData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="Super Admin"
        userName={(user as any)?.displayName || "Super Admin"}
        userEmail={user?.email || "admin@journalhood.com"}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading schools data...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="Super Admin"
        userName={(user as any)?.displayName || "Super Admin"}
        userEmail={user?.email || "admin@journalhood.com"}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      navigation={navigation}
      userRole="Super Admin"
      userName={(user as any)?.displayName || "Super Admin"}
      userEmail={user?.email || "admin@journalhood.com"}
    >
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        {districtId && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDistricts}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Districts
            </Button>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-gray-900">{districtName}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-500">Schools</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {districtName ? `Schools in ${districtName}` : 'Schools'}
            </h1>
            <p className="text-gray-600">
              {districtName 
                ? `Manage and monitor schools in ${districtName} district`
                : 'Manage and monitor all schools in the system'
              }
            </p>
          </div>
          
          {user?.role === 'super-admin' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-gray-300"
              >
                Refresh
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add School
                  </Button>
                </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New School</DialogTitle>
                  <DialogDescription>
                    Add a new school to the system. School admin details are optional and can be assigned later by the district admin.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSchool} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="schoolName">School Name *</Label>
                      <Input
                        id="schoolName"
                        placeholder="Enter school name"
                        value={createSchoolData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        placeholder="Enter school address"
                        value={createSchoolData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="district">District *</Label>
                      {districtName && districtId && (
                        <div className="text-sm text-blue-600 mb-1">
                          Creating school for: {districtName}
                        </div>
                      )}
                      <Select
                        value={createSchoolData.districtId}
                        onValueChange={(value) => {
                          console.log('🔧 District selected:', value, districts.find(d => d.id === value)?.name)
                          handleInputChange('districtId', value)
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={districtName ? `${districtName} (pre-selected)` : "Select district"} />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((district) => (
                            <SelectItem key={district.id} value={district.id}>
                              {district.name}
                              {district.id === districtId && " (current)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="adminName">School Admin Name (optional)</Label>
                      <Input
                        id="adminName"
                        placeholder="Enter admin name (can be assigned later)"
                        value={createSchoolData.adminName}
                        onChange={(e) => handleInputChange('adminName', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="adminEmail">School Admin Email (optional)</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        placeholder="Enter admin email (can be assigned later)"
                        value={createSchoolData.adminEmail}
                        onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        placeholder="Enter contact phone (optional)"
                        value={createSchoolData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={isCreatingSchool}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreatingSchool}>
                      {isCreatingSchool ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create School'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          )}
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSchools}</div>
              <p className="text-xs text-muted-foreground">{stats.activeSchools} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">System-wide enrollment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all schools</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSchools}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.activeSchools / stats.totalSchools) * 100)}% active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Schools Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Schools</CardTitle>
            <CardDescription>
              Managing {stats.totalSchools} schools with {stats.totalTeachers.toLocaleString()} teachers and {stats.totalStudents.toLocaleString()} students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredSchools}
              columns={schoolColumns}
              searchPlaceholder="Search schools..."
              onToggleStatus={handleToggleStatus}
              isLoading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function SuperAdminSchools() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SuperAdminSchoolsInner />
    </Suspense>
  )
}
