'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/app/contexts/CartContext';
import { Session } from 'next-auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface ProvidersProps {
  children: React.ReactNode;
  session?: Session | null;
}

// User context for Firebase auth
interface UserContextType {
  user: FirebaseUser | null;
  loading: boolean;
}
const UserContext = createContext<UserContextType>({ user: null, loading: true });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <CartProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </CartProvider>
    </SessionProvider>
  );
}