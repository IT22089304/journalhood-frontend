import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Building2, School, Users, GraduationCap } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">JournalHood</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Demo</h1>
          <p className="text-gray-600">Choose a role to explore the corresponding dashboard</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Super Admin</CardTitle>
              <CardDescription>
                Manage multiple districts, create new districts, and monitor system-wide performance across all schools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/super-admin/analytics">
                <Button className="w-full">Access Super Admin Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <School className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>District Admin</CardTitle>
              <CardDescription>
                Manage schools within your district, add new schools, and monitor district-wide student wellness
                metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/district-admin/analytics">
                <Button className="w-full">Access District Admin Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <School className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>School Admin</CardTitle>
              <CardDescription>
                Manage classes and teachers in your school, create new class sections, and monitor school performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/school-admin/analytics">
                <Button className="w-full">Access School Admin Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>Teacher</CardTitle>
              <CardDescription>
                Manage your classroom, add students, monitor engagement, and view collective class wellness insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/teacher/analytics">
                <Button className="w-full">Access Teacher Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>Student</CardTitle>
              <CardDescription>
                Access your private journal, write daily entries, and engage with guided wellness prompts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/webStudent/index.html">
                <Button className="w-full">Access Student Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-indigo-200">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>Login Page</CardTitle>
              <CardDescription>
                Go to the main login page to experience the full authentication flow with role selection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button variant="outline" className="w-full bg-transparent">
                  Go to Login Page
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-indigo-600 hover:underline">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
