import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { rateLimit, validateEmail, validateAmount, getSecurityHeaders } from '@/lib/security';

// Validate Stripe secret key on initialization
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is not set in environment variables');
}

if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_')) {
  console.error('❌ STRIPE_SECRET_KEY appears to be invalid (should start with sk_)');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Rate limiting for payment intent creation
const paymentRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 payment intents per minute per IP
  message: 'Too many payment requests'
});

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      console.error('❌ Stripe is not configured. STRIPE_SECRET_KEY is missing.');
      return NextResponse.json(
        { 
          error: 'Payment service is not configured. Please contact support.',
          details: 'Stripe secret key is missing'
        },
        { 
          status: 500,
          headers: getSecurityHeaders()
        }
      );
    }
    
    // Apply rate limiting
    const rateLimitResult = paymentRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { 
          status: 429,
          headers: {
            ...getSecurityHeaders(),
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
          }
        }
      );
    }

    const { 
      amount, 
      payment_method_id, 
      automatic_payment_methods,
      customer_email,
      customer_name 
    } = await request.json();

    // Enhanced validation
    if (!validateAmount(amount, 50, 1000000)) { // £0.50 to £10,000
      return NextResponse.json(
        { error: 'Invalid amount. Must be between £0.50 and £10,000' },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }

    // Validate email if provided
    if (customer_email && !validateEmail(customer_email)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }

    // If payment_method_id is provided, use the legacy flow
    if (payment_method_id) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // Amount in pence
        currency: 'gbp',
        payment_method: payment_method_id,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
        receipt_email: customer_email && validateEmail(customer_email) ? customer_email : undefined,
        metadata: {
          source: 'ecommerce_cart',
          customer_name: customer_name || 'Unknown',
        },
      });

      return NextResponse.json({
        client_secret: paymentIntent.client_secret,
        status: paymentIntent.status,
      }, { headers: getSecurityHeaders() });
    }

    // Enhanced payment intent with multiple payment methods
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in pence
      currency: 'gbp',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      receipt_email: customer_email && validateEmail(customer_email) ? customer_email : undefined,
      metadata: {
        source: 'ecommerce_cart',
        supports_multiple_methods: 'true',
        customer_name: customer_name || 'Unknown',
      },
    });

    // Return the client secret for frontend confirmation
    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      status: paymentIntent.status,
      currency: 'gbp',
      payment_methods: [
        'card',
        'apple_pay',
        'google_pay',
        'link',
        'paypal'
      ]
    }, { headers: getSecurityHeaders() });

  } catch (error) {
    console.error('Stripe payment error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Stripe.errors.StripeError ? error.type : 'Non-Stripe error',
      code: error instanceof Stripe.errors.StripeError ? error.code : 'No code',
      decline_code: error instanceof Stripe.errors.StripeError ? error.decline_code : 'No decline code',
    });
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: error.message,
          type: error.type,
          code: error.code,
          decline_code: error.decline_code
        },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}

// Handle GET requests for testing
export async function GET() {
  try {
    // Check if Stripe is configured
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ 
        message: 'Payment Intent API is not configured',
        gbp_supported: false,
        error: 'STRIPE_SECRET_KEY is missing',
        supported_methods: []
      }, { status: 500 });
    }
    
    // Test if we can create a simple payment intent with GBP
    const testIntent = await stripe.paymentIntents.create({
      amount: 100, // £1.00
      currency: 'gbp',
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    return NextResponse.json({ 
      message: 'Enhanced Payment Intent API is working',
      gbp_supported: true,
      test_intent_id: testIntent.id,
      supported_methods: [
        'card',
        'apple_pay', 
        'google_pay',
        'link',
        'paypal'
      ]
    });
  } catch (error) {
    console.error('GBP test failed:', error);
    
    return NextResponse.json({ 
      message: 'Payment Intent API error',
      gbp_supported: false,
      error: error instanceof Stripe.errors.StripeError ? error.message : 'Unknown error',
      supported_methods: [
        'card',
        'apple_pay', 
        'google_pay',
        'link',
        'paypal'
      ]
    }, { status: 500 });
  }
}