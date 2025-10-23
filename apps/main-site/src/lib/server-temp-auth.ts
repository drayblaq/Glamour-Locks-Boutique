// Temporary authentication service for server-side operations
// This provides a simple token-based auth for API routes that need temporary authentication

import jwt from 'jsonwebtoken';
import { logger } from './monitoring';

export interface TempAuthToken {
  userId: string;
  email: string;
  type: 'customer' | 'admin';
  exp: number;
  iat: number;
}

export class ServerTempAuthService {
  private static readonly JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret';

  // Create a temporary token
  static createTempToken(data: {
    userId: string;
    email: string;
    type: 'customer' | 'admin';
    expiresIn?: string;
  }): string {
    try {
      const payload = {
        userId: data.userId,
        email: data.email,
        type: data.type
      };

      return jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: data.expiresIn || '1h'
      });
    } catch (error) {
      logger.error('Failed to create temp token', error);
      throw new Error('Token creation failed');
    }
  }

  // Verify a temporary token
  static verifyTempToken(token: string): TempAuthToken | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as TempAuthToken;
      return decoded;
    } catch (error) {
      logger.warn('Token verification failed', { error: error.message });
      return null;
    }
  }

  // Extract token from request headers
  static extractTokenFromRequest(request: Request): string | null {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  // Validate customer token
  static validateCustomerToken(token: string): {
    valid: boolean;
    customerId?: string;
    email?: string;
    error?: string;
  } {
    try {
      const decoded = this.verifyTempToken(token);
      if (!decoded) {
        return { valid: false, error: 'Invalid token' };
      }

      if (decoded.type !== 'customer') {
        return { valid: false, error: 'Invalid token type' };
      }

      return {
        valid: true,
        customerId: decoded.userId,
        email: decoded.email
      };
    } catch (error) {
      logger.error('Customer token validation failed', error);
      return { valid: false, error: 'Token validation failed' };
    }
  }

  // Validate admin token
  static validateAdminToken(token: string): {
    valid: boolean;
    adminId?: string;
    email?: string;
    error?: string;
  } {
    try {
      const decoded = this.verifyTempToken(token);
      if (!decoded) {
        return { valid: false, error: 'Invalid token' };
      }

      if (decoded.type !== 'admin') {
        return { valid: false, error: 'Invalid token type' };
      }

      return {
        valid: true,
        adminId: decoded.userId,
        email: decoded.email
      };
    } catch (error) {
      logger.error('Admin token validation failed', error);
      return { valid: false, error: 'Token validation failed' };
    }
  }

  // Middleware helper for API routes
  static async authenticateRequest(request: Request, type: 'customer' | 'admin' = 'customer'): Promise<{
    success: boolean;
    userId?: string;
    email?: string;
    error?: string;
  }> {
    try {
      const token = this.extractTokenFromRequest(request);
      if (!token) {
        return { success: false, error: 'No token provided' };
      }

      if (type === 'customer') {
        const validation = this.validateCustomerToken(token);
        if (!validation.valid) {
          return { success: false, error: validation.error };
        }
        return {
          success: true,
          userId: validation.customerId,
          email: validation.email
        };
      } else {
        const validation = this.validateAdminToken(token);
        if (!validation.valid) {
          return { success: false, error: validation.error };
        }
        return {
          success: true,
          userId: validation.adminId,
          email: validation.email
        };
      }
    } catch (error) {
      logger.error('Request authentication failed', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  // Create customer token from customer data
  static createCustomerToken(customerId: string, email: string): string {
    return this.createTempToken({
      userId: customerId,
      email,
      type: 'customer',
      expiresIn: '7d' // Customer tokens last 7 days
    });
  }

  // Create admin token from admin data
  static createAdminToken(adminId: string, email: string): string {
    return this.createTempToken({
      userId: adminId,
      email,
      type: 'admin',
      expiresIn: '24h' // Admin tokens last 24 hours
    });
  }
}




