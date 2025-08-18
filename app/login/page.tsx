"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/firebase/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn, user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const dashboardRoutes = {
    'super-admin': '/dashboard/super-admin/analytics',
    'district-admin': '/dashboard/district-admin/analytics',
    'school-admin': '/dashboard/school-admin/analytics',
    'teacher': '/dashboard/teacher/analytics'
    // Note: students should use the student login at /webStudent
  } as const;

  useEffect(() => {
    // Clear any stale school auth token when landing on login page
    if (!authLoading && !user) {
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    
    // Only redirect if we're not in a loading state and have user data
    if (!authLoading && user?.role) {
      console.log('🔍 School Login - User authenticated:', {
        userRole: user.role,
        userEmail: user.email,
        userName: user.displayName,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
      
      // If user is a student, redirect them to the student login
      if (user.role === 'student') {
        console.log('⚠️ Student detected on school login - redirecting to student login');
        toast({
          title: "Wrong Login Portal",
          description: "Students should use the Student Login button. Redirecting you now...",
          variant: "default",
        });
        setTimeout(() => {
          window.location.href = '/webStudent/index.html';
        }, 2000);
        return;
      }
      
      const route = dashboardRoutes[user.role as keyof typeof dashboardRoutes];
      console.log('🎯 Redirect route for school user:', { role: user.role, route });
      
      if (route) {
        console.log('👨‍💼 School user authenticated - redirecting to dashboard');
        router.push(route);
      } else {
        console.error('❌ Invalid role for school login:', user.role);
        toast({
          title: "Access Denied",
          description: `Your role "${user.role}" cannot access the school portal. Please contact your administrator.`,
          variant: "destructive",
        });
      }
    } else if (!authLoading) {
      console.log('⏳ School login - waiting for authentication:', { 
        authLoading, 
        hasUser: !!user, 
        userRole: user?.role
      });
    }
  }, [user, authLoading, router, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
      // Don't redirect here - let the useEffect handle it after user data is loaded
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to sign in",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-200 via-indigo-200 to-cyan-200">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // If user is already logged in, show loading while redirecting
  if (user?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-200 via-indigo-200 to-cyan-200">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Redirecting to dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-200 via-indigo-200 to-cyan-200">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>School Portal Login</CardTitle>
          <CardDescription>Sign in to your school administrator or teacher account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <div className="text-center text-sm text-gray-600">
              Are you a student?{' '}
              <button
                type="button"
                onClick={() => window.location.href = '/webStudent/index.html'}
                className="text-blue-600 hover:underline"
              >
                Use Student Login
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
