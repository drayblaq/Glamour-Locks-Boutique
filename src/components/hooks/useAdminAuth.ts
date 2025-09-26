'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function useAdminAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return;
    
    if (status === 'loading') return; // Still loading

    console.log('useAdminAuth check:', { 
      pathname, 
      status, 
      isAdmin: session?.user?.isAdmin,
      hasRedirected: hasRedirected.current 
    });

    // FIXED: Don't redirect if we're already on login page or any admin/login path
    if (pathname === '/admin/login' || pathname.startsWith('/admin/login')) {
      return; // Let the login page handle its own logic
    }

    // Only redirect if user is not admin and not on login page
    if (!session?.user?.isAdmin) {
      console.log('Redirecting to login from useAdminAuth');
      hasRedirected.current = true;
      router.replace('/admin/login');
    }
  }, [session, status, router, pathname]);

  return {
    session,
    isLoading: status === 'loading',
    isAdmin: session?.user?.isAdmin || false,
  };
}