"use client";

import { useState, useEffect } from 'react';

// Simple component to test hydration fixes
export function HydrationTest() {
  const [mounted, setMounted] = useState(false);
  const [clientValue, setClientValue] = useState('');

  useEffect(() => {
    setMounted(true);
    // This will only run on client side
    if (typeof window !== 'undefined') {
      setClientValue(`Client rendered at ${new Date().toLocaleTimeString()}`);
    }
  }, []);

  if (!mounted) {
    return <div>Server rendered content</div>;
  }

  return (
    <div className="p-4 border rounded">
      <h3>Hydration Test</h3>
      <p>Status: {mounted ? 'Hydrated' : 'Server-side'}</p>
      <p>{clientValue}</p>
    </div>
  );
}