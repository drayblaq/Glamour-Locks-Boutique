import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { emailService } from '@/lib/email';
import { rateLimit, getSecurityHeaders } from '@/lib/security';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Rate limiting for webhook endpoint
const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: 'Too many webhook requests'
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = webhookRateLimit(request);
    if (!rateLimitResult.success) {
      console.log('❌ Rate limit exceeded for webhook');
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

    console.log('🔔 Webhook received - processing...');
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.log('❌ Missing stripe signature');
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('📋 Webhook event type:', event.type);

    // Handle successful payment - create order and send email notifications
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      console.log('✅ Payment succeeded:', paymentIntent.id);
      console.log('💰 Amount:', paymentIntent.amount / 100);
      console.log('📧 Customer email:', paymentIntent.receipt_email);
      console.log('👤 Customer name:', paymentIntent.shipping?.name);
      
      // Get payment details
      const amount = paymentIntent.amount / 100; // Convert from cents
      const customerEmail = paymentIntent.receipt_email || 'customer@example.com';
      const customerName = paymentIntent.shipping?.name || 'Valued Customer';
      
      // Create order in database as backup (in case frontend order creation failed)
      console.log('📦 Creating order in webhook as backup...');
      await createOrderFromWebhook({
        paymentId: paymentIntent.id,
        amount: amount,
        customerEmail: customerEmail,
        customerName: customerName,
        metadata: paymentIntent.metadata,
      });
      
      // Send customer confirmation email
      console.log('📤 Sending customer confirmation email...');
      await sendCustomerConfirmation({
        email: customerEmail,
        name: customerName,
        amount: amount,
        paymentId: paymentIntent.id,
      });

      // Send admin notification email
      console.log('📤 Sending admin notification email...');
      await sendAdminNotification({
        customerName: customerName,
        amount: amount,
        customerEmail: customerEmail,
        paymentId: paymentIntent.id,
      });

      console.log('✅ Payment confirmation emails sent for payment:', paymentIntent.id);
      console.log('✅ Order created in webhook as backup for payment:', paymentIntent.id);
    } else {
      console.log('ℹ️  Event type not handled:', event.type);
    }

    return NextResponse.json(
      { received: true },
      { headers: getSecurityHeaders() }
    );
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { 
        status: 400,
        headers: getSecurityHeaders()
      }
    );
  }
}

async function sendCustomerConfirmation({
  email,
  name,
  amount,
  paymentId,
}: {
  email: string;
  name: string;
  amount: number;
  paymentId: string;
}) {
  try {
    await emailService.sendEmail({
      to: email,
      subject: `Payment Confirmation - ${paymentId}`,
      message: `Dear ${name},\n\nYour payment has been successfully processed.\n\nAmount: £${amount.toFixed(2)}\nPayment ID: ${paymentId}\n\nYour order has been created and is being processed. You will receive order details separately.\n\nThank you for choosing Glamour Locks Boutique!`,
      html: `
        <h2>Payment Confirmed!</h2>
        <p>Dear ${name},</p>
        <p>Your payment has been successfully processed.</p>
        <p><strong>Amount:</strong> £${amount.toFixed(2)}</p>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
        <p>Your order has been created and is being processed. You will receive order details separately.</p>
        <p>Thank you for choosing Glamour Locks Boutique!</p>
      `,
    });
    console.log('Customer confirmation email sent');
  } catch (error) {
    console.error('Failed to send customer confirmation email:', error);
  }
}

async function sendAdminNotification({
  customerName,
  amount,
  customerEmail,
  paymentId,
}: {
  customerName: string;
  amount: number;
  customerEmail: string;
  paymentId: string;
}) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error('Admin email not configured');
      return;
    }

    await emailService.sendEmail({
      to: adminEmail,
      subject: `Payment Received - ${paymentId}`,
      message: `Payment Received!\n\nPayment ID: ${paymentId}\nCustomer: ${customerName}\nEmail: ${customerEmail}\nAmount: £${amount.toFixed(2)}\n\nPlease check your admin dashboard for order details.`,
      html: `
        <h2>Payment Received</h2>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Amount:</strong> £${amount.toFixed(2)}</p>
        <p>Please check your admin dashboard for order details.</p>
      `,
    });
    console.log('Admin notification email sent');
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
  }
}

async function createOrderFromWebhook({
  paymentId,
  amount,
  customerEmail,
  customerName,
  metadata,
}: {
  paymentId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  metadata: any;
}) {
  try {
    // Check if order already exists
    const existingOrderResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/api/orders`);
    if (existingOrderResponse.ok) {
      const { orders } = await existingOrderResponse.json();
      const existingOrder = orders.find((order: any) => order.paymentId === paymentId);
      if (existingOrder) {
        console.log('✅ Order already exists for payment:', paymentId);
        return;
      }
    }

    // Create order payload
    const orderPayload = {
      orderNumber: `GLB-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      orderDate: new Date().toISOString(),
      requestId: `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customer: {
        firstName: customerName.split(' ')[0] || 'Customer',
        lastName: customerName.split(' ').slice(1).join(' ') || 'Name',
        email: customerEmail,
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        specialInstructions: '',
      },
      items: [
        {
          id: 'webhook-item',
          name: 'Payment from Stripe Webhook',
          price: amount,
          quantity: 1,
          image: '',
          description: 'Order created from successful payment webhook',
        }
      ],
      subtotal: amount,
      shipping: 0,
      total: amount,
      emailSent: false,
      status: 'pending',
      paymentId: paymentId,
      source: 'stripe_webhook',
    };

    console.log('📋 Creating order from webhook:', JSON.stringify(orderPayload, null, 2));

    // Create order via API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to create order from webhook:', errorText);
      throw new Error('Failed to create order from webhook');
    }

    const result = await response.json();
    console.log('✅ Order created from webhook successfully:', result);
  } catch (error) {
    console.error('❌ Error creating order from webhook:', error);
    // Don't throw error - we don't want webhook to fail just because order creation failed
  }
}