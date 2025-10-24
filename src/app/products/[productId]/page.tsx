"use client"; 

import Image from 'next/image';
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
  Loader2
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
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0] || null);
      document.title = `${product.name} - Glamour Locks Boutique`;
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
    // Check if variants exist and one is selected
    if (product.variants && product.variants.length > 0) {
      if (selectedVariant === null) {
        toast({
          title: "Please select a color",
          description: "Choose a color variant before adding to cart.",
          variant: "destructive",
        });
        return;
      }
      
      const variant = product.variants[selectedVariant];
      if (variant.quantity === 0) {
        toast({
          title: "Out of stock",
          description: `${variant.color} is currently out of stock.`,
          variant: "destructive",
        });
        return;
      }
    }
    
    // For variants, treat each color as a completely separate product
    const cartItem = selectedVariant !== null && product.variants ? {
      id: `${product.id}-${product.variants[selectedVariant].color.toLowerCase().replace(/\s+/g, '-')}`,
      name: `${product.name} - ${product.variants[selectedVariant].color}`,
      price: product.price,
      image: selectedImage || product.images[0],
      description: product.description,
      variant: {
        color: product.variants[selectedVariant].color,
        variantId: `${product.id}-${product.variants[selectedVariant].color.toLowerCase().replace(/\s+/g, '-')}`
      }
    } : {
      id: product.id,
      name: product.name,
      price: product.price,
      image: selectedImage || product.images[0],
      description: product.description
    };
    
    addItem(cartItem);
    
    const variantText = selectedVariant !== null && product.variants 
      ? ` (${product.variants[selectedVariant].color})` 
      : '';
    toast({
      title: "Added to Cart",
      description: `${product.name}${variantText} has been added to your cart.`,
      variant: "default",
    });
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
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-4 md:gap-3 md:overflow-x-visible md:pb-0">
              {product.images.slice(0, 4).map((img, idx) => (
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
            {product.variants && product.variants.length > 0 ? (
              <>
                <Badge variant="outline" className="text-xs">
                  {product.variants.length} colors available
                </Badge>
                <Badge 
                  variant={product.variants.reduce((sum, variant) => sum + variant.quantity, 0) > 0 ? 'default' : 'destructive'} 
                  className="text-xs"
                >
                  {product.variants.reduce((sum, variant) => sum + variant.quantity, 0)} total units
                </Badge>
              </>
            ) : (
              <Badge variant={product.stock > 0 ? 'default' : 'destructive'} className="text-xs">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </Badge>
            )}
          </div>
          
          {/* Color Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Available Colors</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {product.variants.map((variant, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedVariant(index);
                      // Update selected image to variant image if available
                      if (variant.images && variant.images.length > 0) {
                        setSelectedImage(variant.images[0]);
                      }
                    }}
                    className={cn(
                      "p-3 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md",
                      selectedVariant === index 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-gray-200 hover:border-primary/50"
                    )}
                  >
                    <div className="font-medium text-sm">{variant.color}</div>
                    <div className="text-xs text-muted-foreground">
                      {variant.quantity > 0 ? `${variant.quantity} in stock` : 'Out of stock'}
                    </div>
                  </button>
                ))}
              </div>
              {selectedVariant !== null && (
                <div className="text-sm text-muted-foreground">
                  Selected: {product.variants[selectedVariant].color} 
                  ({product.variants[selectedVariant].quantity} available)
                </div>
              )}
            </div>
          )}
          <p className="text-3xl font-semibold text-accent">£{product.price.toFixed(2)}</p>
          <p className="text-foreground/80 leading-relaxed">{product.description}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
                size="lg" 
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 px-8 shadow-md flex-grow transition-transform duration-200 hover:scale-105"
                onClick={handleAddToCart}
                disabled={
                  product.stock === 0 || 
                  (product.variants && product.variants.length > 0 && 
                    (selectedVariant === null || product.variants[selectedVariant]?.quantity === 0)
                  )
                }
            >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {(() => {
                  if (product.variants && product.variants.length > 0) {
                    if (selectedVariant === null) return 'Select Color';
                    if (product.variants[selectedVariant]?.quantity === 0) return 'Out of Stock';
                    return 'Add to Cart';
                  }
                  return product.stock > 0 ? 'Add to Cart' : 'Out of Stock';
                })()}
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
          disabled={
            product.stock === 0 || 
            (product.variants && product.variants.length > 0 && 
              (selectedVariant === null || product.variants[selectedVariant]?.quantity === 0)
            )
          }
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {(() => {
            if (product.variants && product.variants.length > 0) {
              if (selectedVariant === null) return 'Select Color';
              if (product.variants[selectedVariant]?.quantity === 0) return 'Out of Stock';
              return 'Add to Cart';
            }
            return product.stock > 0 ? 'Add to Cart' : 'Out of Stock';
          })()}
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
