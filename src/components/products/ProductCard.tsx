"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StarRating from "./StarRating";
import { useCart } from "@/app/contexts/CartContext";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle wishlist state with proper SSR
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const wish = localStorage.getItem(`wishlist-${product.id}`);
      setIsWishlisted(wish === "true");
    }
  }, [product.id]);

  const handleWishlist = () => {
    if (typeof window !== 'undefined') {
      setIsWishlisted((prev) => {
        localStorage.setItem(`wishlist-${product.id}`, String(!prev));
        return !prev;
      });
    }
  };

  const handleAddToCart = async () => {
    // If product has variants, redirect to product page to select variant
    if (product.variants && product.variants.length > 0) {
      window.location.href = `/products/${product.id}`;
      return;
    }
    
    setIsAddingToCart(true);
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        description: product.description
      });
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
        variant: "default",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getStockStatus = () => {
    // If product has variants, check if any variant is in stock
    if (product.variants && product.variants.length > 0) {
      const totalVariantStock = product.variants.reduce((sum, variant) => sum + variant.quantity, 0);
      if (totalVariantStock === 0) return { color: "destructive", text: "Out of Stock" };
      if (totalVariantStock <= 10) return { color: "secondary", text: "Low Stock" };
      return { color: "default", text: "In Stock" };
    }
    
    // Fallback to regular stock for products without variants
    if (product.stock === 0) return { color: "destructive", text: "Out of Stock" };
    if (product.stock <= 10) return { color: "secondary", text: "Low Stock" };
    return { color: "default", text: "In Stock" };
  };

  const stockStatus = getStockStatus();

  if (viewMode === "list") {
    return (
      <Card className="flex flex-row overflow-hidden">
        <div className="relative w-48 h-48 flex-shrink-0">
            <Image
              src={product.images[0] || "/placeholder-product.jpg"}
              alt={product.name}
              fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        <div className="flex-1 flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {product.description}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleWishlist}>
                  <Heart className={`w-4 h-4 ${mounted && isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-2xl font-bold text-primary">
                £{product.price.toFixed(2)}
              </span>
              <Badge variant={stockStatus.color as any}>
                {stockStatus.text}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {product.variants && product.variants.length > 0 ? (
                <span>
                  {product.variants.length} colors available
                  <span className="ml-2 text-primary">
                    • {product.variants.reduce((sum, variant) => sum + variant.quantity, 0)} total units
                  </span>
                </span>
              ) : (
                <span>Stock: {product.stock} units</span>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <div className="flex gap-2 w-full">
              <Button asChild className="flex-1">
                <Link href={`/products/${product.id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Link>
            </Button>
              <Button 
                onClick={handleAddToCart}
                disabled={
                  (product.variants && product.variants.length > 0 
                    ? product.variants.reduce((sum, variant) => sum + variant.quantity, 0) === 0
                    : product.stock === 0
                  ) || isAddingToCart
                }
                className="flex-1"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isAddingToCart ? "Adding..." : 
                 product.variants && product.variants.length > 0 ? "View Options" : "Add to Cart"}
              </Button>
            </div>
          </CardFooter>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.images[0] || "/placeholder-product.jpg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        <div className="absolute top-2 right-2 flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 sm:h-9 sm:w-9 p-0 bg-white/80 hover:bg-white min-h-[32px] min-w-[32px]"
            onClick={handleWishlist}
          >
            <Heart className={`w-4 h-4 ${mounted && isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
        {((product.variants && product.variants.length > 0 
          ? product.variants.reduce((sum, variant) => sum + variant.quantity, 0) === 0
          : product.stock === 0
        )) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-white text-sm">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2 flex-1">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg line-clamp-1 leading-tight">{product.name}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1 text-sm sm:text-base">
              {product.description}
            </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-2 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
          <span className="text-lg sm:text-xl font-bold text-primary">
            £{product.price.toFixed(2)}
              </span>
          <Badge variant={stockStatus.color as any} className="text-xs sm:text-sm self-start sm:self-center">
            {stockStatus.text}
          </Badge>
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">
          {product.variants && product.variants.length > 0 ? (
            <span>
              {product.variants.length} colors available
              <span className="ml-2 text-primary">
                • {product.variants.reduce((sum, variant) => sum + variant.quantity, 0)} total units
              </span>
            </span>
          ) : (
            <span>Stock: {product.stock} units</span>
          )}
        </div>
          </CardContent>

      <CardFooter className="pt-2 flex-shrink-0">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button asChild variant="outline" className="flex-1 min-h-[44px] text-sm sm:text-base">
              <Link href={`/products/${product.id}`}>
              <Eye className="w-4 h-4 mr-2" />
                Details
              </Link>
            </Button>
            <Button 
              onClick={handleAddToCart}
              disabled={
                (product.variants && product.variants.length > 0 
                  ? product.variants.reduce((sum, variant) => sum + variant.quantity, 0) === 0
                  : product.stock === 0
                ) || isAddingToCart
              }
            className="flex-1 min-h-[44px] text-sm sm:text-base"
            >
            <ShoppingCart className="w-4 h-4 mr-2" />
              {isAddingToCart ? "Adding..." : 
               product.variants && product.variants.length > 0 ? "View Options" : "Add to Cart"}
            </Button>
        </div>
      </CardFooter>
      </Card>
  );
}