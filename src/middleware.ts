import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // Only protect admin routes
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      // If not authenticated, redirect to admin login
      if (!req.nextauth.token) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
      
      // If not admin, redirect to admin login
      if (!req.nextauth.token?.isAdmin) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Only require authentication for admin routes (except login)
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
          return !!token?.isAdmin;
        }
        
        // Allow all other routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 