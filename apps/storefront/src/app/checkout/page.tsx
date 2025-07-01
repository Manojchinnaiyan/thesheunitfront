"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useAddressStore } from "@/store/address";
import { AddressForm } from "@/components/checkout/AddressForm";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, isLoading: cartLoading, fetchCart } = useCartStore();
  const { 
    addresses, 
    isLoading: addressLoading, 
    fetchAddresses, 
    createAddress 
  } = useAddressStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [billingAddress, setBillingAddress] = useState(null);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("razorpay");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, [fetchCart, fetchAddresses]);

  const handleAddressSubmit = async (addressData: any) => {
    try {
      if (currentStep === 1) {
        // Shipping address
        const address = await createAddress(addressData);
        setShippingAddress(address);
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // Billing address
        const address = await createAddress(addressData);
        setBillingAddress(address);
        setCurrentStep(3);
      }
    } catch (error) {
      console.error("Error saving address:", error);
      setError("Failed to save address. Please try again.");
    }
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setError("");

    try {
      const orderData = {
        shipping_address: shippingAddress,
        billing_address: useSameAddress ? shippingAddress : billingAddress,
        shipping_method: selectedShippingMethod,
        payment_method: selectedPaymentMethod,
      };

      const token = localStorage.getItem("access_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      
      const response = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to place order");
      }

      const order = await response.json();
      
      // Redirect to success page
      router.push(`/orders/${order.id}?success=true`);
    } catch (err: any) {
      console.error("Order placement error:", err);
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const steps = [
    { id: 1, name: "Shipping Address", icon: "📍" },
    { id: 2, name: "Billing Address", icon: "💳" },
    { id: 3, name: "Shipping & Payment", icon: "🚚" },
    { id: 4, name: "Review Order", icon: "📋" },
  ];

  if (cartLoading || addressLoading) {
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
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
        {/* Main Content */}
        <div className="lg:col-span-7">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, stepIdx) => (
                <div
                  key={step.id}
                  className={`flex items-center ${stepIdx < steps.length - 1 ? "flex-1" : ""}`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                      currentStep >= step.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <span className="text-lg">{step.icon}</span>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step.id
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </p>
                  </div>
                  {stepIdx < steps.length - 1 && (
                    <div
                      className={`hidden lg:block w-5 h-5 ml-4 ${
                        currentStep > step.id
                          ? "text-blue-600"
                          : "text-gray-300"
                      }`}
                    >
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Shipping Address
              </h2>
              <AddressForm
                onSubmit={handleAddressSubmit}
                addressType="shipping"
                isLoading={false}
              />
            </div>
          )}

          {currentStep === 2 && !useSameAddress && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Billing Address
              </h2>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={useSameAddress}
                    onChange={(e) => {
                      setUseSameAddress(e.target.checked);
                      if (e.target.checked) {
                        setBillingAddress(shippingAddress);
                        setCurrentStep(3);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Use same as shipping address
                  </span>
                </label>
              </div>
              {!useSameAddress && (
                <AddressForm
                  onSubmit={handleAddressSubmit}
                  addressType="billing"
                  isLoading={false}
                />
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Shipping Methods */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Shipping Method
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="shipping"
                      value="standard"
                      checked={selectedShippingMethod === "standard"}
                      onChange={(e) => setSelectedShippingMethod(e.target.value)}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2">Standard Shipping (5-7 days) - Free</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="shipping"
                      value="express"
                      checked={selectedShippingMethod === "express"}
                      onChange={(e) => setSelectedShippingMethod(e.target.value)}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2">Express Shipping (2-3 days) - $10.00</span>
                  </label>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={selectedPaymentMethod === "razorpay"}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2">Razorpay (Cards, UPI, Wallets)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={selectedPaymentMethod === "cod"}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2">Cash on Delivery</span>
                  </label>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(4)}
                disabled={!selectedShippingMethod || !selectedPaymentMethod}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Continue to Review
              </button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Review Your Order
              </h2>
              
              {/* Order Summary */}
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium">Shipping Address</h3>
                  <p className="text-sm text-gray-600">
                    {shippingAddress?.first_name} {shippingAddress?.last_name}<br />
                    {shippingAddress?.address_line1}<br />
                    {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postal_code}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Payment Method</h3>
                  <p className="text-sm text-gray-600">
                    {selectedPaymentMethod === "razorpay" ? "Razorpay" : "Cash on Delivery"}
                  </p>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isPlacingOrder ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="mt-10 lg:mt-0 lg:col-span-5">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{item.product?.name}</h3>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency((item.product?.price || 0) * item.quantity / 100)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(total / 100)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{selectedShippingMethod === "express" ? "$10.00" : "Free"}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>
                    {formatCurrency((total + (selectedShippingMethod === "express" ? 1000 : 0)) / 100)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
