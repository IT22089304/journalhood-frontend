"use client"

import type React from "react"
import { useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookOpen, LogOut, Settings, User, ChevronDown, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/firebase/auth-context"
import { useRouter } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
  navigation: Array<{
    title: string
    url: string
    icon: React.ComponentType<{ className?: string }>
    isActive?: boolean
  }>
  userRole: string
  userName: string
  userEmail: string
  districtName?: string
}

export function DashboardLayout({ children, navigation, userRole, userName, userEmail, districtName }: DashboardLayoutProps) {
  const { logout, user, loading, token } = useAuth()
  const router = useRouter()

  // Client-side authentication guard
  useEffect(() => {
    console.log('Dashboard Layout - Auth Check:', { user: !!user, loading, token: !!token });
    
    if (!loading && (!user || !token)) {
      console.log('Dashboard Layout - Redirecting to login: user or token missing');
      router.replace('/login');
    }
  }, [user, loading, token, router]);

  const handleLogout = async () => {
    try {
      await logout()
      // Force immediate redirect and clear any cached data
      window.location.href = '/login'
    } catch (error) {
      console.error('Error logging out:', error)
      // Even if logout fails, redirect to login
      window.location.href = '/login'
    }
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render the dashboard
  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Redirecting to login...</span>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar className="bg-gradient-to-b from-blue-200 via-indigo-200 to-cyan-200">
        <SidebarHeader>
          <div className="flex items-center space-x-2 px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">JournalHood</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>
                        {userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-medium">{userName}</span>
                      <span className="text-xs text-gray-500">{userRole}</span>
                      {districtName && (
                        <span className="text-xs text-gray-500">{districtName}</span>
                      )}
                    </div>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-gray-500">{userEmail}</p>
                      {districtName && (
                        <p className="text-xs text-gray-500">{districtName}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex-1 p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 min-h-[calc(100vh-4rem)]">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
