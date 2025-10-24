"use client"; 

import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useFirestoreProductStore } from '@/lib/store/firestoreProductStore';
import { useCart } from '@/app/contexts/CartContext';
import { cn } from '@/lib/utils';
import { 
  ShoppingCart, 
  Heart, 
  Package,
  CheckCircle,
  MessageCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

export default function ProductDetailPage({ }: ProductDetailPageProps) {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;
  const { toast } = useToast();
  const { products, loading } = useFirestoreProductStore();
  const { addItem } = useCart();
  const product = products.find((p) => p.id === productId);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0] || null);
      document.title = `${product.name} - Glamour Locks Boutique`;
      // Set first variant as default if variants exist
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0].color);
      }
    } else if (!loading) {
      document.title = 'Product Not Found - Glamour Locks Boutique';
    }
  }, [product, loading]);

  // Show loading state while products are being fetched
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold text-primary mb-2">Loading Product...</h2>
        <p className="text-muted-foreground">Please wait while we fetch the product details.</p>
      </div>
    );
  }

  // Show not found only after loading is complete and product doesn't exist
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Package className="h-16 w-16 animate-pulse text-primary mb-4" />
        <h2 className="text-2xl font-bold text-primary mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-4">Sorry, the product you are looking for does not exist.</p>
        <Button onClick={() => router.push('/products')}>Back to Shop</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    const selectedVariantData = product.variants?.find(v => v.color === selectedVariant);
    const productName = selectedVariant ? `${product.name} (${selectedVariant})` : product.name;
    const productImage = selectedVariantData?.images?.[0] || product.images[0];
    
    addItem({
      id: product.id,
      name: productName,
      price: product.price,
      image: productImage,
      description: product.description
    });
    
    toast({
      title: "Added to Cart",
      description: `${productName} has been added to your cart.`,
      variant: "default",
    });
  };

  const handleVariantChange = (color: string) => {
    setSelectedVariant(color);
    const variant = product.variants?.find(v => v.color === color);
    if (variant && variant.images.length > 0) {
      setSelectedImage(variant.images[0]);
    } else {
      setSelectedImage(product.images[0] || null);
    }
  };

  // Get current stock based on selected variant or total stock
  const getCurrentStock = () => {
    if (product.variants && selectedVariant) {
      const variant = product.variants.find(v => v.color === selectedVariant);
      return variant?.quantity || 0;
    }
    return product.stock;
  };

  // Get available images based on selected variant or product images
  const getAvailableImages = () => {
    if (product.variants && selectedVariant) {
      const variant = product.variants.find(v => v.color === selectedVariant);
      if (variant && variant.images.length > 0) {
        return variant.images;
      }
    }
    return product.images;
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from Wishlist (Mock)" : "Added to Wishlist (Mock)",
      description: `${product.name} has been ${isWishlisted ? 'removed from' : 'added to'} your wishlist.`,
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 overflow-x-hidden">
      {/* Back Button */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.back()}
          className="flex items-center gap-2 hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Product Image Gallery */}
        <div className="space-y-4 animate-in fade-in slide-in-from-left-12 duration-700 ease-out">
          <div className="aspect-square relative rounded-lg overflow-hidden shadow-lg border bg-secondary/30">
            <Image
              src={selectedImage || product.images[0] || "/placeholder-product.jpg"}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain transition-opacity duration-300 ease-in-out" 
              key={selectedImage} 
            />
          </div>
          {/* Swipeable thumbnails for mobile */}
          {getAvailableImages().length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-4 md:gap-3 md:overflow-x-visible md:pb-0">
              {getAvailableImages().slice(0, 4).map((img, idx) => (
                <button 
                  key={idx} 
                  className={cn(
                    "aspect-square relative rounded-md overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-w-[72px] max-w-[90px] snap-center md:min-w-0 md:max-w-none",
                    selectedImage === img ? "border-primary shadow-md" : "border-transparent hover:border-primary/50"
                  )}
                  onClick={() => setSelectedImage(img)}
                  aria-label={`View image ${idx + 1} of ${product.name}`}
                >
                  <Image src={img} alt={`${product.name} thumbnail ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6 animate-in fade-in slide-in-from-right-12 duration-700 ease-out delay-100">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">{product.name}</h1>
          <div className="flex items-center space-x-3">
            <Badge variant={getCurrentStock() > 0 ? 'default' : 'destructive'} className="text-xs">
                {getCurrentStock() > 0 ? `${getCurrentStock()} in stock` : 'Out of stock'}
            </Badge>
          </div>
          <p className="text-3xl font-semibold text-accent">£{product.price.toFixed(2)}</p>
          <p className="text-foreground/80 leading-relaxed">{product.description}</p>
          
          {/* Color Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Available Colors {selectedVariant && `(${selectedVariant})`}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <Button
                      key={variant.color}
                      variant={selectedVariant === variant.color ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVariantChange(variant.color)}
                      className={cn(
                        "transition-all duration-200",
                        selectedVariant === variant.color 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "hover:bg-primary/10"
                      )}
                      disabled={variant.quantity === 0}
                    >
                      {variant.color}
                      {variant.quantity === 0 && " (Out of Stock)"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
                size="lg" 
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 px-8 shadow-md flex-grow transition-transform duration-200 hover:scale-105"
                onClick={handleAddToCart}
                disabled={getCurrentStock() === 0}
            >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {getCurrentStock() > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto text-lg py-3 px-6 border-primary/50 hover:bg-primary/10 transition-transform duration-200 hover:scale-105"
                onClick={handleWishlistToggle}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                <Heart className={cn("mr-2 h-5 w-5", isWishlisted ? "fill-primary text-primary animate-bounce" : "text-primary")}/>
                {isWishlisted ? 'Wishlisted' : 'Wishlist'}
            </Button>
          </div>
        </div>
      </div>
      {/* Sticky Add to Cart for mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 border-t border-pink-200 shadow-lg p-4 flex md:hidden gap-3 animate-in fade-in slide-in-from-bottom-8 duration-500" style={{backdropFilter:'blur(8px)'}}>
        <Button 
          size="lg" 
          className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 px-8 shadow-md transition-transform duration-200 hover:scale-105"
          onClick={handleAddToCart}
          disabled={getCurrentStock() === 0}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {getCurrentStock() > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="text-lg py-3 px-6 border-primary/50 hover:bg-primary/10 transition-transform duration-200 hover:scale-105"
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("mr-2 h-5 w-5", isWishlisted ? "fill-primary text-primary animate-bounce" : "text-primary")}/>
        </Button>
      </div>
    </div>
  );
}
