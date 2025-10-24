"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import Logo from '@/components/layout/Logo';
import MobileNav from '@/components/layout/MobileNav';
import { useCart } from '@/app/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LogOut } from 'lucide-react';
import { useUser } from '@/components/Providers';
import { LogIn, UserPlus } from 'lucide-react';

const Header = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        router.push('/admin/login');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);

  const navigationLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
    { href: '/about', label: 'About us' },
    { href: '/contact', label: 'Contact' },
    { href: '/cart', label: 'Cart' },

  ];

  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 shadow-xl border-b-4 border-pink-300/30">
      <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Logo - Left */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Navigation Links - Center */}
        <nav className="hidden lg:flex items-center justify-center flex-1 mx-2 sm:mx-8">
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 xl:space-x-8">
            {navigationLinks.map((link) => {
              const isActive = pathname === link.href || 
                             (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm sm:text-base lg:text-lg font-bold px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full transition-all duration-300 ease-in-out relative group min-h-[44px] flex items-center",
                    isActive 
                      ? "text-white bg-white/20 shadow-lg backdrop-blur-sm" 
                      : "text-white hover:text-gray-200 hover:bg-white/15 hover:shadow-lg hover:backdrop-blur-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-pink-500"
                  )}
                >
                  {link.label}
                  <span className={cn(
                    "absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 bg-white rounded-full transition-all duration-300 ease-out",
                    isActive ? "w-6 sm:w-8" : "w-0 group-hover:w-full"
                  )}></span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Icons - Right */}
        <div className="flex items-center ml-auto">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 bg-white/20 rounded-full px-1 sm:px-2 py-1 shadow-md backdrop-blur-md border border-white/30">
            {/* Shopping Cart */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 rounded-full hover:bg-white/30 transition-all duration-200 border-none min-h-[44px] min-w-[44px]"
              asChild 
              aria-label="Shopping Cart"
            >
              <Link href="/cart" className="flex items-center justify-center w-full h-full relative">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center border-2 border-white font-bold">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            </Button>
            {/* Only show the menu icon (MobileNav) on mobile */}
            <div className="flex lg:hidden">
              <MobileNav />
            </div>
          </div>
          {/* Auth Buttons - Desktop only */}
          <div className="hidden lg:flex items-center gap-2 ml-4">
            {!user ? (
              <>
                <Button asChild size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/30 min-h-[44px]">
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button asChild size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/30 min-h-[44px]">
                  <Link href="/register">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </Link>
                </Button>
              </>
            ) : (
              <Button 
                size="sm" 
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 min-h-[44px]"
                onClick={async () => { 
                  await import('firebase/auth').then(({ signOut }) => signOut(require('@/lib/firebase').auth)); 
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;