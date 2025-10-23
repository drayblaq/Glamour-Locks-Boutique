// Basic monitoring and logging utilities for Glamour Locks

export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: any;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  log(level: string, message: string, context?: any) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    };

    // In development, log to console
    if (this.isDevelopment) {
      const emoji = this.getEmoji(level);
      console.log(`${emoji} [${level.toUpperCase()}] ${message}`, context || '');
    }

    // In production, you would send to external logging service
    if (this.isProduction) {
      this.sendToExternalLogger(logEntry);
    }
  }

  private getEmoji(level: string): string {
    switch (level) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'info': return 'ℹ️';
      case 'debug': return '🔍';
      default: return '📝';
    }
  }

  private sendToExternalLogger(logEntry: LogEntry) {
    // In production, integrate with services like:
    // - Sentry for error tracking
    // - LogRocket for session replay
    // - DataDog for monitoring
    // - CloudWatch for AWS
    console.log('Production log:', JSON.stringify(logEntry));
  }

  error(message: string, context?: any) {
    this.log(LOG_LEVELS.ERROR, message, context);
  }

  warn(message: string, context?: any) {
    this.log(LOG_LEVELS.WARN, message, context);
  }

  info(message: string, context?: any) {
    this.log(LOG_LEVELS.INFO, message, context);
  }

  debug(message: string, context?: any) {
    this.log(LOG_LEVELS.DEBUG, message, context);
  }
}

export const logger = new Logger();

// Performance monitoring
export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  static startTimer(name: string): void {
    this.timers.set(name, Date.now());
  }

  static endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      logger.warn(`Timer '${name}' was not started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(name);
    
    logger.info(`Performance: ${name} took ${duration}ms`);
    return duration;
  }

  static async measureAsync<T>(
    name: string, 
    fn: () => Promise<T>
  ): Promise<T> {
    this.startTimer(name);
    try {
      const result = await fn();
      this.endTimer(name);
      return result;
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }
}

// Error tracking
export class ErrorTracker {
  static trackError(error: Error, context?: any) {
    logger.error(`Error: ${error.message}`, {
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: context });
      console.log('Production error tracking:', {
        message: error.message,
        stack: error.stack,
        context
      });
    }
  }

  static trackApiError(endpoint: string, error: any, requestData?: any) {
    logger.error(`API Error in ${endpoint}`, {
      endpoint,
      error: error.message || error,
      requestData,
      timestamp: new Date().toISOString()
    });
  }
}

// Business metrics tracking
export class MetricsTracker {
  static trackOrder(orderData: any) {
    logger.info('Order created', {
      orderNumber: orderData.orderNumber,
      total: orderData.total,
      itemCount: orderData.items?.length,
      customerEmail: orderData.customer?.email,
      timestamp: new Date().toISOString()
    });
  }

  static trackPayment(paymentData: any) {
    logger.info('Payment processed', {
      paymentId: paymentData.paymentId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      timestamp: new Date().toISOString()
    });
  }

  static trackUserAction(action: string, userId?: string, context?: any) {
    logger.info(`User action: ${action}`, {
      action,
      userId,
      context,
      timestamp: new Date().toISOString()
    });
  }
}

// Health check utilities
export class HealthChecker {
  static async checkDatabase(): Promise<boolean> {
    try {
      // Check Firebase connection
      // This would be implemented based on your database setup
      return true;
    } catch (error) {
      logger.error('Database health check failed', error);
      return false;
    }
  }

  static async checkStripe(): Promise<boolean> {
    try {
      // Check Stripe API connectivity
      return !!process.env.STRIPE_SECRET_KEY;
    } catch (error) {
      logger.error('Stripe health check failed', error);
      return false;
    }
  }

  static async checkEmail(): Promise<boolean> {
    try {
      // Check email service configuration
      return !!process.env.ADMIN_EMAIL;
    } catch (error) {
      logger.error('Email service health check failed', error);
      return false;
    }
  }

  static async runAllChecks(): Promise<{
    healthy: boolean;
    services: Record<string, boolean>;
  }> {
    const services = {
      database: await this.checkDatabase(),
      stripe: await this.checkStripe(),
      email: await this.checkEmail()
    };

    const healthy = Object.values(services).every(status => status);

    return { healthy, services };
  }
}








