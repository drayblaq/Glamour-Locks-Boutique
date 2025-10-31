"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Logo from '@/components/layout/Logo';
import MobileNav from '@/components/layout/MobileNav';
import { useCart } from '@/app/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
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
  const { totalItems } = useCart();
  
  const [prevTotalItems, setPrevTotalItems] = useState(totalItems);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        router.push('/admin/login');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);

  // Animation effect when cart items change
  useEffect(() => {
    if (totalItems > prevTotalItems) {
      setIsAnimating(true);
      setShowPulse(true);
      
      // Reset animation after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setShowPulse(false);
      }, 600);
      
      return () => clearTimeout(timer);
    }
    setPrevTotalItems(totalItems);
  }, [totalItems, prevTotalItems]);

  const navigationLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
    { href: '/about', label: 'About us' },
    { href: '/contact', label: 'Contact' },
    { href: '/cart', label: 'Cart' },

  ];

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
        <div className="flex items-center ml-auto gap-2 sm:gap-3">
          {/* Shopping Cart - Standalone */}
          <div className="relative">
            <Link 
              href="/cart" 
              className={cn(
                "p-2 hover:scale-110 transition-all duration-200 cursor-pointer block",
                isAnimating && "animate-bounce"
              )}
              aria-label="Shopping Cart"
            >
              <ShoppingCart className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-lg transition-all duration-300",
                showPulse && "animate-pulse"
              )} />
              
              {/* Pulse ring animation */}
              {showPulse && (
                <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-75"></div>
              )}
            </Link>
            
            {totalItems > 0 && (
              <span className={cn(
                "absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center border-2 border-white font-bold shadow-lg transition-all duration-300",
                isAnimating && "animate-bounce scale-125",
                "transform-gpu" // Hardware acceleration
              )}>
                <span className={cn(
                  "transition-all duration-200",
                  isAnimating && "animate-pulse"
                )}>
                  {totalItems}
                </span>
              </span>
            )}
            
            {/* Drop-in animation for new items */}
            {isAnimating && (
              <div className="absolute -top-3 -right-3 pointer-events-none">
                <div className="relative">
                  <span className="inline-block text-green-400 font-bold text-sm drop-shadow-lg animate-bounce">
                    +{totalItems - prevTotalItems}
                  </span>
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-ping"></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile Menu - Standalone (only on mobile) */}
          <div className="flex lg:hidden">
            <MobileNav />
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