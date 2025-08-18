"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/firebase/auth-context"

export default function ProfilePage() {
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [organization, setOrganization] = useState("")
  const [role, setRole] = useState("")

  useEffect(() => {
    if (!user) return
    setDisplayName(user.displayName || "")
    setEmail(user.email || "")
    setRole((user as any).role || "")
    // Optionally fetch extended profile from backend later
    setLoading(false)
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Placeholder: wire to backend update endpoint per role later
      await new Promise((r) => setTimeout(r, 500))
      alert("Profile saved")
    } finally {
      setSaving(false)
    }
  }

  const navigation = [
    { title: "Profile", url: "/dashboard/profile", icon: (() => null) as any, isActive: true },
  ]

  return (
    <DashboardLayout
      navigation={navigation}
      userRole={role || "User"}
      userName={displayName || "User"}
      userEmail={email || ""}
    >
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-gray-600">Update your personal information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
            <CardDescription>Visible to your organization admins</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <Input value={email} disabled />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +123456789" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Organization</label>
                <Input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="School / District" />
              </div>
            </div>
            <div className="pt-2">
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


