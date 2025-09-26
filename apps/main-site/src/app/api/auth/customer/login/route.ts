import { NextRequest, NextResponse } from 'next/server';
import { CustomerAuthService } from '@/lib/customer-auth';
import { ServerTempAuthService } from '@/lib/server-temp-auth';
import { rateLimit, validateEmail, getSecurityHeaders } from '@/lib/security';
import { logger } from '@/lib/monitoring';
import jwt from 'jsonwebtoken';

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 login attempts per 15 minutes
  message: 'Too many login attempts'
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = loginRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { 
          status: 429,
          headers: {
            ...getSecurityHeaders(),
            'Retry-After': rateLimitResult.retryAfter?.toString() || '900'
          }
        }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }

    // Use Firebase database (your original system)
    logger.info('Using Firebase database for login', { 
      email: email.toLowerCase().trim() 
    });
    const result = await CustomerAuthService.authenticateCustomer(
      email.toLowerCase().trim(), 
      password
    );

    if (result.success && result.customer) {
      // Create JWT token
      const token = jwt.sign(
        { 
          customerId: result.customer.id,
          email: result.customer.email,
          type: 'customer'
        },
        process.env.NEXTAUTH_SECRET!,
        { expiresIn: '7d' }
      );

      logger.info('Customer login successful', { 
        email: result.customer.email,
        customerId: result.customer.id 
      });

      return NextResponse.json(
        { 
          success: true,
          token,
          customer: {
            id: result.customer.id,
            email: result.customer.email,
            firstName: result.customer.firstName,
            lastName: result.customer.lastName,
            phone: result.customer.phone,
            address: result.customer.address
          }
        },
        { headers: getSecurityHeaders() }
      );
    } else {
      logger.warn('Customer login failed', { 
        email: email.toLowerCase().trim(),
        error: result.error 
      });

      return NextResponse.json(
        { error: result.error || 'Login failed' },
        { 
          status: 401,
          headers: getSecurityHeaders()
        }
      );
    }
  } catch (error) {
    logger.error('Login API error', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}

