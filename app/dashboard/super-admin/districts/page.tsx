"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable, StatusBadge } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Building2, Users, TrendingUp, Loader2, ExternalLink, Plus, Globe, AlertTriangle, BookOpen } from "lucide-react"
import { useAuth } from '@/lib/firebase/auth-context'
import { api } from '@/lib/api'
import { useForm } from "@/hooks/use-form"
import { useToast } from "@/components/ui/use-toast"
import { countries, getDefaultCountry } from "@/lib/countries"
import type { District } from "@/lib/types"
import { useDistrictAdmins } from "@/hooks/use-district-admins"

const navigation = [
  { title: "Districts & Admins", url: "/dashboard/super-admin/districts", icon: Building2, isActive: true },
  { title: "Schools", url: "/dashboard/super-admin/schools", icon: Building2 },
  { title: "Analytics", url: "/dashboard/super-admin/analytics", icon: TrendingUp },
  { title: "Resources", url: "/dashboard/super-admin/resources", icon: ExternalLink },
  { title: "Demo Requests", url: "/dashboard/super-admin/emails", icon: BookOpen },
]

const districtColumns = [
  {
    key: "name" as keyof District,
    label: "District Name",
    sortable: true,
  },
  {
    key: "adminName" as keyof District,
    label: "Admin Name",
    sortable: true,
    render: (value: string) => <div className="font-medium">{value || 'Unassigned'}</div>,
  },
  {
    key: "adminEmail" as keyof District,
    label: "Admin Email",
    sortable: true,
    render: (value: string) => <div className="text-sm text-gray-500">{value || '-'}</div>,
  },
  {
    key: "schoolCount" as keyof District,
    label: "Schools",
    sortable: true,
    render: (value: number) => <div className="text-center font-medium">{value}</div>,
  },
  {
    key: "classCount" as keyof District,
    label: "Classes",
    sortable: true,
    render: (value: number) => <div className="text-center font-medium">{value || 0}</div>,
  },
  {
    key: "studentCount" as keyof District,
    label: "Students",
    sortable: true,
    render: (value: number) => <div className="text-center font-medium">{value ? value.toLocaleString() : '0'}</div>,
  },
  {
    key: "status" as keyof District,
    label: "Status",
    render: (value: "active" | "suspended") => <StatusBadge status={value} />,
  },
]

