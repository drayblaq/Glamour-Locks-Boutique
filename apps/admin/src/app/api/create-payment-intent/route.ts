import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { 
      amount, 
      payment_method_id, 
      automatic_payment_methods,
      customer_email,
      customer_name 
    } = await request.json();

    // Validate amount
    if (!amount || amount < 50) { // Stripe minimum is £0.50
      return NextResponse.json(
        { error: 'Invalid amount. Minimum is £0.50' },
        { status: 400 }
      );
    }

    // Validate email if provided
    const isValidEmail = customer_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email);
    if (customer_email && !isValidEmail) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // If payment_method_id is provided, use the legacy flow
    if (payment_method_id) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // Amount in cents
        currency: 'usd',
        payment_method: payment_method_id,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
        receipt_email: isValidEmail ? customer_email : undefined,
        metadata: {
          source: 'ecommerce_cart',
          customer_name: customer_name || 'Unknown',
        },
      });

      return NextResponse.json({
        client_secret: paymentIntent.client_secret,
        status: paymentIntent.status,
      });
    }

    // Enhanced payment intent with multiple payment methods
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      receipt_email: isValidEmail ? customer_email : undefined,
      payment_method_options: {
        card: {
          setup_future_usage: 'off_session',
        },
      },
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
      payment_methods: [
        'card',
        'apple_pay',
        'google_pay',
        'link',
        'paypal'
      ]
    });

  } catch (error) {
    console.error('Stripe payment error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Handle GET requests for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Enhanced Payment Intent API is working',
    supported_methods: [
      'card',
      'apple_pay', 
      'google_pay',
      'link',
      'paypal'
    ]
  });
}