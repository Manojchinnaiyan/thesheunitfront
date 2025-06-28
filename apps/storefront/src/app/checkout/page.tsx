'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { AddressForm } from '@/components/checkout/AddressForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { PaymentMethod } from '@/components/checkout/PaymentMethod';
import { ShippingMethod } from '@/components/checkout/ShippingMethod';
import { ordersService } from '@repo/api';
import type { AddressForm as AddressFormType, OrderCreateRequest } from '@repo/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { cartData, isLoading: cartLoading, fetchCart, clearCart } = useCartStore();

  // Checkout state
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [shippingAddress, setShippingAddress] = useState<AddressFormType | null>(null);
  const [billingAddress, setBillingAddress] = useState<AddressFormType | null>(null);
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [shippingCost, setShippingCost] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Checkout</h1>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p>Please sign in to continue with checkout.</p>
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 ml-1">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if cart is empty
  if (!cartLoading && (!cartData || !cartData.items || cartData.items.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Checkout</h1>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            <p>Your cart is empty. Add some products before checking out.</p>
            <Link href="/products" className="font-medium text-blue-600 hover:text-blue-500 ml-1">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleShippingAddressSubmit = (address: AddressFormType) => {
    setShippingAddress(address);
    setCurrentStep(2);
  };

  const handleBillingAddressSubmit = (address: AddressFormType) => {
    setBillingAddress(address);
    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress || !cartData) return;

    setIsPlacingOrder(true);
    setError('');

    try {
      const orderData: OrderCreateRequest = {
        shipping_address: shippingAddress,
        billing_address: useShippingAsBilling ? shippingAddress : billingAddress!,
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
        use_shipping_as_billing: useShippingAsBilling,
      };

      console.log('Creating order with data:', orderData);
      
      const order = await ordersService.createOrder(orderData);
      console.log('Order created:', order);

      // Clear cart after successful order
      await clearCart();

      // Redirect to order confirmation or payment
      router.push(`/orders/${order.id}/confirmation`);
    } catch (err: any) {
      console.error('Failed to place order:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const steps = [
    { id: 1, name: 'Shipping Address', icon: '📍' },
    { id: 2, name: 'Billing Address', icon: '💳' },
    { id: 3, name: 'Shipping & Payment', icon: '🚚' },
    { id: 4, name: 'Review Order', icon: '📋' },
  ];

  if (cartLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center ${
                step.id < steps.length ? 'flex-1' : ''
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                  currentStep >= step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > step.id ? '✓' : step.icon}
              </div>
              <div className="ml-2 hidden sm:block">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </p>
              </div>
              {step.id < steps.length && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Address */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
              <AddressForm
                initialData={{
                  first_name: user?.first_name || '',
                  last_name: user?.last_name || '',
                }}
                onSubmit={handleShippingAddressSubmit}
                submitLabel="Continue to Billing"
              />
            </div>
          )}

          {/* Step 2: Billing Address */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h2>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={useShippingAsBilling}
                    onChange={(e) => setUseShippingAsBilling(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Same as shipping address
                  </span>
                </label>
              </div>

              {useShippingAsBilling ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Billing address will be the same as shipping address.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="btn-outline px-4 py-2"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="btn-primary px-4 py-2"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ) : (
                <AddressForm
                  onSubmit={handleBillingAddressSubmit}
                  onCancel={() => setCurrentStep(1)}
                  submitLabel="Continue to Shipping"
                />
              )}
            </div>
          )}

          {/* Step 3: Shipping & Payment */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <ShippingMethod
                  selectedMethod={shippingMethod}
                  onMethodChange={setShippingMethod}
                  onCostChange={setShippingCost}
                />
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <PaymentMethod
                  selectedMethod={paymentMethod}
                  onMethodChange={setPaymentMethod}
                />
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Notes (Optional)</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions for your order..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn-outline px-4 py-2"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="btn-primary px-4 py-2"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review Order */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Review Your Order</h2>
              
              <div className="space-y-6">
                {/* Addresses Review */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                    {shippingAddress && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        <p>{shippingAddress.first_name} {shippingAddress.last_name}</p>
                        {shippingAddress.company && <p>{shippingAddress.company}</p>}
                        <p>{shippingAddress.address_line_1}</p>
                        {shippingAddress.address_line_2 && <p>{shippingAddress.address_line_2}</p>}
                        <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}</p>
                        <p>{shippingAddress.country}</p>
                        {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Billing Address</h3>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {useShippingAsBilling ? (
                        <p>Same as shipping address</p>
                      ) : billingAddress ? (
                        <>
                          <p>{billingAddress.first_name} {billingAddress.last_name}</p>
                          {billingAddress.company && <p>{billingAddress.company}</p>}
                          <p>{billingAddress.address_line_1}</p>
                          {billingAddress.address_line_2 && <p>{billingAddress.address_line_2}</p>}
                          <p>{billingAddress.city}, {billingAddress.state} {billingAddress.postal_code}</p>
                          <p>{billingAddress.country}</p>
                          {billingAddress.phone && <p>{billingAddress.phone}</p>}
                        </>
                      ) : (
                        <p>Not set</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping & Payment Method Review */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Shipping Method</h3>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      <p className="capitalize">{shippingMethod.replace('_', ' ')} Shipping</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      <p className="capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</p>
                    </div>
                  </div>
                </div>

                {notes && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Order Notes</h3>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      <p>{notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="btn-outline px-4 py-2"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="btn-primary px-6 py-3 text-lg"
                >
                  {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          {cartData && (
            <div className="sticky top-4">
              <OrderSummary cartData={cartData} shippingCost={shippingCost} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