export default function SuperAdminDistricts() {
  const [districts, setDistricts] = useState<District[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  // Add state for Add District Admin dialog
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false)
  const [adminName, setAdminName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminDistrictId, setAdminDistrictId] = useState("")
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminMobile, setAdminMobile] = useState("")
  const { user, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { districtAdmins, loading: adminsLoading, error: adminsError, refetch: refetchAdmins, deleteDistrictAdmin, updateDistrictAdmin } = useDistrictAdmins()
  // Edit dialog state for district admins
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editUid, setEditUid] = useState<string>("")
  const [editName, setEditName] = useState<string>("")
  const [editEmail, setEditEmail] = useState<string>("")
  const [editMobile, setEditMobile] = useState<string>("")
  const [editDistrictId, setEditDistrictId] = useState<string>("")
  

  // Form for creating districts
  const form = useForm(
    {
      name: "",
      country: getDefaultCountry().code,
    },
    {
      name: (value: string) => {
        if (!value?.trim()) return "District name is required"
        if (value.length < 2) return "District name must be at least 2 characters"
        return null
      },
      country: (value: string) => {
        if (!value) return "Country is required"
        return null
      },
    }
  )

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!token) return
      try {
        const response = await api.get<{ districts: District[] }>('/api/super-admin/get-all-districts', token)
        setDistricts(response.districts)
      } catch (error) {
        console.error('Error fetching districts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDistricts()
  }, [token])

  const handleDelete = async (district: District) => {
    if (confirm(`Are you sure you want to delete ${district.name}?`)) {
      try {
        await api.delete(`/api/super-admin/delete-district/${district.id}`, token)
        // Refresh districts list
        const response = await api.get<{ districts: District[] }>('/api/super-admin/get-all-districts', token)
        setDistricts(response.districts)
      } catch (error) {
        console.error("Error deleting district:", error)
      }
    }
  }

  const handleDistrictClick = (district: District) => {
    // Navigate to schools page with the selected district
    router.push(`/dashboard/super-admin/schools?districtId=${district.id}&districtName=${encodeURIComponent(district.name)}`)
  }

  const handleSubmit = async () => {
    if (!form.validateForm()) return

    setFormLoading(true)
    try {
      const selectedCountry = countries.find(c => c.code === form.data.country)
      
      const districtData = {
        name: form.data.name.trim(),
        country: selectedCountry?.name || form.data.country,
        countryCode: form.data.country,
      }

      await api.post('/api/super-admin/create-district', districtData, token)
      
      toast({
        title: "Success",
        description: "District created successfully",
      })

      // Refresh districts list
      const response = await api.get<{ districts: District[] }>('/api/super-admin/get-all-districts', token)
      setDistricts(response.districts)
      
      // Close dialog and reset form
      setIsDialogOpen(false)
      form.resetForm()
    } catch (error) {
      console.error("Error creating district:", error)
      toast({
        title: "Error",
        description: "Failed to create district. Please try again.",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    form.resetForm()
  }

  // Add handler for creating district admin
  const handleCreateAdmin = async () => {
    if (!adminName.trim() || !adminEmail.trim() || !adminDistrictId || !adminMobile.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields.",
        variant: "destructive",
      })
      return
    }
    // E.164 format validation (simple)
    if (!/^\+\d{10,15}$/.test(adminMobile.trim())) {
      toast({
        title: "Validation Error",
        description: "Mobile number must be in E.164 format (e.g. +12345678901)",
        variant: "destructive",
      })
      return
    }
    setAdminLoading(true)
    try {
      await api.post('/api/super-admin/create-district-admin', {
        name: adminName.trim(),
        email: adminEmail.trim(),
        districtId: adminDistrictId,
        phone: adminMobile.trim()
      }, token)
      toast({
        title: "Success",
        description: "District admin created successfully",
      })
      // Refresh districts list
      const response = await api.get<{ districts: District[] }>('/api/super-admin/get-all-districts', token)
      setDistricts(response.districts)
      // Close dialog and reset form
      setIsAdminDialogOpen(false)
      setAdminName("")
      setAdminEmail("")
      setAdminDistrictId("")
      setAdminMobile("")
    } catch (error) {
      console.error("Error creating district admin:", error)
      toast({
        title: "Error",
        description: "Failed to create district admin. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAdminLoading(false)
    }
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
          <span className="ml-2">Loading districts...</span>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Districts</h1>
            <p className="text-gray-600">Manage all districts in the system</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add District
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New District</DialogTitle>
                  <DialogDescription>
                    Create a new district to organize schools and administrators.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">District Name</Label>
                    <Input
                      id="name"
                      value={form.data.name}
                      onChange={(e) => form.updateField("name", e.target.value)}
                      onBlur={() => form.validateField("name")}
                      placeholder="Enter district name"
                      className={form.errors.name ? "border-red-500" : ""}
                    />
                    {form.errors.name && <p className="text-sm text-red-500">{form.errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Country
                    </Label>
                    <Select
                      value={form.data.country}
                      onValueChange={(value) => form.updateField("country", value)}
                    >
                      <SelectTrigger className={form.errors.country ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <div className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.name}</span>
                              <span className="text-gray-500 text-sm">({country.phoneCode})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.errors.country && <p className="text-sm text-red-500">{form.errors.country}</p>}
                    <p className="text-xs text-gray-500">
                      This will be used for phone number validation and regional settings.
                    </p>
                  </div>


                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleDialogClose} disabled={formLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={formLoading || !form.isValid}>
                    {formLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create District"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* Add District Admin Button and Dialog */}
            <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Add District Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add District Admin</DialogTitle>
                  <DialogDescription>
                    Create a new district admin and assign them to a district.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Admin Name</Label>
                    <Input id="adminName" value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="Enter admin name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input id="adminEmail" type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="Enter admin email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminMobile">Mobile Number</Label>
                    <Input id="adminMobile" value={adminMobile} onChange={e => setAdminMobile(e.target.value)} placeholder="e.g. +12345678901" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="districtSelect">Assign to District</Label>
                    <Select value={adminDistrictId} onValueChange={setAdminDistrictId}>
                      <SelectTrigger id="districtSelect">
                        <SelectValue placeholder="Select a district" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAdminDialogOpen(false)} disabled={adminLoading}>Cancel</Button>
                  <Button variant="outline" onClick={handleCreateAdmin} disabled={adminLoading}>
                    {adminLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>) : "Create Admin"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Districts Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Districts</CardTitle>
            <CardDescription>Manage districts and their information</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={districts}
              columns={districtColumns}
              searchPlaceholder="Search districts..."
              onDelete={handleDelete}
              onRowClick={handleDistrictClick}
            />
          </CardContent>
        </Card>

        {/* District Admins Table */}
        <Card>
          <CardHeader>
            <CardTitle>District Admins</CardTitle>
            <CardDescription>Manage district administrators</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={districtAdmins as any}
              isLoading={adminsLoading}
              columns={[
                { key: 'displayName', label: 'Name', sortable: true },
                { key: 'email', label: 'Email', sortable: true, render: (v) => <span className="text-sm text-gray-600">{v}</span> },
                { key: 'districtCol' as any, label: 'District', render: (_: any, row: any) => <span>{row.customClaims?.districtName || '-'}</span> },
                { key: 'statusCol' as any, label: 'Status', render: (_: any, row: any) => <StatusBadge status={row.disabled ? 'suspended' : 'active'} /> },
                { key: 'createdCol' as any, label: 'Created', render: (_: any, row: any) => <span className="text-sm text-gray-500">{row.metadata?.creationTime ? new Date(row.metadata.creationTime).toLocaleString() : '-'}</span> },
                { key: 'signinCol' as any, label: 'Last Sign-in', render: (_: any, row: any) => <span className="text-sm text-gray-500">{row.metadata?.lastSignInTime ? new Date(row.metadata.lastSignInTime).toLocaleString() : '-'}</span> },
              ]}
              customActions={(row: any) => (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditUid(row.uid)
                      setEditName(row.displayName || '')
                      setEditEmail(row.email || '')
                      setEditMobile(row.phoneNumber || '')
                      setEditDistrictId(row.customClaims?.districtId || '')
                      setIsEditDialogOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async (e) => {
                      e.stopPropagation()
                      if (confirm(`Remove district admin ${row.email}?`)) {
                        await deleteDistrictAdmin(row.uid)
                        await refetchAdmins()
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
              searchPlaceholder="Search admins..."
            />
          </CardContent>
        </Card>

        {/* Edit District Admin Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit District Admin</DialogTitle>
              <DialogDescription>Update administrator details.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Name</Label>
                <Input id="editName" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input id="editEmail" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMobile">Mobile</Label>
                <Input id="editMobile" value={editMobile} onChange={e => setEditMobile(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDistrict">District</Label>
                <Select value={editDistrictId} onValueChange={setEditDistrictId}>
                  <SelectTrigger id="editDistrict">
                    <SelectValue placeholder="Select a district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!editUid || !editEmail.trim() || !editName.trim() || !editDistrictId) return
                  await updateDistrictAdmin(editUid, {
                    email: editEmail.trim(),
                    name: editName.trim(),
                    phone: editMobile.trim(),
                    districtId: editDistrictId,
                  })
                  await refetchAdmins()
                  setIsEditDialogOpen(false)
                }}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
