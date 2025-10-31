"use client";

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Info, Phone, User, LogIn, LogOut, UserPlus, ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import Logo from '@/components/layout/Logo';
import { cn } from '@/lib/utils';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { customer, isAuthenticated, loading } = useCustomerAuth();

  const navigationLinks = [
    { href: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { href: '/products', label: 'Shop', icon: <ShoppingBag className="w-4 h-4" /> },
    { href: '/about', label: 'About us', icon: <Info className="w-4 h-4" /> },
    { href: '/contact', label: 'Contact', icon: <Phone className="w-4 h-4" /> },
    { href: '/cart', label: 'Cart', icon: <ShoppingCart className="w-4 h-4" /> },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 border border-white/30 shadow-md backdrop-blur-md" 
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6 text-white" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="w-64 max-w-[75vw] sm:max-w-[50vw] bg-gradient-to-b from-pink-50 to-white p-0 border-r-2 border-pink-200 h-full overflow-y-auto flex flex-col [&>button]:hidden"
      >
        <SheetHeader className="p-2 bg-gradient-to-r from-pink-400 to-pink-500 border-b border-pink-300">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white font-bold text-xs">
              <Logo />
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm">
                <span className="text-lg font-bold">✕</span>
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="flex flex-col h-full flex-1">
          {/* Navigation Links */}
          <nav className="flex-1 p-2 space-y-1">
            {navigationLinks.map((link) => {
              const isActive = pathname === link.href || 
                             (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center text-sm font-medium py-3 px-3 rounded-md transition-all duration-200 gap-3 min-h-[44px] active:scale-95 touch-manipulation",
                    isActive 
                      ? "bg-pink-200 text-pink-700" 
                      : "text-gray-700 hover:bg-pink-100 hover:text-pink-600"
                  )}
                >
                  <span className="w-5 h-5 flex-shrink-0">{link.icon}</span>
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth Buttons for Mobile Menu */}
          <div className="p-2 border-t border-pink-200 bg-gradient-to-r from-pink-50 to-pink-100 flex flex-col gap-1 mb-4">
            {/* Auth Buttons or Loading */}
            {loading ? (
              <div className="w-full flex flex-col items-center justify-center py-1">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500 mb-1"></span>
                <span className="text-pink-500 font-medium text-xs">Loading...</span>
              </div>
            ) : !isAuthenticated ? (
              <>
                <Button asChild className="w-full justify-start text-sm font-medium py-2.5 px-3 h-auto bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-md transition-all duration-200 gap-2 min-h-[44px] active:scale-95 touch-manipulation">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start text-sm font-medium py-2.5 px-3 h-auto bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-md transition-all duration-200 gap-2 min-h-[44px] active:scale-95 touch-manipulation">
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="w-full justify-start text-sm font-medium py-2.5 px-3 h-auto bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-md transition-all duration-200 gap-2 min-h-[44px] active:scale-95 touch-manipulation">
                  <Link href="/account" onClick={() => setIsOpen(false)}>
                    <User className="w-4 h-4" />
                    My Account
                  </Link>
                </Button>
                <Button className="w-full justify-start text-sm font-medium py-2.5 px-3 h-auto bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white rounded-md transition-all duration-200 gap-2 min-h-[44px] active:scale-95 touch-manipulation" onClick={async () => { await import('firebase/auth').then(({ signOut }) => signOut(require('@/lib/firebase').auth)); setIsOpen(false); }}>
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;