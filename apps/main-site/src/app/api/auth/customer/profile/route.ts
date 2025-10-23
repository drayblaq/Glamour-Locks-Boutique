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

    // Get customer profile
    const customer = await CustomerAuthService.getCustomerById(authResult.userId!);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { 
          status: 404,
          headers: getSecurityHeaders()
        }
      );
    }

    logger.info('Customer profile retrieved', { 
      customerId: customer.id,
      email: customer.email 
    });

    return NextResponse.json(
      { 
        success: true,
        customer: {
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          address: customer.address,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt
        }
      },
      { headers: getSecurityHeaders() }
    );
  } catch (error) {
    logger.error('Profile API error', error);
    return NextResponse.json(
      { error: 'Failed to retrieve profile' },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { firstName, lastName, phone, address } = body;

    // Validate input
    if (firstName && typeof firstName !== 'string') {
      return NextResponse.json(
        { error: 'First name must be a string' },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }

    if (lastName && typeof lastName !== 'string') {
      return NextResponse.json(
        { error: 'Last name must be a string' },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }

    // Update customer profile
    const result = await CustomerAuthService.updateCustomer(authResult.userId!, {
      firstName,
      lastName,
      phone,
      address
    });

    if (result.success) {
      logger.info('Customer profile updated', { 
        customerId: authResult.userId,
        email: authResult.email 
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
            address: result.customer?.address,
            updatedAt: result.customer?.updatedAt
          }
        },
        { headers: getSecurityHeaders() }
      );
    } else {
      return NextResponse.json(
        { error: result.error || 'Update failed' },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }
  } catch (error) {
    logger.error('Profile update API error', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}