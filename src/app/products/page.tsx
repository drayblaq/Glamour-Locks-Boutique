"use client";

import { useState, useMemo } from "react";
import { useFirestoreProductStore } from "@/lib/store/firestoreProductStore";
import { useFallbackProductStore } from "@/lib/store/fallbackProductStore";
import { ProductList } from "@/components/products/ProductList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Star, Filter, X, Loader2 } from "lucide-react";
import { ProductCategory } from "@/lib/types";

// const ALL_CATEGORIES: ProductCategory[] = [
//   "Shampoo", "Conditioner", "Oil", "Serum", "Mask", "Styling"
// ];

const PAGE_SIZE = 8;

export default function ProductsPage() {
  const firestoreStore = useFirestoreProductStore();
  const fallbackStore = useFallbackProductStore();
  const { products, loading, error } = firestoreStore.error ? fallbackStore : firestoreStore;

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  // const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [minRating, setMinRating] = useState(0);
  const [stockStatus, setStockStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  // Compute min/max price for slider
  const minProductPrice = products.length ? Math.min(...products.map(p => p.price)) : 0;
  const maxProductPrice = products.length ? Math.max(...products.map(p => p.price)) : 100;

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesRating = !minRating || (product.rating && product.rating >= minRating);
      const matchesStock = stockStatus === "all" ||
        (stockStatus === "in-stock" && product.stock > 0) ||
        (stockStatus === "low-stock" && product.stock > 0 && product.stock <= 10) ||
        (stockStatus === "out-of-stock" && product.stock === 0);
      return matchesSearch && matchesPrice && matchesRating && matchesStock;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];
      if (sortBy === "price") {
        aValue = a.price;
        bValue = b.price;
      } else if (sortBy === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortBy === "rating") {
        aValue = a.rating || 0;
        bValue = b.rating || 0;
      } else if (sortBy === "createdAt") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [products, searchTerm, priceRange, minRating, stockStatus, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredAndSortedProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([minProductPrice, maxProductPrice]);
    setMinRating(0);
    setStockStatus("all");
    setPage(1);
  };

  // UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading products...</span>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Products</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Our Products</h1>
        <p className="text-muted-foreground">
          Discover our premium hair care collection designed for all hair types
        </p>
      </div>

      {/* Filters and Search */}
      <div className="w-full max-w-3xl mx-auto bg-white border border-pink-100 shadow-lg rounded-xl z-20 relative mb-20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
          <CardDescription>
            Find the perfect products for your hair care needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 md:items-end flex-wrap">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 rounded-full px-4 py-3 border border-pink-200 focus:ring-2 focus:ring-pink-400 outline-none"
              aria-label="Search products"
            />
            {/* Category Filter */}
            {/* <Select
              value={selectedCategories[0] || "all"}
              onValueChange={val => setSelectedCategories(val === "all" ? [] : [val as ProductCategory])}
            >
              <SelectTrigger className="rounded-full border-pink-200 min-w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {ALL_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
          
            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="rounded-full border-pink-200 min-w-[120px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="createdAt">Newest</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={val => setSortOrder(val as "asc" | "desc")}>
              <SelectTrigger className="rounded-full border-pink-200 min-w-[120px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
            {/* Clear Filters */}
            <Button variant="outline" onClick={clearFilters} className="rounded-full border-pink-200">Clear All</Button>
          </div>
          {/* Active Filter Chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {searchTerm && (
              <Badge variant="outline" className="flex items-center gap-1">Search: "{searchTerm}" <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm("")} /></Badge>
            )}
            {minRating > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">Min Rating: {minRating} <X className="w-3 h-3 cursor-pointer" onClick={() => setMinRating(0)} /></Badge>
            )}
            {stockStatus !== "all" && (
              <Badge variant="outline" className="flex items-center gap-1">Stock: {stockStatus.replace(/-/g, " ")} <X className="w-3 h-3 cursor-pointer" onClick={() => setStockStatus("all")} /></Badge>
            )}
          </div>
        </CardContent>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {filteredAndSortedProducts.length} products
          </Badge>
        </div>
      </div>

      {/* Products */}
      {paginatedProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? `No products match "${searchTerm}". Try adjusting your search.`
                  : "No products available at the moment."
                }
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ProductList 
          products={paginatedProducts} 
          loading={loading}
          error={error}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
