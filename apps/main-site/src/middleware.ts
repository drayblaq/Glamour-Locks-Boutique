import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { ServerTempAuthService } from '@/lib/server-temp-auth';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // Protect admin routes
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      // Check NextAuth token for admin access
      if (!req.nextauth.token?.isAdmin) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }
    
    // Protect customer routes that require authentication
    const protectedCustomerRoutes = ['/account', '/cart/checkout'];
    if (protectedCustomerRoutes.some(route => pathname.startsWith(route))) {
      // Check for customer token in localStorage (handled client-side)
      // The actual token validation happens in the API routes
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Only require NextAuth authentication for admin routes (except login)
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
          return !!token?.isAdmin;
        }
        
        // Allow all other routes (customer auth is handled via API routes)
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