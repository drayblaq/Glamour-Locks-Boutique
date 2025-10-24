import { NextRequest, NextResponse } from 'next/server';
import { CustomerAuthService } from '@/lib/customer-auth';
import { rateLimit, getSecurityHeaders } from '@/lib/security';
import { logger } from '@/lib/monitoring';

const resetPasswordRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 password reset attempts per 15 minutes
  message: 'Too many password reset attempts'
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = resetPasswordRateLimit(request);
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
    const { token, newPassword } = body;

    // Validate input
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }

    // Reset password
    const result = await CustomerAuthService.resetPassword(token, newPassword);

    if (result.success) {
      logger.info('Password reset successful', { 
        email: result.email
      });

      return NextResponse.json(
        { 
          success: true,
          message: 'Password has been reset successfully. You can now log in with your new password.'
        },
        { headers: getSecurityHeaders() }
      );
    } else {
      logger.warn('Password reset failed', { 
        error: result.error 
      });

      return NextResponse.json(
        { error: result.error || 'Password reset failed' },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }
  } catch (error) {
    logger.error('Reset password API error', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}