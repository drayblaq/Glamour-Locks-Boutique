import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { emailService } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Webhook received - processing...');
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.log('❌ Missing stripe signature');
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('📋 Webhook event type:', event.type);

    // Handle successful payment - only send email notifications
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
      console.log('⚠️  NOTE: No order created in webhook - orders are created in frontend only');
    } else {
      console.log('ℹ️  Event type not handled:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
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