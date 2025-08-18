import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '@/lib/firebase/config';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Lock, Mail, CheckCircle } from 'lucide-react';

export default function AuthActionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState('');
  const [oobCode, setOobCode] = useState('');
  const [step, setStep] = useState<'loading' | 'reset' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const { mode: queryMode, oobCode: queryOobCode } = router.query;
    
    if (queryMode && queryOobCode) {
      setMode(queryMode as string);
      setOobCode(queryOobCode as string);
      
      if (queryMode === 'resetPassword') {
        verifyPasswordResetCode(auth, queryOobCode as string)
          .then((email) => {
            setEmail(email);
            setStep('reset');
          })
          .catch((error) => {
            console.error('Error verifying reset code:', error);
            setError('Invalid or expired reset link');
            setStep('error');
          });
      }
    }
  }, [router.query]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStep('success');
      toast({
        title: 'Success',
        description: 'Password has been reset successfully',
      });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Verifying reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Invalid Link</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={handleLoginRedirect} className="w-full">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-green-600 flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Password Reset Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Your password has been successfully reset. You can now login with your new password.
              </p>
              <Button onClick={handleLoginRedirect} className="w-full">
                Continue to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Reset Your Password</CardTitle>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            {email}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 