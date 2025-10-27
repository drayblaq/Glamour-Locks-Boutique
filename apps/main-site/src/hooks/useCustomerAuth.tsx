'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Customer } from '@/lib/customer-auth';

interface CustomerAuthContextType {
  customer: Customer | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('customerToken');
        const storedCustomer = localStorage.getItem('customer');

        if (storedToken && storedCustomer) {
          setToken(storedToken);
          setCustomer(JSON.parse(storedCustomer));
        }
      } catch (error) {
        // Log errors but avoid exposing sensitive details in production
        if (process.env.NODE_ENV === 'development') {
          console.error('Error initializing auth:', error);
        } else {
          console.error('Auth initialization failed');
        }
        // Clear invalid data
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customer');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToken(data.token);
        setCustomer(data.customer);
        
        // Store in localStorage
        localStorage.setItem('customerToken', data.token);
        localStorage.setItem('customer', JSON.stringify(data.customer));
        
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      // Log errors but avoid exposing sensitive details in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error);
      } else {
        console.error('Login failed');
      }
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Auto-login after successful registration
        if (result.token && result.customer) {
          setToken(result.token);
          setCustomer(result.customer);
          
          // Store in localStorage
          localStorage.setItem('customerToken', result.token);
          localStorage.setItem('customer', JSON.stringify(result.customer));
        }
        
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Registration failed' };
      }
    } catch (error) {
      // Log errors but avoid exposing sensitive details in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration error:', error);
      } else {
        console.error('Registration failed');
      }
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setCustomer(null);
    setToken(null);
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customer');
  };

  const value: CustomerAuthContextType = {
    customer,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!customer && !!token,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth(): CustomerAuthContextType {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}

// Helper hook to get authenticated token for API calls
export function useAuthenticatedFetch() {
  const { token, isAuthenticated } = useCustomerAuth();

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    if (!isAuthenticated || !token) {
      throw new Error('User not authenticated');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return { authenticatedFetch, isAuthenticated, token };
}

