import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message, customerName = 'Valued Customer', html } = await request.json();

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message' },
        { status: 400 }
      );
    }

    const result = await emailService.sendEmail({
      to,
      subject,
      message,
      customerName,
      html,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        provider: result.provider,
      });
    } else {
      return NextResponse.json(
        { error: 'Email service error', details: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  const status = emailService.getStatus();
  
  return NextResponse.json({
    message: 'Email service status',
    configured: status,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
} 