'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function TestAuthPage() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Current Path:</strong> {pathname}
        </div>
        
        <div>
          <strong>Session Status:</strong> {status}
        </div>
        
        <div>
          <strong>Session Data:</strong>
          <pre className="bg-gray-100 p-4 rounded mt-2">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>Environment Variables:</strong>
          <div className="bg-gray-100 p-4 rounded mt-2">
            <div>NEXTAUTH_URL: {process.env.NEXT_PUBLIC_BASE_URL || 'Not set'}</div>
            <div>NODE_ENV: {process.env.NODE_ENV}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 