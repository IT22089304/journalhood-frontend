"use client"

import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function StudentLoginPage() {
  useEffect(() => {
    console.log('🎓 Student Portal - Redirecting directly to Flutter app');
    
    // Direct redirect to Flutter app after a short delay
    // This bypasses any authentication checks
    const timer = setTimeout(() => {
      console.log('🚀 Redirecting to Flutter app at webStudent/index.html');
      // Use window.location.replace to avoid back button issues
      window.location.replace('/webStudent/index.html');
    }, 1000);

    return () => clearTimeout(timer);
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Welcome to JournalHood! 🎓
        </h2>
        <p className="text-gray-600 mb-2">
          Taking you to your personal journal app...
        </p>
        <p className="text-sm text-gray-500">
          Your thoughts are private and secure
        </p>
      </div>
    </div>
  )
} 