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
  Building2, 
  Users, 
  TrendingUp, 
  Edit, 
  Trash2,
  Send,
  Globe,
  Shield,
  BookOpen,
  Loader2,
  LinkIcon,
  Brain,
  UserX,
  Languages,
  Frown,
  AlertTriangle,
  Mail
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
import { resourceApi, api } from "@/lib/api"
import type { Resource, District, CreateResourceRequest, UpdateResourceRequest, AssignResourceRequest } from "@/lib/types"

const navigation = [
  { title: "Districts & Admins", url: "/dashboard/super-admin/districts", icon: Building2 },
  { title: "Schools", url: "/dashboard/super-admin/schools", icon: Building2 },
  { title: "Analytics", url: "/dashboard/super-admin/analytics", icon: TrendingUp },
  { title: "Resources", url: "/dashboard/super-admin/resources", icon: ExternalLink, isActive: true },
  { title: "Demo Requests", url: "/dashboard/super-admin/emails", icon: Mail },
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

export default function SuperAdminResourcesPage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  
  // State
  const [resources, setResources] = useState<Resource[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [loading, setLoading] = useState(true)
  const [districtsLoading, setDistrictsLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState<"depression" | "bullying" | "introvert" | "language_problem">("depression")
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false) // Add loading state for create operation
  const [isEditing, setIsEditing] = useState(false) // Add loading state for edit operation
  const [isDeleting, setIsDeleting] = useState(false) // Add loading state for delete operation
  
  // Form states
  const [createFormData, setCreateFormData] = useState<CreateResourceRequest>({
    title: "",
    description: "",
    url: "",
    type: "link",
    category: "depression" as const
  })
  const [editFormData, setEditFormData] = useState<UpdateResourceRequest>({})
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  
  // Assignment states
  const [assignFormData, setAssignFormData] = useState<AssignResourceRequest>({
    resourceId: "",
    assignedTo: "",
    assignedToRole: "district-admin",
    targetType: "district",
    targetId: "",
    targetName: ""
  })

  // Load data
  useEffect(() => {
    loadResources()
    loadDistricts()
  }, [token])

  const loadResources = async () => {
    if (!token) return
    try {
      setLoading(true)
      const response = await resourceApi.getResources({ status: 'all' }, token)
      setResources(response.resources || [])
    } catch (error) {
      console.error('Error fetching resources:', error)
      toast({
        title: "Error",
        description: "Failed to load resources. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDistricts = async () => {
    if (!token) return
    try {
      setDistrictsLoading(true)
      const response = await api.get<{ districts: District[] }>('/api/super-admin/get-all-districts', token)
      setDistricts(response.districts || [])
    } catch (error) {
      console.error('Error fetching districts:', error)
      toast({
        title: "Error",
        description: "Failed to load districts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDistrictsLoading(false)
    }
  }

  // Create Resource
  const handleCreateResource = async () => {
    if (!token || isCreating) return // Prevent multiple submissions
    
    console.log('Creating resource with data:', createFormData) // Debug log
    
    if (!createFormData.title || !createFormData.url || !createFormData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Title, URL, and Category).",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreating(true) // Set loading state
      await resourceApi.createResource(createFormData, token)
      toast({
        title: "Success",
        description: "Resource added successfully!",
      })
      setIsCreateDialogOpen(false)
      setCreateFormData({
        title: "",
        description: "",
        url: "",
        type: "link",
        category: activeCategory
      })
      loadResources()
    } catch (error) {
      console.error('Error creating resource:', error)
      toast({
        title: "Error",
        description: "Failed to add resource. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false) // Reset loading state
    }
  }

  // Edit Resource
  const handleEditResource = async () => {
    if (!token || !selectedResource || isEditing) return // Prevent multiple submissions
    
    try {
      setIsEditing(true) // Set loading state
      await resourceApi.updateResource(selectedResource.id, editFormData, token)
      toast({
        title: "Success",
        description: "Resource updated successfully!",
      })
      setIsEditDialogOpen(false)
      setSelectedResource(null)
      setEditFormData({})
      loadResources()
    } catch (error) {
      console.error('Error updating resource:', error)
      toast({
        title: "Error",
        description: "Failed to update resource. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEditing(false) // Reset loading state
    }
  }

  // Delete Resource
  const handleDeleteResource = async (resource: Resource) => {
    if (!token || isDeleting) return // Prevent multiple submissions
    
    if (!window.confirm(`Are you sure you want to delete "${resource.title}"?`)) {
      return
    }
    
    try {
      setIsDeleting(true) // Set loading state
      await resourceApi.deleteResource(resource.id, token)
      toast({
        title: "Success",
        description: "Resource deleted successfully!",
      })
      loadResources()
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast({
        title: "Error",
        description: "Failed to delete resource. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false) // Reset loading state
    }
  }

  // Assign Resource
  const handleAssignResource = async () => {
    if (!token || !selectedResource || !assignFormData.targetId) return
    
    try {
      await resourceApi.assignResource({
      ...assignFormData,
        resourceId: selectedResource.id,
        assignedTo: "", // Will be populated based on targetId
      }, token)
      
      toast({
        title: "Success",
        description: "Resource assigned successfully!",
      })
      setIsAssignDialogOpen(false)
      setSelectedResource(null)
      setAssignFormData({
        resourceId: "",
        assignedTo: "",
        assignedToRole: "district-admin",
        targetType: "district",
        targetId: "",
        targetName: ""
      })
    } catch (error) {
      console.error('Error assigning resource:', error)
      toast({
        title: "Error",
        description: "Failed to assign resource. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openCreateDialog = (category?: "depression" | "bullying" | "introvert" | "language_problem") => {
    setCreateFormData({
      title: "",
      description: "",
      url: "",
      type: "link",
      category: category || activeCategory
    })
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (resource: Resource) => {
    setSelectedResource(resource)
    setEditFormData({
      title: resource.title,
      description: resource.description,
      url: resource.url,
      status: resource.status,
    })
    setIsEditDialogOpen(true)
  }

  const openAssignDialog = (resource: Resource) => {
    setSelectedResource(resource)
    setAssignFormData({
      resourceId: resource.id,
      assignedTo: "",
      assignedToRole: "district-admin",
      targetType: "district",
      targetId: "",
      targetName: ""
    })
    setIsAssignDialogOpen(true)
  }

  const renderActions = (resource: Resource) => (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => openEditDialog(resource)}
        disabled={isEditing || isDeleting || isCreating}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => openAssignDialog(resource)}
        disabled={isEditing || isDeleting || isCreating}
      >
        <Send className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDeleteResource(resource)}
        className="text-red-600 hover:text-red-700"
        disabled={isDeleting || isEditing || isCreating}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
        <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  )

  const getResourcesByCategory = (category: string) => {
    return resources.filter(resource => resource.category === category)
  }

  if (loading) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="Super Admin"
        userName={user?.displayName || "Super Admin"}
        userEmail={user?.email || "admin@journalhood.com"}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      navigation={navigation}
      userRole="Super Admin"
      userName={user?.displayName || "Super Admin"}
      userEmail={user?.email || "admin@journalhood.com"}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mental Health Resources</h1>
            <p className="text-gray-500">Manage resources for the 4 predefined issue categories</p>
          </div>
        </div>

        {/* Issue Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {ISSUE_CATEGORIES.map((category) => {
            const Icon = category.icon
            const categoryResources = getResourcesByCategory(category.key)
            return (
              <Card key={category.key} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{category.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                  <div className="text-2xl font-bold">{categoryResources.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {categoryResources.filter(r => r.status === 'active').length} active
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={() => openCreateDialog(category.key as "depression" | "bullying" | "introvert" | "language_problem")}
                    disabled={isCreating || isEditing || isDeleting}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Resource
                  </Button>
            </CardContent>
          </Card>
            )
          })}
        </div>

        {/* Resources by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Resources by Issue Category</CardTitle>
            <CardDescription>
              Manage educational resources organized by mental health issue categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as "depression" | "bullying" | "introvert" | "language_problem")}>
              <TabsList className="grid w-full grid-cols-4">
                {ISSUE_CATEGORIES.map((category) => {
                  const Icon = category.icon
                  return (
                    <TabsTrigger key={category.key} value={category.key}>
                      <Icon className="h-4 w-4 mr-2" />
                      {category.label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              
              {ISSUE_CATEGORIES.map((category) => {
                const categoryResources = getResourcesByCategory(category.key)
                return (
                  <TabsContent key={category.key} value={category.key} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{category.label} Resources</h3>
                        <p className="text-sm text-gray-500">{category.description}</p>
                      </div>
                      <Button onClick={() => openCreateDialog(category.key as "depression" | "bullying" | "introvert" | "language_problem")} disabled={isCreating || isEditing || isDeleting}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Resource
                      </Button>
                    </div>
                    
            <DataTable
                      data={categoryResources}
              columns={resourceColumns}
                      searchPlaceholder={`Search ${category.label.toLowerCase()} resources...`}
              customActions={renderActions}
            />
                  </TabsContent>
                )
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* Create Resource Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) {
            setIsCreating(false) // Reset loading state when dialog closes
          }
        }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Resource</DialogTitle>
              <DialogDescription>
                Add a new resource to the selected issue category
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Issue Category *</Label>
                <Select
                  value={createFormData.category}
                  onValueChange={(value: "depression" | "bullying" | "introvert" | "language_problem") => 
                    setCreateFormData({...createFormData, category: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_CATEGORIES.map((category) => (
                      <SelectItem key={category.key} value={category.key}>
                        <div className="flex items-center gap-2">
                          <category.icon className="h-4 w-4" />
                          {category.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({...createFormData, title: e.target.value})}
                  placeholder="Enter resource title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                  placeholder="Enter resource description"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={createFormData.url}
                  onChange={(e) => setCreateFormData({...createFormData, url: e.target.value})}
                  placeholder="https://example.com/resource"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
                Cancel
              </Button>
              <Button onClick={handleCreateResource} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Resource"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Resource Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setIsEditing(false) // Reset loading state when dialog closes
          }
        }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Resource</DialogTitle>
              <DialogDescription>
                Update the resource information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title || ""}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  placeholder="Enter resource title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description || ""}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  placeholder="Enter resource description"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-url">URL</Label>
                <Input
                  id="edit-url"
                  type="url"
                  value={editFormData.url || ""}
                  onChange={(e) => setEditFormData({...editFormData, url: e.target.value})}
                  placeholder="https://example.com/resource"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editFormData.status || ""}
                  onValueChange={(value: "active" | "archived") => setEditFormData({...editFormData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isEditing}>
                Cancel
              </Button>
              <Button onClick={handleEditResource} disabled={isEditing}>
                {isEditing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Resource"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Resource Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Assign Resource</DialogTitle>
              <DialogDescription>
                Assign this resource to a district admin
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Resource</Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="font-medium">{selectedResource?.title}</div>
                  <div className="text-sm text-gray-500">{selectedResource?.url}</div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="target-district">Target District *</Label>
                <Select
                  value={assignFormData.targetId}
                  onValueChange={(value) => {
                    setAssignFormData({
                      ...assignFormData,
                      targetId: value,
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem 
                        key={district.id} 
                        value={district.id}
                        disabled={!district.adminId}
                      >
                        {district.name} {district.adminId ? `(${district.adminName})` : '(No Admin Assigned)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {districts.filter(d => !d.adminId).length > 0 && (
                  <p className="text-sm text-gray-500">
                    Note: Districts without admins are disabled. Please assign district admins first.
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assignment-role">Assignment Role</Label>
                <Select
                  value={assignFormData.assignedToRole}
                  onValueChange={(value: "district-admin" | "school-admin" | "teacher") => 
                    setAssignFormData({...assignFormData, assignedToRole: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="district-admin">District Admin</SelectItem>
                    <SelectItem value="school-admin">School Admin</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignResource}>
                Assign Resource
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
} 