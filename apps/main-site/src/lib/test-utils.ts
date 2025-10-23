// Basic testing utilities for the Glamour Locks project

export interface TestConfig {
  baseUrl: string;
  timeout: number;
}

export const testConfig: TestConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  timeout: 10000
};

// Mock data for testing
export const mockOrderData = {
  orderNumber: 'TEST-123456',
  customer: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    address: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345',
    country: 'Test Country',
    specialInstructions: 'Test instructions'
  },
  items: [
    {
      id: 'test-product-1',
      name: 'Test Product',
      price: 1000, // £10.00 in pence
      quantity: 1,
      image: '/test-image.jpg',
      description: 'Test product description'
    }
  ],
  subtotal: 1000,
  shipping: 0,
  total: 1000,
  emailSent: false,
  status: 'pending'
};

export const mockPaymentData = {
  amount: 1000, // £10.00 in pence
  customer_email: 'john.doe@example.com',
  customer_name: 'John Doe'
};

// Test helper functions
export async function testApiEndpoint(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<{ success: boolean; status: number; data?: any; error?: string }> {
  try {
    const response = await fetch(`${testConfig.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const responseData = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: responseData,
      error: response.ok ? undefined : responseData.error || 'Unknown error'
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

// Basic validation tests
export function validateOrderStructure(order: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!order.orderNumber) errors.push('Missing orderNumber');
  if (!order.customer) errors.push('Missing customer data');
  if (!order.items || !Array.isArray(order.items)) errors.push('Missing or invalid items array');
  if (typeof order.total !== 'number') errors.push('Invalid total amount');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function validatePaymentStructure(payment: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (typeof payment.amount !== 'number' || payment.amount < 50) {
    errors.push('Invalid amount (minimum £0.50)');
  }
  if (payment.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payment.customer_email)) {
    errors.push('Invalid email format');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Environment validation
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD_HASH',
    'NEXTAUTH_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  return {
    valid: missing.length === 0,
    missing
  };
}

// Test runner for basic functionality
export async function runBasicTests(): Promise<{ passed: number; failed: number; results: any[] }> {
  const results: any[] = [];
  let passed = 0;
  let failed = 0;
  
  // Test 1: Environment variables
  const envTest = validateEnvironment();
  results.push({
    test: 'Environment Variables',
    passed: envTest.valid,
    details: envTest.valid ? 'All required env vars present' : `Missing: ${envTest.missing.join(', ')}`
  });
  envTest.valid ? passed++ : failed++;
  
  // Test 2: API endpoints accessibility
  const healthTest = await testApiEndpoint('/api/health');
  results.push({
    test: 'API Health Check',
    passed: healthTest.success,
    details: healthTest.success ? 'API accessible' : healthTest.error
  });
  healthTest.success ? passed++ : failed++;
  
  // Test 3: Payment intent creation
  const paymentTest = await testApiEndpoint('/api/create-payment-intent', 'POST', mockPaymentData);
  results.push({
    test: 'Payment Intent Creation',
    passed: paymentTest.success,
    details: paymentTest.success ? 'Payment intent created' : paymentTest.error
  });
  paymentTest.success ? passed++ : failed++;
  
  return { passed, failed, results };
}








