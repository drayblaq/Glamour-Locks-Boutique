'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useFirestoreProductStore } from '@/lib/store/firestoreProductStore';
import { Sparkles, Users } from 'lucide-react'; 
//import NewsletterPopup from '@/components/layout/NewsletterPopup';

const LogoSVG = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    className={className || "mx-auto h-16 w-16 text-primary mb-4 transition-transform duration-300 ease-in-out hover:scale-110 hover:rotate-12"}
  >
    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M20,20 Q24,12 32,18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M18,24 Q10,28 16,32" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M44,44 Q40,52 32,46" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M46,40 Q54,36 50,32" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <text 
      x="50%" 
      y="50%" 
      dominantBaseline="middle" 
      textAnchor="middle" 
      fontSize="20" 
      fontFamily="Georgia, serif" 
      fontWeight="bold"
      fill="currentColor"
      stroke="none"
      dy=".1em"
    >
      gSL
    </text>
  </svg>
);

export default function HomePage() {
  const { products } = useFirestoreProductStore();
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="space-y-16 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-0 md:py-0 overflow-hidden min-h-[40vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/pink.jpg" 
            alt="Lush pink floral background" 
            fill
            quality={60}
            priority
            className="object-cover"
            data-ai-hint="pink floral"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 py-3 text-lg shadow-lg transition-transform hover:scale-105 animate-bounce">
            <Link href="/products">Shop All Products</Link>
          </Button>
        </div>
      </section>

      {/* Testimonials Slider */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out delay-300">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">What Our Customers Say</h2>
        <div className="relative max-w-2xl mx-auto">
          {/* Simple slider for now, can be replaced with a carousel lib */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <div className="bg-white rounded-xl shadow-md p-6 max-w-sm w-full animate-in fade-in duration-500">
              <p className="text-lg text-muted-foreground mb-4">“My hair has never felt so healthy and soft. I love these products!”</p>
              <div className="flex items-center gap-3">
                <img src="/bb.webp" alt="Customer" className="h-10 w-10 rounded-full object-cover border-2 border-pink-300" />
                <span className="font-semibold text-primary">Lilian, USA</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 max-w-sm w-full animate-in fade-in duration-500 delay-200">
              <p className="text-lg text-muted-foreground mb-4">“The natural ingredients really make a difference. Highly recommend!”</p>
              <div className="flex items-center gap-3">
                <img src="/bazi.jpeg" alt="Customer" className="h-10 w-10 rounded-full object-cover border-2 border-pink-300" />
                <span className="font-semibold text-primary">Olivia, canada</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram/Gallery Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out delay-400">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">#GlamourLocks Results</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-4">
          {["/above_45m.jpg","/pre2.jpeg","/lagos.jpg","/seren.png","/supreme2.jpeg","/ultra2.jpeg"].map((img, i) => (
            <img key={i} src={img} alt="Gallery" className="rounded-lg object-cover aspect-square w-full h-24 sm:h-32 md:h-36 shadow-md hover:scale-105 transition-transform duration-200" />
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out delay-500">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Stay in the Loop!</h2>
          <p className="text-muted-foreground mb-15">Sign up for our newsletter to get exclusive offers, hair tips, and more.</p>
          <form className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <input type="email" placeholder="Your email address" className="w-full sm:w-auto flex-1 px-4 py-3 rounded-full border border-pink-200 focus:ring-2 focus:ring-pink-400 outline-none" required />
            <Button type="submit" className="rounded-full px-8 py-3 bg-accent hover:bg-accent/90 text-accent-foreground text-lg shadow-md">Subscribe</Button>
          </form>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-secondary/30 py-16 animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out delay-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">Why Glamour Locks?</h2>
            <p className="text-md text-muted-foreground">Experience the difference with our commitment to quality and nature.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-background rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 group animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out delay-500">
               <LogoSVG className="h-12 w-12 text-primary mx-auto mb-4 transition-transform duration-300 group-hover:rotate-6" />
              <h3 className="text-xl font-semibold text-primary mb-2">Natural Ingredients</h3>
              <p className="text-muted-foreground text-sm">Carefully selected botanicals and natural oils for gentle, effective care.</p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 group animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out delay-650">
              <Sparkles className="h-12 w-12 text-accent mx-auto mb-4 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="text-xl font-semibold text-primary mb-2">Visible Results</h3>
              <p className="text-muted-foreground text-sm">Formulations designed to nourish, repair, and enhance your hair's natural beauty.</p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 group animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out delay-800">
              <Users className="h-12 w-12 text-primary mx-auto mb-4 transition-transform duration-300 group-hover:scale-105" />
              <h3 className="text-xl font-semibold text-primary mb-2">Community Focused</h3>
              <p className="text-muted-foreground text-sm">Join our community and share your hair journey with us. We're here to support you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Snippet */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out delay-400">
         <Image 
            src="/logo.jpg" 
            alt="Founder of Glamour Locks Boutique" 
            width={150}
            height={150}
            className="mx-auto rounded-full mb-6 shadow-lg transition-transform duration-300 hover:scale-105"
            data-ai-hint="woman portrait"
          />
        <h2 className="text-3xl font-bold text-primary mb-4">Our Story</h2>
        <p className="text-md text-muted-foreground max-w-2xl mx-auto mb-6">
          Glamour Locks Boutique was born from a passion for natural ingredients and healthy hair. We believe in the power of nature to transform your hair care routine.
        </p>
        <Button asChild variant="outline" className="text-primary border-primary hover:bg-primary/10 transition-all duration-200 hover:scale-105">
          <Link href="/about">Learn More About Us</Link>
        </Button>
      </section>
    </div>
  );
}
