import { NextRequest } from 'next/server';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

export function rateLimit(config: RateLimitConfig) {
  return (req: NextRequest): { success: boolean; message?: string; retryAfter?: number } => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const key = `${ip}:${req.nextUrl.pathname}`;
    
    const current = rateLimitStore.get(key);
    
    if (!current || now > current.resetTime) {
      // Reset or create new entry
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return { success: true };
    }
    
    if (current.count >= config.maxRequests) {
      const retryAfter = Math.ceil((current.resetTime - now) / 1000);
      return {
        success: false,
        message: config.message || 'Too many requests',
        retryAfter
      };
    }
    
    current.count++;
    return { success: true };
  };
}

// Input validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export function sanitizeString(input: string, maxLength: number = 255): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
}

export function validateAmount(amount: number, min: number = 50, max: number = 1000000): boolean {
  return typeof amount === 'number' && 
         !isNaN(amount) && 
         amount >= min && 
         amount <= max && 
         Number.isInteger(amount);
}

export function validateOrderData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate customer data
  if (!data.customer) {
    errors.push('Customer information is required');
  } else {
    if (!data.customer.firstName || typeof data.customer.firstName !== 'string') {
      errors.push('Valid first name is required');
    }
    if (!data.customer.lastName || typeof data.customer.lastName !== 'string') {
      errors.push('Valid last name is required');
    }
    if (!data.customer.email || !validateEmail(data.customer.email)) {
      errors.push('Valid email address is required');
    }
    if (data.customer.phone && !validatePhone(data.customer.phone)) {
      errors.push('Invalid phone number format');
    }
  }
  
  // Validate items
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Order must contain at least one item');
  } else {
    data.items.forEach((item: any, index: number) => {
      if (!item.id || !item.name || !item.price || !item.quantity) {
        errors.push(`Item ${index + 1} is missing required fields`);
      }
      if (typeof item.price !== 'number' || item.price <= 0) {
        errors.push(`Item ${index + 1} has invalid price`);
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`Item ${index + 1} has invalid quantity`);
      }
    });
  }
  
  // Validate totals
  if (typeof data.total !== 'number' || data.total <= 0) {
    errors.push('Invalid total amount');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Security headers helper
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com; frame-src https://js.stripe.com;"
  };
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute



