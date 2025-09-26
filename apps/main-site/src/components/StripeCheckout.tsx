"use client";

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  PaymentElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Initialize Stripe - Make sure to use your LIVE publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
  defaultValues: {
    billingDetails: {
      country: 'GB',
    },
  },
};

// Payment Element appearance
const appearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#ec4899', // Pink to match your theme
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
      fontSize: '16px',
    },
    '.Input:focus': {
      borderColor: '#ec4899',
      boxShadow: '0 0 0 2px rgba(236, 72, 153, 0.2)',
    },
  },
};

// Payment Request Button for Google Pay/Apple Pay
function PaymentRequestButton({ amount, onSuccess, onError, customerEmail, customerName }: StripeCheckoutProps) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: 'GB', // Set to UK
      currency: 'gbp',
      total: {
        label: 'Glamour Locks Boutique',
        amount: Math.round(amount * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    // Check if the Payment Request API is available
    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
      }
    });

    // Listen for paymentmethod event
    pr.on('paymentmethod', async (ev) => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            payment_method_id: ev.paymentMethod.id,
            customer_email: customerEmail,
            customer_name: customerName,
          }),
        });

        const { client_secret, error } = await response.json();

        if (error) {
          ev.complete('fail');
          onError?.(error);
          return;
        }

        const { error: confirmError } = await stripe.confirmCardPayment(
          client_secret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        );

        if (confirmError) {
          ev.complete('fail');
          onError?.(confirmError.message || 'Payment failed');
        } else {
          ev.complete('success');
          onSuccess(ev.paymentMethod.id);
        }
      } catch (error) {
        ev.complete('fail');
        onError?.('Payment failed');
      }
    });
  }, [stripe, amount, customerEmail, customerName, onSuccess, onError]);

  if (!canMakePayment || !paymentRequest) {
    return null;
  }

  return (
    <div className="mb-4">
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: {
              theme: 'dark',
              height: '48px',
              type: 'default',
            },
          },
        }}
      />
    </div>
  );
}

// Enhanced checkout form with Payment Element
function EnhancedCheckoutForm({ amount, onSuccess, onError, customerEmail, customerName }: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
        payment_method_data: {
          billing_details: {
            name: customerName,
            email: customerEmail,
          },
        },
      },
      redirect: 'if_required',
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setErrorMessage(error.message || 'Payment failed');
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
      onError?.(error.message || 'Payment failed');
    } else {
      // Payment succeeded
      onSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Payment Request Button (Apple Pay / Google Pay) */}
        <PaymentRequestButton 
          amount={amount}
          onSuccess={onSuccess}
          onError={onError}
          customerEmail={customerEmail}
          customerName={customerName}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Payment Method
          </label>
          <div className="p-4 border-2 rounded-lg bg-white border-gray-200 focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-200 transition-all">
            <PaymentElement 
              options={{
                layout: 'tabs',
                defaultValues: {
                  billingDetails: {
                    name: customerName,
                    email: customerEmail,
                    address: {
                      country: 'GB', // Set default country to UK
                    },
                  },
                },
                fields: {
                  billingDetails: {
                    address: {
                      country: 'never', // Hide country field if you only accept UK
                    },
                  },
                },
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
        className="w-full bg-pink-600 hover:bg-pink-700"
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

// Card-only checkout form
function CardOnlyCheckoutForm({ amount, onSuccess, onError, customerEmail, customerName }: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
          name: customerName || 'Customer',
          email: customerEmail,
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
        onError?.(result.error);
      } else if (result.status === 'succeeded') {
        onSuccess(paymentMethod.id);
      } else {
        setErrorMessage('Payment requires additional authentication');
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

// Main checkout component with tabs
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
    // Create PaymentIntent when component mounts
    const createPaymentIntent = async () => {
      setLoading(true);
      try {
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
          console.error('Payment intent creation failed:', errorData);
          throw new Error(errorData.error || 'Failed to create payment intent');
        }
        
        const { client_secret } = await response.json();
        setClientSecret(client_secret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        props.onError?.(error instanceof Error ? error.message : 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    if (props.amount > 0) {
      createPaymentIntent();
    }
  }, [props.amount, props.customerEmail, props.customerName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-pink-600" />
        <span>Initializing payment...</span>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-red-600 text-center p-4">
        <p className="font-semibold mb-2">Failed to initialize payment</p>
        <p className="text-sm">Please refresh the page and try again.</p>
      </div>
    );
  }

  const stripeOptions = {
    clientSecret,
    appearance,
    loader: 'auto' as const,
  };

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <TabbedCheckoutForm {...props} />
    </Elements>
  );
}