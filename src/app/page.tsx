'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useFirestoreProductStore } from '@/lib/store/firestoreProductStore';

export default function HomePage() {
  const { products } = useFirestoreProductStore();
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/pink.jpg" 
            alt="Background" 
            fill
            quality={60}
            priority
            className="object-cover"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Glamour Locks Boutique
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover premium natural hair care products for healthy, beautiful hair.
          </p>
          <Button asChild size="lg" className="min-h-[48px] px-8 py-3 text-base sm:text-lg">
            <Link href="/products">Shop All Products</Link>
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </section>
      )}

      {/* About Us Section */}
      <section className="bg-secondary/30 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <Image 
            src="/logo.jpg" 
            alt="Glamour Locks Boutique" 
            width={120}
            height={120}
            className="mx-auto rounded-full mb-4 sm:mb-6 w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36"
          />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Our Story</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-6 leading-relaxed">
            Glamour Locks Boutique was born from a passion for natural ingredients and healthy hair. 
            We believe in the power of nature to transform your hair care routine.
          </p>
          <Button asChild variant="outline" className="min-h-[44px]">
            <Link href="/about">Learn More About Us</Link>
          </Button>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-card rounded-lg shadow-md p-6 sm:p-8 max-w-xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Stay in the Loop!</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            Sign up for our newsletter to get exclusive offers, hair tips, and more.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full sm:w-auto flex-1 px-4 py-3 rounded-md border border-border focus:ring-2 focus:ring-primary outline-none min-h-[44px] text-base" 
              required 
            />
            <Button type="submit" className="w-full sm:w-auto min-h-[44px]">Subscribe</Button>
          </form>
        </div>
      </section>
    </div>
  );
}
