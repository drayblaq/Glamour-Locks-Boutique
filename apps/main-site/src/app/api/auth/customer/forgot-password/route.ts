import { NextRequest, NextResponse } from 'next/server';
import { CustomerAuthService } from '@/lib/customer-auth';
import { rateLimit, validateEmail, getSecurityHeaders } from '@/lib/security';
import { logger } from '@/lib/monitoring';

const forgotPasswordRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 3, // 3 password reset attempts per 15 minutes
  message: 'Too many password reset attempts'
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = forgotPasswordRateLimit(request);
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
    const { email } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Send password reset email
    const result = await CustomerAuthService.sendPasswordResetEmail(email.toLowerCase().trim());

    if (result.success) {
      logger.info('Password reset email sent', { 
        email: email.toLowerCase().trim()
      });

      return NextResponse.json(
        { 
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent.'
        },
        { headers: getSecurityHeaders() }
      );
    } else {
      // Always return success message for security (don't reveal if email exists)
      logger.warn('Password reset email failed', { 
        email: email.toLowerCase().trim(),
        error: result.error 
      });

      return NextResponse.json(
        { 
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent.'
        },
        { headers: getSecurityHeaders() }
      );
    }
  } catch (error) {
    logger.error('Forgot password API error', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}