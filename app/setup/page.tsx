"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { createInitialUsers, createTestUser } from '@/lib/firebase/seed-data';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateUsers = async () => {
    setLoading(true);
    try {
      await createInitialUsers();
      toast({
        title: "Success",
        description: "Initial users created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-[600px]">
        <CardHeader>
          <CardTitle>JournalHood Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Create Initial Users</h3>
            <p className="text-gray-600 mb-4">
              This will create test users for each role with the following credentials:
            </p>
            <div className="space-y-2 text-sm">
              <div><strong>Super Admin:</strong> superadmin@journalhood.com / password123</div>
              <div><strong>District Admin:</strong> districtadmin@journalhood.com / password123</div>
              <div><strong>School Admin:</strong> schooladmin@journalhood.com / password123</div>
              <div><strong>Teacher:</strong> teacher@journalhood.com / password123</div>
              <div><strong>Student:</strong> student@journalhood.com / password123</div>
            </div>
          </div>
          
          <Button 
            onClick={handleCreateUsers} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Creating Users..." : "Create Initial Users"}
          </Button>

          <div className="text-center">
            <a href="/login" className="text-blue-600 hover:underline">
              Go to Login Page
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 