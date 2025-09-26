"use client";

import { useState } from "react";
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
      setIsAddingToCart(false);
    }
  };

  const getStockStatus = () => {
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
                <Button variant="ghost" size="sm">
                  <Heart className="w-4 h-4" />
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
              Stock: {product.stock} units
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
                disabled={product.stock === 0 || isAddingToCart}
                className="flex-1"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isAddingToCart ? "Adding..." : "Add to Cart"}
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
          <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 bg-white/80 hover:bg-white min-h-[32px] min-w-[32px]">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        {product.stock === 0 && (
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
          Stock: {product.stock} units
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
              disabled={product.stock === 0 || isAddingToCart}
            className="flex-1 min-h-[44px] text-sm sm:text-base"
            >
            <ShoppingCart className="w-4 h-4 mr-2" />
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </Button>
        </div>
      </CardFooter>
      </Card>
  );
}