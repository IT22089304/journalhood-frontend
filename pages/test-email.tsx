import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const testFirebaseEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/super-admin/test-firebase-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Firebase email test passed! Check your inbox.',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Firebase email test failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test Firebase email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Firebase Email Test</CardTitle>
          <CardDescription>
            Test if Firebase Auth email templates are working properly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email to test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={testFirebaseEmail} 
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Firebase Email'}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Test Result:</h3>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-2">📋 Troubleshooting Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to Firebase Console → Authentication → Templates</li>
              <li>Enable "Password reset" template</li>
              <li>Add localhost to Authorized domains</li>
              <li>Check spam folder</li>
              <li>Verify Firebase project settings</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 