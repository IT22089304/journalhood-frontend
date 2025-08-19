"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DataTable } from "@/components/ui/data-table"
import { useAuth } from "@/lib/firebase/auth-context"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://journalhood-backend-production.up.railway.app'
import { Student } from "@/lib/types"
import { Column } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const navigation = [
  { title: "Students", url: "/dashboard/teacher/students", icon: TrendingUp, isActive: true },
  { title: "Analytics", url: "/dashboard/teacher/analytics", icon: TrendingUp },
]

export default function TeacherStudentsPage() {
  const { user, token, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (!authLoading && token) {
      loadStudents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/teachers/students`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`Failed to load (${res.status})`)
      const data = await res.json()
      setStudents((data?.students || []).map((s: any) => ({
        uid: s.uid || '',
        displayName: s.displayName || '',
        email: s.email || '',
        status: s.status || 'pending',
        journalEntries: s.journalEntries || 0,
        lastActivity: s.lastActivity || null,
        customClaims: s.customClaims || {},
      })))
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

  const studentColumns: Column<Student>[] = [
    {
      key: "displayName",
      label: "Name",
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
    },
    {
      key: "lastActivity",
      label: "Last Activity",
      render: (value: string | null) => {
        if (!value) return <div className="text-sm text-gray-600">Never</div>;
        try {
          const date = new Date(value);
          const now = new Date();
          const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
          if (diffInHours < 24) {
            if (diffInHours < 1) {
              const minutes = Math.floor(diffInHours * 60);
              return <div className="text-sm text-gray-600">{minutes} minutes ago</div>;
            }
            return <div className="text-sm text-gray-600">{Math.floor(diffInHours)} hours ago</div>;
          } else if (diffInHours < 48) {
            return <div className="text-sm text-gray-600">Yesterday</div>;
          } else {
            return <div className="text-sm text-gray-600">{date.toLocaleDateString()}</div>;
          }
        } catch (e) {
          return <div className="text-sm text-gray-600">Invalid date</div>;
        }
      },
    },
  ];

  if (authLoading || loading) {
    return (
      <DashboardLayout
        navigation={navigation}
        userRole="Teacher"
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
      userRole="Teacher"
      userName={user?.displayName || "Unknown Teacher"}
      userEmail={user?.email || ""}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-600">Your class students</p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Student
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
            <CardDescription>
              View your students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={studentColumns}
              data={students}
              isLoading={loading}
              searchPlaceholder="Search students..."
            />
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Student name" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  try {
                    if (!token) throw new Error('Not authenticated')
                    if (!name || !email) throw new Error('Name and email are required')
                    await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://journalhood-backend-production.up.railway.app') + '/api/teachers/students', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({ name, email }),
                    })
                    setOpen(false)
                    setName("")
                    setEmail("")
                    loadStudents()
                    toast({ title: 'Student added' })
                  } catch (e: any) {
                    toast({ title: 'Error', description: e.message || 'Failed to add student', variant: 'destructive' })
                  }
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
