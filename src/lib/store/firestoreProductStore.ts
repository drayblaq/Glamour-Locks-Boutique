'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Product } from '@/lib/types';
import * as productService from '@/lib/firestore/products';

interface FirestoreProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getProduct: (productId: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
}

export const useFirestoreProductStore = (): FirestoreProductStore => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = await productService.getProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      fetchProducts();
    }
  }, [fetchProducts]);

  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newProduct = await productService.addProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (productId: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    try {
      setError(null);
      await productService.updateProduct(productId, updates);
      
      // Update local state
      setProducts(prev => 
        prev.map(product => 
          product.id === productId 
            ? { ...product, ...updates, updatedAt: new Date() }
            : product
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      setError(null);
      await productService.deleteProduct(productId);
      
      // Update local state
      setProducts(prev => prev.filter(product => product.id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  }, []);

  const getProduct = useCallback((productId: string) => {
    return products.find(product => product.id === productId);
  }, [products]);

  const refreshProducts = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    refreshProducts,
  };
}; 