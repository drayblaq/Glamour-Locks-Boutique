'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/app/contexts/CartContext';
import { CustomerAuthProvider } from '@/hooks/useCustomerAuth';
import { Session } from 'next-auth';

interface ProvidersProps {
  children: React.ReactNode;
  session?: Session | null;
}

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <CustomerAuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </CustomerAuthProvider>
    </SessionProvider>
  );
}