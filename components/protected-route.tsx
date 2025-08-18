"use client"

import { useEffect } from 'react'
import { useAuth } from '@/lib/firebase/auth-context'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = [],
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If still loading, wait
    if (loading) return

    // If no user or token, redirect to login
    if (!user || !token) {
      console.log('ProtectedRoute - No user/token, redirecting to:', redirectTo)
      router.replace(redirectTo)
      return
    }

    // If specific roles are required, check if user has allowed role
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      console.log('ProtectedRoute - User role not allowed:', user.role, 'Allowed:', allowedRoles)
      router.replace('/login')
      return
    }

    console.log('ProtectedRoute - Access granted for user:', user.role)
  }, [user, loading, token, allowedRoles, redirectTo, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Verifying access...</span>
        </div>
      </div>
    )
  }

  // If not authenticated or wrong role, show loading while redirecting
  if (!user || !token || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Redirecting...</span>
        </div>
      </div>
    )
  }

  // User is authenticated and has correct role, render children
  return <>{children}</>
} 