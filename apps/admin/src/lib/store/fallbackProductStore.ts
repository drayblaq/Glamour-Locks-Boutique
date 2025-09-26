'use client'

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/types';

// Fallback mock data
const fallbackProducts: Product[] = [
  {
    id: '1',
    name: 'Lush Supreme Hair Oil',
    description: 'Premium hair oil for deep conditioning and shine',
    price: 29.99,
    images: ['/lush_supreme.jpg'],
    stock: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Ultra Moisture Conditioner',
    description: 'Intensive moisture conditioner for dry hair',
    price: 24.99,
    images: ['/ultra1.jpeg'],
    stock: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

interface FallbackProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getProduct: (productId: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
}

export const useFallbackProductStore = (): FallbackProductStore => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducts(fallbackProducts);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setProducts(prev => [newProduct, ...prev]);
    } catch (err) {
      setError('Failed to add product');
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (productId: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    try {
      setError(null);
      setProducts(prev => 
        prev.map(product => 
          product.id === productId 
            ? { ...product, ...updates, updatedAt: new Date() }
            : product
        )
      );
    } catch (err) {
      setError('Failed to update product');
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      setError(null);
      setProducts(prev => prev.filter(product => product.id !== productId));
    } catch (err) {
      setError('Failed to delete product');
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