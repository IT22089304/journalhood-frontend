"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/firebase/auth-context"
import { firebaseEmailTemplates } from "@/lib/firebase-email-templates"
import { Mail, Building2, TrendingUp, ExternalLink } from "lucide-react"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://journalhood-backend-production.up.railway.app'

const navigation = [
  { title: "Districts & Admins", url: "/dashboard/super-admin/districts", icon: Building2 },
  { title: "Schools", url: "/dashboard/super-admin/schools", icon: Building2 },
  { title: "Analytics", url: "/dashboard/super-admin/analytics", icon: TrendingUp },
  { title: "Resources", url: "/dashboard/super-admin/resources", icon: ExternalLink },
  { title: "Demo Requests", url: "/dashboard/super-admin/emails", icon: Mail, isActive: true },
]

export default function SuperAdminEmailsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)


  return (
    <DashboardLayout
      navigation={navigation}
      userRole="Super Admin"
      userName={user?.displayName || "Super Admin"}
      userEmail={user?.email || "admin@journalhood.com"}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Demo Requests</h1>
          <p className="text-gray-600">Captured from the public Request Demo form</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
            <CardDescription>Latest submissions first</CardDescription>
          </CardHeader>
          <CardContent>
            <RequestsTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function RequestsTable() {
  const { token } = useAuth()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const formatCreatedAt = (createdAt: any): string => {
    try {
      if (!createdAt) return ''
      // Firestore Timestamp serialized by admin SDK
      if (typeof createdAt?._seconds === 'number') return new Date(createdAt._seconds * 1000).toLocaleString()
      // Client SDK shape
      if (typeof createdAt?.seconds === 'number') return new Date(createdAt.seconds * 1000).toLocaleString()
      // If API returned ISO string or Date
      const asDate = new Date(createdAt)
      if (!isNaN(asDate.getTime())) return asDate.toLocaleString()
      return ''
    } catch {
      return ''
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        setError(null)
        const res = await fetch(`${API_BASE_URL}/api/demo/requests`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: 'include',
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Request failed (${res.status})`)
        }
        const data = await res.json()
        setRows(Array.isArray(data.requests) ? data.requests : [])
      } finally {
        setLoading(false)
      }
    }
    if (token) load()
  }, [token])

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>
  if (error) return <div className="text-sm text-red-500">{error}</div>
  if (rows.length === 0) return <div className="text-sm text-gray-500">No demo requests yet.</div>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Institution</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Phone</th>
            <th className="py-2 pr-4">Students</th>
            <th className="py-2 pr-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b last:border-0">
              <td className="py-2 pr-4">{formatCreatedAt(r.createdAt)}</td>
              <td className="py-2 pr-4">{r.firstName} {r.lastName}</td>
              <td className="py-2 pr-4">{r.institutionName}</td>
              <td className="py-2 pr-4">{r.workEmail}</td>
              <td className="py-2 pr-4">{r.phone}</td>
              <td className="py-2 pr-4">{r.numberOfStudents}</td>
              <td className="py-2 pr-4">
                <button
                  className="px-3 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/mail`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          firstname: r.firstName,
                          lastname: r.lastName,
                          institutionName: r.institutionName,
                          workEmail: r.workEmail,
                          phone: r.phone,
                          role: r.role || 'admin',
                          numberOfStudents: r.numberOfStudents,
                          message: r.message || ''
                        })
                      })
                      if (!res.ok) alert('Failed to send email')
                      else alert('Email sent')
                    } catch (e) {
                      alert('Failed to send email')
                    }
                  }}
                >
                  Confirm
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function InboxTable() {
  const { token } = useAuth()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setError(null)
        const res = await fetch(`${API_BASE_URL}/api/demo/inbox`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: 'include',
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Request failed (${res.status})`)
        }
        const data = await res.json()
        setRows(Array.isArray(data.emails) ? data.emails : [])
      } finally {
        setLoading(false)
      }
    }
    if (token) load()
  }, [token])

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>
  if (error) return <div className="text-sm text-red-500">{error}</div>
  if (rows.length === 0) return <div className="text-sm text-gray-500">No emails found.</div>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">From</th>
            <th className="py-2 pr-4">Subject</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.uid} className="border-b last:border-0">
              <td className="py-2 pr-4">{r.date ? new Date(r.date).toLocaleString() : ''}</td>
              <td className="py-2 pr-4">{r.from}</td>
              <td className="py-2 pr-4">{r.subject}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


