"use client";

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

interface StripeCheckoutProps {
  amount: number;
  onSuccess: (paymentId?: string) => void;
  onError?: (error: string) => void;
  customerEmail?: string;
  customerName?: string;
}

// Card styling options
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#374151',
      '::placeholder': {
        color: '#9CA3AF',
      },
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fontSmoothing: 'antialiased',
      padding: '12px',
    },
    invalid: {
      color: '#EF4444',
      iconColor: '#EF4444',
    },
    complete: {
      color: '#059669',
    },
  },
  hidePostalCode: false,
};

// Payment Element appearance
const appearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#7c3aed',
    colorBackground: '#ffffff',
    colorText: '#374151',
    colorDanger: '#ef4444',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
  rules: {
    '.Input': {
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '16px',
    },
    '.Input:focus': {
      borderColor: '#7c3aed',
      boxShadow: '0 0 0 2px rgba(124, 58, 237, 0.2)',
    },
  },
};

// Enhanced checkout form with Payment Element (supports multiple payment methods)
function EnhancedCheckoutForm({ amount, onSuccess, onError, customerEmail, customerName }: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successCalled, setSuccessCalled] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/cart/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed');
      onError?.(error.message || 'Payment failed');
    } else {
      // Prevent multiple success calls
      if (successCalled) {
        console.log('⚠️  Success callback already called, skipping duplicate');
        return;
      }
      setSuccessCalled(true);
      
      // Get payment intent ID from client secret
      const paymentIntentId = (elements as any)._clientSecret?.split('_secret_')[0] || '';
      console.log('✅ Payment successful, calling onSuccess with paymentId:', paymentIntentId);
      onSuccess(paymentIntentId);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Payment Method
          </label>
          <div className="p-4 border-2 rounded-lg bg-white border-gray-200 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200 transition-all">
            <PaymentElement 
              options={{
                layout: 'tabs',
                paymentMethodOrder: ['card', 'apple_pay', 'google_pay', 'link', 'paypal'],
              }}
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-purple-600 hover:bg-purple-700"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay £{amount.toFixed(2)}
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Your payment information is secure and encrypted by Stripe.
      </p>
    </form>
  );
}

// Legacy card-only form
function CardOnlyCheckoutForm({ amount, onSuccess, onError, customerEmail, customerName }: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successCalled, setSuccessCalled] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: customerName || 'Customer Name',
          email: customerEmail || 'customer@example.com',
        },
      });

      if (paymentMethodError) {
        setErrorMessage(paymentMethodError.message || 'An error occurred');
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          payment_method_id: paymentMethod.id,
          customer_email: customerEmail,
          customer_name: customerName,
        }),
      });

      const result = await response.json();

      if (result.error) {
        setErrorMessage(result.error);
        setIsProcessing(false);
        return;
      }

      if (result.client_secret) {
        const { error: confirmError } = await stripe.confirmCardPayment(result.client_secret);
        
        if (confirmError) {
          setErrorMessage(confirmError.message || 'Payment failed');
        } else {
          // Prevent multiple success calls
          if (successCalled) {
            console.log('⚠️  Success callback already called, skipping duplicate');
            return;
          }
          setSuccessCalled(true);
          
          // Get payment intent ID from client secret
          const paymentIntentId = result.client_secret.split('_secret_')[0];
          console.log('✅ Payment successful, calling onSuccess with paymentId:', paymentIntentId);
          onSuccess(paymentIntentId);
        }
      } else {
        // Don't call onSuccess if there's no client_secret - this indicates an error
        setErrorMessage('Payment setup failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('An unexpected error occurred');
      onError?.(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Card Information
          </label>
          <div className="p-4 border-2 rounded-lg bg-white border-gray-200 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200 transition-all">
            <CardElement 
              options={cardElementOptions}
              onChange={(event) => {
                if (event.error) {
                  setErrorMessage(event.error.message);
                } else {
                  setErrorMessage('');
                }
              }}
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-purple-600 hover:bg-purple-700"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay £{amount.toFixed(2)}
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Your payment information is secure and encrypted by Stripe.
      </p>
    </form>
  );
}

// Main component with tabbed interface
function TabbedCheckoutForm(props: StripeCheckoutProps) {
  return (
    <div className="w-full">
      <Tabs defaultValue="all-methods" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="all-methods" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            All Payment Methods
          </TabsTrigger>
          <TabsTrigger value="card-only" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Card Only
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-methods" className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Multiple Payment Options Available</h4>
                <p className="text-sm text-blue-700">
                  Choose from credit cards, Apple Pay, Google Pay, and more secure payment methods.
                </p>
              </div>
            </div>
          </div>
          <EnhancedCheckoutForm {...props} />
        </TabsContent>
        
        <TabsContent value="card-only" className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Credit Card Payment</h4>
                <p className="text-sm text-gray-700">
                  Pay securely with your credit or debit card.
                </p>
              </div>
            </div>
          </div>
          <CardOnlyCheckoutForm {...props} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function StripeCheckout(props: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create PaymentIntent when amount changes
    const createPaymentIntent = async () => {
      setLoading(true);
      try {
        console.log('🔧 Creating payment intent with:', {
          amount: props.amount,
          customerEmail: props.customerEmail,
          customerName: props.customerName
        });
        
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(props.amount * 100),
            automatic_payment_methods: { enabled: true },
            customer_email: props.customerEmail,
            customer_name: props.customerName,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Payment intent creation failed:', errorData);
          throw new Error(errorData.error || 'Failed to create payment intent');
        }
        
        const { client_secret } = await response.json();
        setClientSecret(client_secret);
      } catch (error) {
        console.error('❌ Error creating payment intent:', error);
        setClientSecret(null);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [props.amount, props.customerEmail, props.customerName]);

  const options = clientSecret
    ? {
        clientSecret,
        appearance,
      }
    : undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span>Initializing payment...</span>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-red-600 text-center p-4">
        <p className="font-semibold mb-2">Failed to initialize payment</p>
        <p className="text-sm">Please ensure you have completed your customer information and try again.</p>
        <p className="text-xs mt-2">If the problem persists, please contact support.</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <TabbedCheckoutForm {...props} />
    </Elements>
  );
}