import { NextRequest, NextResponse } from 'next/server';
import { CustomerAuthService } from '@/lib/customer-auth';
import { ServerTempAuthService } from '@/lib/server-temp-auth';
import { rateLimit, validateEmail, sanitizeString, getSecurityHeaders } from '@/lib/security';
import { logger } from '@/lib/monitoring';

const registerRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 registration attempts per 15 minutes
  message: 'Too many registration attempts'
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = registerRateLimit(request);
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
    const { email, password, firstName, lastName, phone } = body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }

    // Sanitize input
    const sanitizedData = {
      email: email.toLowerCase().trim(),
      password,
      firstName: sanitizeString(firstName, 50),
      lastName: sanitizeString(lastName, 50),
      phone: phone ? sanitizeString(phone, 20) : undefined
    };

    // Use Firebase database (your original system)
    logger.info('Using Firebase database for registration', { 
      email: sanitizedData.email 
    });
    const result = await CustomerAuthService.registerCustomer(sanitizedData);

    if (result.success) {
      // Create JWT token for the new customer
      const token = ServerTempAuthService.createCustomerToken(
        result.customer!.id,
        result.customer!.email
      );

      logger.info('Customer registered successfully', { 
        email: sanitizedData.email,
        customerId: result.customer?.id 
      });

      return NextResponse.json(
        { 
          success: true, 
          message: 'Registration successful',
          token,
          customer: {
            id: result.customer?.id,
            email: result.customer?.email,
            firstName: result.customer?.firstName,
            lastName: result.customer?.lastName
          }
        },
        { headers: getSecurityHeaders() }
      );
    } else {
      logger.warn('Customer registration failed', { 
        email: sanitizedData.email,
        error: result.error 
      });

      return NextResponse.json(
        { error: result.error },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }
  } catch (error) {
    logger.error('Registration API error', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}

