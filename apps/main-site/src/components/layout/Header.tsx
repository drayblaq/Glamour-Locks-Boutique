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
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { LogIn, UserPlus } from 'lucide-react';

const Header = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  const { customer, isAuthenticated } = useCustomerAuth();

  useEffect(() => {
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
      <div className="container mx-auto flex h-20 items-center justify-between px-2 sm:px-6 lg:px-8">
        {/* Logo - Left */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Navigation Links - Center */}
        <nav className="hidden lg:flex items-center justify-center flex-1 mx-2 sm:mx-8">
          <div className="flex items-center space-x-4 sm:space-x-8">
            {navigationLinks.map((link) => {
              const isActive = pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-lg font-bold px-6 py-3 rounded-full transition-all duration-300 ease-in-out relative group",
                    isActive
                      ? "text-white bg-white/20 shadow-lg backdrop-blur-sm"
                      : "text-white hover:text-gray-200 hover:bg-white/15 hover:shadow-lg hover:backdrop-blur-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-pink-500"
                  )}
                >
                  {link.label}
                  <span className={cn(
                    "absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 bg-white rounded-full transition-all duration-300 ease-out",
                    isActive ? "w-8" : "w-0 group-hover:w-full"
                  )}></span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Icons - Right */}
        <div className="flex items-center ml-auto">
          <div className="flex items-center gap-4 sm:gap-6 bg-white/20 rounded-full px-1 sm:px-2 py-1 shadow-md backdrop-blur-md border border-white/30">
            {/* Shopping Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-white/30 transition-all duration-200 border-none"
              asChild
              aria-label="Shopping Cart"
            >
              <Link href="/cart" className="flex items-center justify-center w-full h-full">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center border-2 border-white">
                    {totalItems}
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
            {!isAuthenticated ? (
              <>
                <Button asChild size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button asChild size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
                  <Link href="/register">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </Link>
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                onClick={() => router.push('/account')}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                My account
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;