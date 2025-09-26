"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StarRating from "./StarRating";
import { useCart } from "@/app/contexts/CartContext";
import { ShoppingCart, Eye, Heart, Info } from "lucide-react";
import type { Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid";
  isLoading?: boolean;
}

function ProductSkeleton() {
  return (
    <Card className="animate-pulse w-full max-w-sm mx-auto my-3 border border-pink-100 bg-white/90">
      <div className="aspect-square bg-gray-200 rounded-t-xl" />
      <CardHeader className="pb-2 mt-2">
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-1/4" />
      </CardContent>
      <CardFooter className="pt-2 flex gap-2 w-full">
        <div className="h-10 bg-gray-200 rounded w-1/2" />
        <div className="h-10 bg-gray-100 rounded w-1/2" />
      </CardFooter>
    </Card>
  );
}

export function ProductCard({ product, viewMode = "grid", isLoading }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  // For demo: persist wishlist in localStorage
  useEffect(() => {
    const wish = localStorage.getItem(`wishlist-${product.id}`);
    setIsWishlisted(wish === "true");
  }, [product.id]);
  const handleWishlist = () => {
    setIsWishlisted((prev) => {
      localStorage.setItem(`wishlist-${product.id}`, String(!prev));
      return !prev;
    });
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: `${product.name} ${isWishlisted ? "removed from" : "added to"} your wishlist.`,
      variant: isWishlisted ? "destructive" : "default",
    });
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      addItem(product);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
        variant: "default",
      });
    } finally {
      setTimeout(() => setIsAddingToCart(false), 700); // Animate for 0.7s
    }
  };

  const getStockStatus = () => {
    if (product.stock === 0) return { color: "destructive", text: "Out of Stock" };
    if (product.stock <= 10) return { color: "secondary", text: "Low Stock" };
    return { color: "default", text: "In Stock" };
  };
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const isNew = product.tags?.includes("new");
  const isBestSeller = product.tags?.includes("bestseller");

  if (isLoading) return <ProductSkeleton />;

  // Quick View Modal
  const QuickView = (
    <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-48 h-48 flex-shrink-0">
            <Image
              src={product.images[0] || "/placeholder-product.jpg"}
              alt={product.name}
              fill
              className="object-cover rounded-xl border border-pink-100"
              sizes="(max-width: 640px) 100vw, 192px"
              priority
            />
          </div>
          <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-pink-600">
                  {hasDiscount ? (
                    <>
                    <span className="line-through text-gray-400 mr-1">£{product.price.toFixed(2)}</span>
                    <span>£{product.discountPrice?.toFixed(2)}</span>
                    </>
                  ) : (
                  <>£{product.price.toFixed(2)}</>
                )}
              </span>
              <Badge variant={getStockStatus().color as any}>{getStockStatus().text}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">Stock: {product.stock} units</div>
            {product.rating && <StarRating rating={product.rating} />}
            <Button 
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart}
              className="w-full text-base font-semibold mt-2"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // GRID VIEW
  return (
    <>
      {QuickView}
      <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden w-full max-w-sm mx-auto my-3 border border-pink-100 bg-white/90 relative">
        <div className="rounded-xl shadow-md transition-transform duration-200 hover:scale-[1.03] w-full flex flex-col">
          <div className="relative aspect-square overflow-hidden rounded-t-xl bg-white flex items-center justify-center">
            <Image
              src={product.images[0] || "/placeholder-product.jpg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300 border border-pink-100 shadow-md"
              sizes="(max-width: 640px) 100vw, 256px"
              priority
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            <Button variant={isWishlisted ? "default" : "ghost"} size="icon" aria-label="Toggle wishlist" onClick={handleWishlist} className="absolute top-2 right-2 h-9 w-9 p-0 bg-white/90 hover:bg-white shadow z-10 focus:outline-pink-500" tabIndex={0}>
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
              {hasDiscount && (
              <Badge variant="default" className="absolute top-2 left-2 bg-green-500 text-white shadow">Sale</Badge>
              )}
              {isNew && (
              <Badge variant="default" className="absolute top-2 left-20 bg-blue-500 text-white shadow">New</Badge>
              )}
              {isBestSeller && (
              <Badge variant="default" className="absolute top-2 left-36 bg-yellow-400 text-white shadow">Best Seller</Badge>
            )}
            {/* Quick Add to Cart for mobile */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-11/12 sm:hidden z-20">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAddingToCart}
                className={`w-full text-base font-semibold py-2 transition-all duration-300 ${isAddingToCart ? "scale-95 bg-pink-200" : ""}`}
                aria-label={`Add ${product.name} to cart`}
                >
                <ShoppingCart className="w-5 h-5 mr-1" />
                {isAddingToCart ? "Adding..." : "Add to Cart"}
                </Button>
            </div>
          </div>
          <CardHeader className="pb-2 mt-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl font-bold text-pink-700 line-clamp-1">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1 text-sm sm:text-base text-gray-600">{product.description}</CardDescription>
                {product.rating && <StarRating rating={product.rating} />}
        </div>
          </div>
        </CardHeader>
          <CardContent className="pb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xl font-extrabold text-pink-600">
                {hasDiscount ? (
                  <>
                    <span className="line-through text-gray-400 mr-1">£{product.price.toFixed(2)}</span>
                    <span>£{product.discountPrice?.toFixed(2)}</span>
                  </>
                ) : (
                  <>£{product.price.toFixed(2)}</>
                )}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">Stock: {product.stock} units</div>
        </CardContent>
          <CardFooter className="pt-2 flex gap-2 w-full">
            <Button asChild variant="outline" className="flex-1 text-base font-semibold" aria-label={`View details for ${product.name}`}
              tabIndex={0}
          >
            <Link href={`/products/${product.id}`}>
                <Eye className="w-5 h-5 mr-2" />
              Details
            </Link>
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAddingToCart}
              className={`flex-1 hidden sm:flex text-base font-semibold transition-all duration-300 ${isAddingToCart ? "scale-95 bg-pink-200" : ""}`}
              aria-label={`Add ${product.name} to cart`}
              tabIndex={0}
          >
              <ShoppingCart className="w-5 h-5 mr-2" />
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
        </CardFooter>
        </div>
      </Card>
    </>
  );
}