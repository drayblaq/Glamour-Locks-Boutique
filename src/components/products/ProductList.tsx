"use client";

import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { List, Rows } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
}

export function ProductList({ products, loading, error }: ProductListProps) {
  const [mobileView, setMobileView] = useState<'vertical' | 'horizontal'>('vertical');
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 640);
    }
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading products: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found.</p>
      </div>
    );
  }

  // Don't render mobile-specific UI until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  // Mobile view toggle
  return (
    <div>
      <div className="sm:hidden flex justify-end mb-4 gap-2">
        <Button
          variant={mobileView === 'vertical' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setMobileView('vertical')}
          aria-label="Vertical view"
          className="min-h-[44px] min-w-[44px]"
        >
          <Rows className="w-5 h-5" />
        </Button>
        <Button
          variant={mobileView === 'horizontal' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setMobileView('horizontal')}
          aria-label="Horizontal view"
          className="min-h-[44px] min-w-[44px]"
        >
          <List className="w-5 h-5" />
        </Button>
      </div>
      {/* Vertical grid for desktop and mobile (default) */}
      {(!isMobile || mobileView === 'vertical') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {/* Horizontal grid for mobile */}
      {isMobile && mobileView === 'horizontal' && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 pb-4">
          {products.map((product) => (
            <div key={product.id}
              className="w-full"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
