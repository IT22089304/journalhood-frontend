import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Get the token from cookies
  const token = request.cookies.get('auth-token')?.value;

  console.log('🔍 Middleware called for:', pathname, 'Token:', token ? 'exists' : 'none');

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login', '/demo', '/setup', '/webStudent'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  console.log('🔍 Is public path?', isPublicPath, 'Path:', pathname);

  // If it's a public path, allow access
  if (isPublicPath) {
    console.log('✅ Allowing access to public path:', pathname);
    return NextResponse.next();
  }

  // Allow all student Flutter app static files to be accessed
  // Also clear any school auth cookies for student routes to prevent interference
  if (pathname.startsWith('/webStudent/')) {
    console.log('✅ Allowing access to Flutter app static files:', pathname);
    const response = NextResponse.next();
    
    // Clear ALL possible auth cookies for student app isolation
    const authCookies = [
      'auth-token',
      'firebase-auth-session', 
      'firebase-auth-user',
      '__session',
      'firebase-heartbeat-database',
      'firebase-heartbeat-store'
    ];
    
    authCookies.forEach(cookieName => {
      response.cookies.set(cookieName, '', { 
        expires: new Date(0), 
        path: '/',
        httpOnly: false 
      });
      response.cookies.set(cookieName, '', { 
        expires: new Date(0), 
        path: '/webStudent/',
        httpOnly: false 
      });
    });
    
    console.log('🧹 Cleared all authentication cookies for student app isolation');
    return response;
  }

  // Protected school dashboard paths
  const isSchoolDashboard = pathname.startsWith('/dashboard');

  // Handle school dashboard access
  if (isSchoolDashboard && !token) {
    console.log('🔒 Redirecting to school login - no token for dashboard:', pathname);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Handle school dashboard access with invalid token
  if (isSchoolDashboard && token && (token.trim() === '' || token === 'undefined' || token === 'null')) {
    console.log('🔒 Redirecting to school login - invalid token for dashboard:', pathname);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('auth-token', '', { expires: new Date(0), path: '/' });
    return response;
  }

  // Handle school login page access
  if (pathname === '/login' && token && token.trim() !== '' && token !== 'undefined' && token !== 'null') {
    console.log('ℹ️ User has token but accessing login page - allowing for re-authentication');
  }

  console.log('✅ Middleware allowing access to:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 