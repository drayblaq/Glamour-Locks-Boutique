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

// GET - Get customer profile
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

    // Use Firebase database (your original system)
    const customer = await CustomerAuthService.getCustomerById(tokenData.customerId);
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { 
          status: 404,
          headers: getSecurityHeaders()
        }
      );
    }

    return NextResponse.json(
      { 
        customer: {
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          address: customer.address,
          createdAt: customer.createdAt
        }
      },
      { headers: getSecurityHeaders() }
    );
  } catch (error) {
    logger.error('Get customer profile error', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}

// PUT - Update customer profile
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { firstName, lastName, phone, address } = body;

    // Validate input
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }

    const updates = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim(),
      address: address
    };

    // Use Firebase database (your original system)
    const result = await CustomerAuthService.updateCustomer(tokenData.customerId, updates);

    if (result.success) {
      logger.info('Customer profile updated', { 
        customerId: tokenData.customerId 
      });

      return NextResponse.json(
        { 
          success: true,
          customer: {
            id: result.customer?.id,
            email: result.customer?.email,
            firstName: result.customer?.firstName,
            lastName: result.customer?.lastName,
            phone: result.customer?.phone,
            address: result.customer?.address
          }
        },
        { headers: getSecurityHeaders() }
      );
    } else {
      return NextResponse.json(
        { error: result.error },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }
  } catch (error) {
    logger.error('Update customer profile error', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}

