import nodemailer from 'nodemailer';

export interface EmailData {
  to: string;
  subject: string;
  message: string;
  customerName?: string;
  html?: string;
}

export interface EmailResult {
  success: boolean;
  provider: 'smtp' | 'mock';
  error?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Initialize SMTP transporter if credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail', // Can be 'gmail', 'outlook', 'yahoo', etc.
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }
  }

  async sendEmail(data: EmailData): Promise<EmailResult> {
    const { to, subject, message, customerName = 'Valued Customer', html } = data;
    const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_USER || 'noreply@glamourlocks.com';

    // Try real SMTP if configured
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: fromEmail,
          to: to,
          subject: subject,
          text: message,
          html: html || `<div style="font-family:sans-serif"><h2>Hi ${customerName},</h2><div>${message.replace(/\n/g, '<br>')}</div></div>`
        });
        return { success: true, provider: 'smtp' };
      } catch (error) {
        console.error('SMTP email failed:', error);
        // Fall back to mock email
      }
    }

    // Mock email for development/testing
    try {
      console.log('📧 Mock Email Sent:');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Message:', message);
      console.log('Customer:', customerName);
      
      return { success: true, provider: 'mock' };
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        provider: 'mock',
        error: 'Email service not configured. Please check your email settings.',
      };
    }
  }

  getStatus() {
    return {
      smtp: !!this.transporter,
      mock: true, // Always available for development
      fromEmail: process.env.FROM_EMAIL || process.env.EMAIL_USER || 'noreply@glamourlocks.com',
    };
  }
}

export const emailService = new EmailService(); 