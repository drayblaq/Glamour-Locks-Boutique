import { NextRequest, NextResponse } from 'next/server';
import { ServerTempAuthService } from '@/lib/server-temp-auth';
import { CustomerAuthService } from '@/lib/customer-auth';
import { getSecurityHeaders } from '@/lib/security';
import { logger } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await ServerTempAuthService.authenticateRequest(request, 'customer');
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { 
          status: 401,
          headers: getSecurityHeaders()
        }
      );
    }

    // Get customer orders
    const orders = await CustomerAuthService.getCustomerOrders(authResult.userId!);

    logger.info('Customer orders retrieved', { 
      customerId: authResult.userId,
      orderCount: orders.length 
    });

    return NextResponse.json(
      { 
        success: true,
        orders: orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          items: order.items,
          total: order.total,
          status: order.status,
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }))
      },
      { headers: getSecurityHeaders() }
    );
  } catch (error) {
    logger.error('Orders API error', error);
    return NextResponse.json(
      { error: 'Failed to retrieve orders' },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}