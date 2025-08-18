"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import { Plus, Users, BarChart3, School as SchoolIcon, TrendingUp, Loader2, ExternalLink, Pencil, BookOpen } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/firebase/auth-context"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import type { SchoolAdmin, School } from "@/lib/types"
import type { SchoolOverview } from "@/hooks/use-district-overview"
import { getColumns } from "./columns"
import { CreateSchoolAdminForm } from "./create-form"

// Remove separate navigation for Admins and Schools, and use a single tab
const navigation = [
  { title: "Analytics", url: "/dashboard/district-admin/analytics", icon: TrendingUp },
  { title: "Admins", url: "/dashboard/district-admin/admins", icon: Users, isActive: true },
];

export default function SchoolsAndAdminsPage() {
  const { user, token, refreshToken } = useAuth()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [admins, setAdmins] = useState<SchoolAdmin[]>([])
  const [schools, setSchools] = useState<SchoolOverview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingAdmin, setEditingAdmin] = useState<SchoolAdmin | null>(null)

  const handleDeleteAdmin = async (admin: SchoolAdmin) => {
    try {
      await api.delete(`/api/district-admin/delete-school-admin/${admin.id}`, token!);
      toast({
        title: "Success",
        description: "Administrator deleted successfully",
      });
      loadAdmins();
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast({
        title: "Error",
        description: "Failed to delete administrator",
        variant: "destructive",
      });
    }
  };

  const loadSchools = async () => {
    try {
      if (!user?.districtId) {
        console.error('No district ID available')
        return
      }

      console.log('Loading schools with:', { districtId: user.districtId })
      const response = await api.get<{ schools: School[] }>(
        `/api/district-admin/schools?districtId=${user.districtId}`,
        token!
      )
      console.log('Schools response:', response)
      
      if (response?.schools) {
        // Map School type to SchoolOverview type
        const schoolOverviews: SchoolOverview[] = response.schools.map(school => ({
          id: school.id,
          name: school.name,
          address: school.address || '',
          admin: school.adminName ? {
            id: school.adminId || '',
            name: school.adminName
          } : null,
          students: 0,
          teachers: 0,
          classes: 0,
          engagement: 0,
          sentiment: 'Neutral' as const
        }))
        console.log('Mapped schools:', schoolOverviews)
        setSchools(schoolOverviews)
      } else {
        console.log('No schools in response:', response)
        setSchools([])
      }
    } catch (error) {
      console.error("Error loading schools:", error)
      
      // Check if the error is "District not found"
      if (error instanceof Error && error.message.includes("District not found")) {
        // Try refreshing the token and retrying
        try {
          await refreshToken()
          // Retry loading schools after token refresh
          await loadSchools()
          return
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError)
        }
      }
      
      toast({
        title: "Error",
        description: "Failed to load schools",
        variant: "destructive",
      })
    }
  }

  const loadAdmins = async () => {
    try {
      if (!user?.districtId) {
        console.error('No district ID available')
        return
      }

      const response = await api.get<{ schoolAdmins: SchoolAdmin[] }>(
        `/api/district-admin/get-school-admins?districtId=${user.districtId}`,
        token!
      )
      console.log('Admins response:', response)
      
      // Ensure all required fields are present and have default values
      const processedAdmins = (response.schoolAdmins || []).map(admin => ({
        ...admin,
        status: admin.status || "active", // Default to active if status is missing
        schoolName: admin.schoolName || "Not Assigned", // Default school name if missing
      }))
      
      setAdmins(processedAdmins)
    } catch (error) {
      console.error("Error loading admins:", error)
      
      // Check if the error is "District not found"
      if (error instanceof Error && error.message.includes("District not found")) {
        // Try refreshing the token and retrying
        try {
          await refreshToken()
          // Retry loading admins after token refresh
          await loadAdmins()
          return
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError)
        }
      }
      
      toast({
        title: "Error",
        description: "Failed to load administrators",
        variant: "destructive",
      })
    }
  }

  // Load schools and admins when component mounts
  useEffect(() => {
    if (user?.districtId && token) {
      console.log('Initial load with:', { districtId: user.districtId })
      setIsLoading(true)
      Promise.all([loadSchools(), loadAdmins()])
        .finally(() => setIsLoading(false))
    }
  }, [user?.districtId, token])

  // Refresh schools when dialog opens
  useEffect(() => {
    if (isDialogOpen && user?.districtId && token) {
      console.log('Refreshing schools on dialog open')
      loadSchools()
    }
  }, [isDialogOpen])

  // Merge schools and admins for display
  const mergedRows = schools.map(school => {
    const admin = admins.find(a => a.schoolId === school.id);
    return {
      schoolId: school.id,
      schoolName: school.name,
      adminId: admin?.id || '',
      adminName: admin?.name || '',
      adminEmail: admin?.email || '',
      status: admin?.status || 'Not assigned',
      schoolStatus: (school as any).status || 'active',
    };
  });

  // Simple rows for Schools table: only School Name and Admin Name
  const schoolsRowsSimple = schools.map((s) => ({
    id: s.id,
    name: s.name,
    adminName: admins.find(a => a.schoolId === s.id)?.name || '-',
  }));

  // Define columns for the merged table (remove schoolStatus and status columns)
  const columns: any[] = [
    { key: 'schoolName', label: 'School Name' },
    { key: 'adminName', label: 'Admin Name' },
    { key: 'adminEmail', label: 'Admin Email' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setEditingAdmin(admins.find(a => a.id === row.adminId) || null); setIsDialogOpen(true); }}>Edit</Button>
          {row.adminId && <Button variant="outline" size="sm" onClick={() => handleDeleteAdmin(admins.find(a => a.id === row.adminId)!)}>Remove</Button>}
        </div>
      ),
    },
  ];

  // Add state for school dialog
  const [isSchoolDialogOpen, setIsSchoolDialogOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [schoolLoading, setSchoolLoading] = useState(false);

  // Add school handler
  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.districtId || !token || !newSchoolName.trim()) return;
    setSchoolLoading(true);
    try {
      await api.post('/api/district-admin/schools', {
        name: newSchoolName.trim(),
        districtId: user.districtId,
      }, token);
      toast({ title: 'Success', description: 'School created successfully' });
      setNewSchoolName('');
      setIsSchoolDialogOpen(false);
      loadSchools();
    } catch (error) {
      console.error('Error creating school:', error);
      toast({ title: 'Error', description: 'Failed to create school. Please try again.', variant: 'destructive' });
    } finally {
      setSchoolLoading(false);
    }
  };

  return (
    <DashboardLayout
      navigation={navigation}
      userRole="District Admin"
      userName={user?.displayName || ""}
      userEmail={user?.email || ""}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Schools & Administrators</h1>
            <p className="text-gray-500">Manage schools and their administrators in your district</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isSchoolDialogOpen} onOpenChange={setIsSchoolDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Add School</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New School</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddSchool}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="schoolName" className="text-sm font-medium">School Name</label>
                      <Input
                        id="schoolName"
                        value={newSchoolName}
                        onChange={(e) => setNewSchoolName(e.target.value)}
                        placeholder="Enter school name"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <Button variant="outline" type="submit" disabled={schoolLoading}>
                      {schoolLoading ? 'Creating...' : 'Create School'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingAdmin(null) }}>
              <DialogTrigger asChild>
                <Button variant="outline">Add School Administrator</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAdmin ? "Edit School Administrator" : "Add School Administrator"}</DialogTitle>
                </DialogHeader>
                <CreateSchoolAdminForm 
                  schools={schools} 
                  admin={editingAdmin || undefined}
                  onSuccess={() => {
                    setIsDialogOpen(false)
                    setEditingAdmin(null)
                    loadAdmins()
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* Schools table */}
        <Card>
          <CardHeader>
            <CardTitle>Schools</CardTitle>
            <CardDescription>All schools in your district</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={schoolsRowsSimple as any}
              isLoading={isLoading}
              columns={[
                { key: 'name', label: 'School Name', sortable: true },
                { key: 'adminName' as any, label: 'Admin Name', render: (v: any) => <span>{v}</span> },
              ]}
              customActions={(row: any) => (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const admin = admins.find(a => a.schoolId === row.id) || null
                      setEditingAdmin(admin)
                      setIsDialogOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                  {admins.find(a => a.schoolId === row.id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const admin = admins.find(a => a.schoolId === row.id)
                        if (admin) handleDeleteAdmin(admin)
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              )}
              searchPlaceholder="Search schools..."
            />
          </CardContent>
        </Card>

        {/* Combined Schools & Admins table */}
        <Card>
          <CardHeader>
            <CardTitle>Schools & Admins</CardTitle>
            <CardDescription>
              A list of all schools and their administrators in your district
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={mergedRows}
              isLoading={isLoading}
              searchPlaceholder="Search schools or admins..."
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
