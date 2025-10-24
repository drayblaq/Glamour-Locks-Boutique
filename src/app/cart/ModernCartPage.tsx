'use client';

import React, { useState, useRef } from 'react';
import { useCart } from '@/app/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StripeCheckout from '@/components/StripeCheckout';
import ShippingOptions from '@/components/checkout/ShippingOptions';
import { useToast } from '@/hooks/use-toast';
import { CustomerShippingSelection } from '@/lib/types/shipping';

const steps = ['Cart', 'Info', 'Shipping', 'Review', 'Payment'];

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-between mb-6 sm:mb-8">
      {steps.map((label, idx) => (
        <div key={label} className="flex-1 flex flex-col items-center">
          <div className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-white text-sm sm:text-lg shadow-md border-4 ${step >= idx ? 'bg-pink-500 border-pink-400' : 'bg-gray-300 border-gray-200'} transition-all duration-300`}>{idx + 1}</div>
          <span className={`mt-1 sm:mt-2 text-xs sm:text-sm ${step === idx ? 'text-pink-600 font-semibold' : 'text-gray-500'}`}>{label}</span>
          {idx < steps.length - 1 && <div className="h-1 w-full bg-gray-200 mt-1 sm:mt-2 mb-1 sm:mb-2" />}
        </div>
      ))}
    </div>
  );
}

function generateOrderNumber() {
  return `GLB-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
}

export default function ModernCartPage() {
  const cart = useCart();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '',
  });
  const [coupon, setCoupon] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('stripe');
  const [selectedShipping, setSelectedShipping] = useState<CustomerShippingSelection | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderInProgress, setOrderInProgress] = useState(false);
  const lastOrderCallRef = useRef(0);

  // Stripe config check
  const stripeConfigured = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  // Function to handle order placement
  const handleOrderPlacement = async (paymentId?: string) => {
    console.log('🛒 handleOrderPlacement called with paymentId:', paymentId);
    console.log('📦 Cart items count:', cart.items.length);
    console.log('🔄 Order in progress:', orderInProgress);
    console.log('✅ Order placed:', orderPlaced);
    console.log('🕐 Call timestamp:', new Date().toISOString());
    console.log('🆔 Call ID:', Math.random().toString(36).substr(2, 9));
    
    if (orderInProgress || orderPlaced) {
      console.log('❌ Order already in progress or placed, skipping duplicate request');
      return;
    }

    // Additional protection against duplicate calls
    if (isProcessing) {
      console.log('❌ Already processing, skipping duplicate request');
      return;
    }
    
    // Debounce protection - prevent multiple rapid calls
    const now = Date.now();
    if (lastOrderCallRef.current && (now - lastOrderCallRef.current) < 2000) {
      console.log('❌ Order placement called too quickly, debouncing...');
      return;
    }
    lastOrderCallRef.current = now;
    
    // CRITICAL: Check if an order with this paymentId already exists
    if (paymentId) {
      try {
        console.log('🔍 Checking for existing order with paymentId:', paymentId);
        const response = await fetch('/api/orders');
        if (response.ok) {
          const { orders } = await response.json();
          const existingOrder = orders.find((order: any) => order.paymentId === paymentId);
          if (existingOrder) {
            console.log('⚠️  Order with this paymentId already exists:', existingOrder.id);
            setOrderPlaced(true);
            toast({
              title: "Order Already Exists",
              description: "Your order has already been created successfully!",
              variant: "default",
            });
            return;
          }
        }
      } catch (error) {
        console.error('Error checking for existing order:', error);
      }
    }

    // Additional validation to prevent empty orders
    if (cart.items.length === 0) {
      console.log('❌ Cart is empty, skipping order placement');
      toast({ 
        title: 'Error', 
        description: 'Your cart is empty. Please add items before placing an order.', 
        variant: 'destructive' 
      });
      return;
    }

    // Validate that all required customer information is present
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
      console.log('❌ Missing required customer information');
      toast({ 
        title: 'Error', 
        description: 'Please fill in all required customer information.', 
        variant: 'destructive' 
      });
      return;
    }
    
    // CRITICAL: Prevent orders with placeholder customer data
    if (customerInfo.firstName === 'Valued Customer' || 
        customerInfo.firstName === '' || 
        customerInfo.lastName === '') {
      console.log('❌ Invalid customer data detected:', customerInfo);
      toast({ 
        title: 'Error', 
        description: 'Please enter valid customer information.', 
        variant: 'destructive' 
      });
      return;
    }

    console.log('🚀 Starting order creation process...');
    setOrderInProgress(true);
    setIsProcessing(true);
    
    // Capture cart items before any potential clearing
    const orderItems = [...cart.items];
    const orderSubtotal = cart.subtotal;
    const shippingCost = selectedShipping?.price || 0;
    
    // Validate that we have items to order
    if (orderItems.length === 0) {
      console.log('❌ No items to order, skipping order placement');
      toast({ 
        title: 'Error', 
        description: 'No items found in cart. Please add items before placing an order.', 
        variant: 'destructive' 
      });
      return;
    }
    
    // Double-check that items are valid
    const validItems = orderItems.filter(item => item.id && item.name && item.quantity > 0);
    if (validItems.length === 0) {
      console.log('❌ No valid items found, skipping order placement');
      toast({ 
        title: 'Error', 
        description: 'No valid items found in cart. Please add items before placing an order.', 
        variant: 'destructive' 
      });
      return;
    }

    const orderPayload = {
      orderNumber: generateOrderNumber(),
      orderDate: new Date().toISOString(),
      requestId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customer: {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        city: customerInfo.city,
        state: customerInfo.state,
        zipCode: customerInfo.zipCode,
        country: '',
        specialInstructions: '',
      },
      items: validItems, // Use validated items instead of orderItems
      subtotal: orderSubtotal,
      shipping: shippingCost,
      shippingOption: selectedShipping,
      total: orderSubtotal + shippingCost,
      emailSent: false,
      status: 'pending',
      paymentId: paymentId || '',
    };

    console.log('📋 Order payload:', JSON.stringify(orderPayload, null, 2));

    try {
      console.log('📤 Sending order to /api/orders...');
      console.log('🕐 Timestamp:', new Date().toISOString());
          console.log('📦 Order payload items count:', orderPayload.items.length);
    console.log('📦 Order items:', orderPayload.items.map(item => ({ id: item.id, name: item.name, quantity: item.quantity })));
    console.log('👤 Customer:', orderPayload.customer.firstName, orderPayload.customer.lastName);
    console.log('📧 Email:', orderPayload.customer.email);
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Order creation failed:', errorText);
        throw new Error('Failed to create order');
      }
      
      const result = await response.json();
      console.log('✅ Order created successfully:', result);
      
      setIsProcessing(false);
      setOrderPlaced(true);
      
      // Clear cart after a short delay to ensure order is fully processed
      setTimeout(() => {
        cart.clearCart();
      }, 1000);
      
      toast({
        title: "Order Placed!",
        description: "Your order has been created successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error('❌ Error creating order:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to create order. Please try again.', 
        variant: 'destructive' 
      });
      setIsProcessing(false);
    } finally {
      setOrderInProgress(false);
    }
  };

  // Step 0: Cart
  function renderCart() {
    return (
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Your Cart</h2>
        {cart.items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Your cart is empty.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.items.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm sm:text-base truncate">
                    {item.name}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">£{item.price.toFixed(2)} x {item.quantity}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    min={1} 
                    value={item.quantity} 
                    onChange={e => cart.updateQuantity(item.id, Number(e.target.value))} 
                    className="w-16 h-10 text-center" 
                  />
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => cart.removeItem(item.id)}
                    className="min-h-[40px] text-xs sm:text-sm"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex flex-col sm:flex-row justify-between mt-4 gap-3">
              <Input 
                placeholder="Coupon code (coming soon)" 
                value={coupon} 
                onChange={e => setCoupon(e.target.value)} 
                className="flex-1 min-h-[44px]" 
                disabled 
              />
              <Button 
                variant="outline" 
                onClick={cart.clearCart}
                className="min-h-[44px]"
              >
                Clear Cart
              </Button>
            </div>
          </div>
        )}
        <div className="flex justify-end mt-6">
          <Button 
            onClick={() => setStep(1)} 
            disabled={cart.items.length === 0}
            className="min-h-[44px] w-full sm:w-auto"
          >
            Next: Info
          </Button>
        </div>
      </div>
    );
  }

  // Step 1: Info
  function renderInfo() {
    return (
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Shipping Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input 
            placeholder="First Name" 
            value={customerInfo.firstName} 
            onChange={e => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
            className="min-h-[44px] text-base"
          />
          <Input 
            placeholder="Last Name" 
            value={customerInfo.lastName} 
            onChange={e => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
            className="min-h-[44px] text-base"
          />
          <Input 
            placeholder="Email" 
            type="email"
            value={customerInfo.email} 
            onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
            className="min-h-[44px] text-base"
          />
          <Input 
            placeholder="Phone" 
            type="tel"
            value={customerInfo.phone} 
            onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
            className="min-h-[44px] text-base"
          />
          <Input 
            placeholder="Address" 
            value={customerInfo.address} 
            onChange={e => setCustomerInfo({ ...customerInfo, address: e.target.value })}
            className="sm:col-span-2 min-h-[44px] text-base"
          />
          <Input 
            placeholder="City" 
            value={customerInfo.city} 
            onChange={e => setCustomerInfo({ ...customerInfo, city: e.target.value })}
            className="min-h-[44px] text-base"
          />
          <Input 
            placeholder="State" 
            value={customerInfo.state} 
            onChange={e => setCustomerInfo({ ...customerInfo, state: e.target.value })}
            className="min-h-[44px] text-base"
          />
          <Input 
            placeholder="ZIP Code" 
            value={customerInfo.zipCode} 
            onChange={e => setCustomerInfo({ ...customerInfo, zipCode: e.target.value })}
            className="min-h-[44px] text-base"
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
          <Button 
            variant="outline" 
            onClick={() => setStep(0)}
            className="min-h-[44px] w-full sm:w-auto"
          >
            Back
          </Button>
          <Button 
            onClick={() => setStep(2)}
            className="min-h-[44px] w-full sm:w-auto"
          >
            Next: Shipping
          </Button>
        </div>
      </div>
    );
  }

  // Step 2: Shipping
  function renderShipping() {
    return (
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Shipping Options</h2>
        <ShippingOptions
          onShippingSelect={setSelectedShipping}
          selectedShipping={selectedShipping || undefined}
          subtotal={cart.subtotal}
        />
        <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
          <Button 
            variant="outline" 
            onClick={() => setStep(1)}
            className="min-h-[44px] w-full sm:w-auto"
          >
            Back
          </Button>
          <Button 
            onClick={() => setStep(3)}
            disabled={!selectedShipping}
            className="min-h-[44px] w-full sm:w-auto"
          >
            Next: Review
          </Button>
        </div>
      </div>
    );
  }

  // Step 3: Review
  function renderReview() {
    // Validate cart is not empty
    if (cart.items.length === 0) {
      return (
        <div>
          <h2 className="text-2xl font-bold mb-4">Review & Place Order</h2>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Your cart is empty. Please add items before proceeding.</p>
            <Button onClick={() => setStep(0)}>Back to Cart</Button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Review & Place Order</h2>
        <div className="mb-4">
          <div><b>Name:</b> {customerInfo.firstName} {customerInfo.lastName}</div>
          <div><b>Email:</b> {customerInfo.email}</div>
          <div><b>Phone:</b> {customerInfo.phone}</div>
          <div><b>Address:</b> {customerInfo.address}, {customerInfo.city}, {customerInfo.state} {customerInfo.zipCode}</div>
        </div>
        <div className="mb-4">
          <b>Items:</b>
          <ul className="list-disc ml-6">
            {cart.items.map(item => (
              <li key={item.id}>
                {item.name} x {item.quantity} (£{item.price.toFixed(2)} each)
              </li>
            ))}
          </ul>
        </div>
        {selectedShipping && (
          <div className="mb-4">
            <b>Shipping:</b> {selectedShipping.name} - £{selectedShipping.price.toFixed(2)}
            <div className="text-sm text-gray-500">
              Estimated delivery: {selectedShipping.estimatedDays.min === selectedShipping.estimatedDays.max 
                ? `${selectedShipping.estimatedDays.min} ${selectedShipping.estimatedDays.min === 1 ? 'day' : 'days'}`
                : `${selectedShipping.estimatedDays.min}-${selectedShipping.estimatedDays.max} days`
              }
            </div>
          </div>
        )}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>£{cart.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Shipping:</span>
            <span>£{(selectedShipping?.price || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span><b>Total:</b></span>
            <span><b>£{(cart.subtotal + (selectedShipping?.price || 0)).toFixed(2)}</b></span>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
          <Button onClick={() => setStep(4)} disabled={isProcessing}>Next: Payment</Button>
        </div>
      </div>
    );
  }

  // Step 4: Payment
  function renderPayment() {
    // Validate cart is not empty
    if (cart.items.length === 0) {
      return (
        <div>
          <h2 className="text-2xl font-bold mb-4">Payment</h2>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Your cart is empty. Please add items before proceeding.</p>
            <Button onClick={() => setStep(0)}>Back to Cart</Button>
          </div>
        </div>
      );
    }

    // Validate customer information is complete
    if (!customerInfo.email || !customerInfo.firstName || !customerInfo.lastName) {
      return (
        <div>
          <h2 className="text-2xl font-bold mb-4">Payment</h2>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Please complete your customer information before proceeding to payment.</p>
            <Button onClick={() => setStep(1)}>Back to Info</Button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Payment</h2>
        <div className="mb-4">
          <Button variant={selectedPayment === 'stripe' ? 'default' : 'outline'} onClick={() => setSelectedPayment('stripe')}>Stripe</Button>
          {/* Add more payment options here */}
        </div>
        {selectedPayment === 'stripe' && (
          stripeConfigured ? (
            <StripeCheckout 
              amount={cart.subtotal + (selectedShipping?.price || 0)} 
              onSuccess={handleOrderPlacement}
              onError={msg => toast({ title: 'Stripe Error', description: msg, variant: 'destructive' })}
              customerEmail={customerInfo.email}
              customerName={`${customerInfo.firstName} ${customerInfo.lastName}`}
            />
          ) : (
            <div className="text-red-600">Stripe is not configured. Please contact the site owner.</div>
          )
        )}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
        </div>
      </div>
    );
  }

  // Order placed confirmation
  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h2 className="text-3xl font-bold text-green-600 mb-4">Order Placed!</h2>
        <p className="mb-4">Thank you for your order. Your order has been created and is now visible in the admin dashboard.</p>
        <p className="mb-6 text-sm text-gray-600">Note: Payment processing will be handled separately. You will receive a confirmation email once payment is completed.</p>
        <Button className="mt-6" onClick={() => setOrderPlaced(false)}>Shop More</Button>
      </div>
    );
  }



  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-4 md:p-8">
      <ProgressBar step={step} />
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-8 animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out">
        {step === 0 && renderCart()}
        {step === 1 && renderInfo()}
        {step === 2 && renderShipping()}
        {step === 3 && renderReview()}
        {step === 4 && renderPayment()}
      </div>
      <aside className="sticky bottom-0 bg-gradient-to-r from-pink-100 to-pink-50 p-4 rounded-t-2xl shadow-inner flex flex-col sm:flex-row justify-between items-center gap-4 z-20 border-t border-pink-200 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="w-full sm:w-auto text-center">
          <div className="font-bold text-base sm:text-lg text-primary">Order Summary</div>
          <div className="text-sm sm:text-base">Subtotal: <span className="font-semibold text-accent">£{cart.subtotal.toFixed(2)}</span></div>
          {selectedShipping && (
            <div className="text-sm sm:text-base">Shipping: <span className="font-semibold text-accent">£{selectedShipping.price.toFixed(2)}</span></div>
          )}
          <div className="text-sm sm:text-base border-t pt-1 mt-1">Total: <span className="font-bold text-primary">£{(cart.subtotal + (selectedShipping?.price || 0)).toFixed(2)}</span></div>
        </div>
      </aside>
    </div>
  );
} 
