import { NextRequest, NextResponse } from 'next/server';
import { getSecurityHeaders } from '@/lib/security';
import { HealthChecker, logger } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    logger.info('Health check requested', { ip: request.ip });

    // Run comprehensive health checks
    const healthChecks = await HealthChecker.runAllChecks();
    
    const health = {
      status: healthChecks.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: healthChecks.services.database ? 'connected' : 'disconnected',
        stripe: healthChecks.services.stripe ? 'configured' : 'missing',
        email: healthChecks.services.email ? 'configured' : 'missing',
        auth: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    const statusCode = healthChecks.healthy ? 200 : 503;
    
    logger.info('Health check completed', { 
      status: health.status, 
      services: health.services 
    });

    return NextResponse.json(health, { 
      status: statusCode,
      headers: getSecurityHeaders()
    });
  } catch (error) {
    logger.error('Health check failed', error);
    
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}
