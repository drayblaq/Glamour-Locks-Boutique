import { NextRequest, NextResponse } from 'next/server';
import { CustomerAuthService } from '@/lib/customer-auth';
import { TempAuthService } from '@/lib/temp-auth';
import { getSecurityHeaders } from '@/lib/security';
import { logger } from '@/lib/monitoring';
import jwt from 'jsonwebtoken';

// Helper function to verify JWT token
function verifyToken(request: NextRequest): { customerId: string; email: string } | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
    
    if (decoded.type !== 'customer') {
      return null;
    }

    return { customerId: decoded.customerId, email: decoded.email };
  } catch (error) {
    return null;
  }
}

// GET - Get customer orders
export async function GET(request: NextRequest) {
  try {
    const tokenData = verifyToken(request);
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { 
          status: 401,
          headers: getSecurityHeaders()
        }
      );
    }

    // For now, return empty orders array since we're using temp auth
    const orders: any[] = [];

    // Sort orders by date (newest first)
    const sortedOrders = orders.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.orderDate);
      const dateB = new Date(b.createdAt || b.orderDate);
      return dateB.getTime() - dateA.getTime();
    });

    logger.info('Customer orders retrieved', { 
      customerId: tokenData.customerId,
      orderCount: orders.length 
    });

    return NextResponse.json(
      { 
        orders: sortedOrders,
        total: orders.length
      },
      { headers: getSecurityHeaders() }
    );
  } catch (error) {
    logger.error('Get customer orders error', error);
    return NextResponse.json(
      { error: 'Failed to get orders' },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}

