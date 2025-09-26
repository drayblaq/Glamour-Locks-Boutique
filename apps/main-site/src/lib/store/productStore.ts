'use client'
import { create } from 'zustand';
import type { Product } from '@/lib/types';

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (productId: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
  deleteProduct: (productId: string) => void;
  getProduct: (productId: string) => Product | undefined;
  refreshProducts: () => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  addProduct: (productData) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      products: [newProduct, ...state.products],
    }));
  },

  updateProduct: (productId, updates) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.id === productId
          ? { ...product, ...updates, updatedAt: new Date() }
          : product
      ),
    }));
  },

  deleteProduct: (productId) => {
    set((state) => ({
      products: state.products.filter((product) => product.id !== productId),
    }));
  },

  getProduct: (productId) => {
    return get().products.find((product) => product.id === productId);
  },

  refreshProducts: () => {
    // This would typically fetch from an API
    set({ loading: true });
    // Simulate API call
    setTimeout(() => {
      set({ loading: false });
    }, 1000);
  },
}));