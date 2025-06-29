"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { AddressSelection } from "@/components/checkout/AddressSelection";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  CreditCard,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import type { UserAddress } from "@repo/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { cartData, isLoading: cartLoading, fetchCart } = useCartStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState<UserAddress | null>(
    null
  );
  const [billingAddress, setBillingAddress] = useState<UserAddress | null>(
    null
  );
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  const [shippingMethod, setShippingMethod] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    fetchCart();
  }, [isAuthenticated, router, fetchCart]);

  // Auto-set billing address when shipping changes and "same as shipping" is checked
  useEffect(() => {
    if (useShippingAsBilling && shippingAddress) {
      setBillingAddress(shippingAddress);
    }
  }, [shippingAddress, useShippingAsBilling]);

  const steps = [
    { id: 1, name: "Shipping Address", icon: Truck },
    { id: 2, name: "Billing Address", icon: CreditCard },
    { id: 3, name: "Review & Payment", icon: ShoppingBag },
  ];

  const canProceedToStep = (step: number): boolean => {
    switch (step) {
      case 2:
        return !!shippingAddress;
      case 3:
        return !!shippingAddress && (useShippingAsBilling || !!billingAddress);
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3 && canProceedToStep(currentStep + 1)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (cartLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add some items to your cart to proceed with checkout.
            </p>
            <Button onClick={() => router.push("/products")}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/cart")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>

        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-600 mt-2">Complete your purchase securely</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-center space-x-5">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step.name}
                </span>
                {stepIdx < steps.length - 1 && (
                  <div
                    className={`ml-5 w-16 h-px ${
                      currentStep > step.id ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Shipping Address */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AddressSelection
                  type="shipping"
                  selectedAddress={shippingAddress}
                  onAddressSelect={setShippingAddress}
                  title=""
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Billing Address */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Same as shipping option */}
                <div className="flex items-center space-x-2">
                  <input
                    id="same-as-shipping"
                    type="checkbox"
                    checked={useShippingAsBilling}
                    onChange={(e) => setUseShippingAsBilling(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label
                    htmlFor="same-as-shipping"
                    className="text-sm font-medium text-gray-700"
                  >
                    Same as shipping address
                  </label>
                </div>

                {/* Show shipping address preview when using same address */}
                {useShippingAsBilling && shippingAddress && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className="text-blue-700 border-blue-300"
                        >
                          Using Shipping Address
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-700">
                        <p className="font-medium">
                          {shippingAddress.first_name}{" "}
                          {shippingAddress.last_name}
                        </p>
                        <p>{shippingAddress.address_line_1}</p>
                        {shippingAddress.address_line_2 && (
                          <p>{shippingAddress.address_line_2}</p>
                        )}
                        <p>
                          {shippingAddress.city}, {shippingAddress.state}{" "}
                          {shippingAddress.postal_code}
                        </p>
                        <p>{shippingAddress.country}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Billing address selection when not using shipping */}
                {!useShippingAsBilling && (
                  <div className="mt-4">
                    <AddressSelection
                      type="billing"
                      selectedAddress={billingAddress}
                      onAddressSelect={setBillingAddress}
                      title=""
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Payment */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Order Review */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-green-600" />
                    Review Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Address Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shipping Address Summary */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Truck className="h-4 w-4 text-blue-600" />
                        Shipping Address
                      </h4>
                      {shippingAddress && (
                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border">
                          <p className="font-medium text-gray-900">
                            {shippingAddress.first_name}{" "}
                            {shippingAddress.last_name}
                          </p>
                          {shippingAddress.company && (
                            <p>{shippingAddress.company}</p>
                          )}
                          <p>{shippingAddress.address_line_1}</p>
                          {shippingAddress.address_line_2 && (
                            <p>{shippingAddress.address_line_2}</p>
                          )}
                          <p>
                            {shippingAddress.city}, {shippingAddress.state}{" "}
                            {shippingAddress.postal_code}
                          </p>
                          <p>{shippingAddress.country}</p>
                          {shippingAddress.phone && (
                            <p>📞 {shippingAddress.phone}</p>
                          )}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(1)}
                        className="mt-2 text-blue-600"
                      >
                        Change Address
                      </Button>
                    </div>

                    {/* Billing Address Summary */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-purple-600" />
                        Billing Address
                      </h4>
                      {useShippingAsBilling ? (
                        <div className="text-sm text-gray-600 bg-purple-50 p-3 rounded border">
                          <p className="font-medium text-purple-700 mb-2">
                            Same as shipping address
                          </p>
                          <p className="text-gray-600">
                            Billing will be sent to your shipping address
                          </p>
                        </div>
                      ) : billingAddress ? (
                        <div className="text-sm text-gray-600 bg-purple-50 p-3 rounded border">
                          <p className="font-medium text-gray-900">
                            {billingAddress.first_name}{" "}
                            {billingAddress.last_name}
                          </p>
                          {billingAddress.company && (
                            <p>{billingAddress.company}</p>
                          )}
                          <p>{billingAddress.address_line_1}</p>
                          {billingAddress.address_line_2 && (
                            <p>{billingAddress.address_line_2}</p>
                          )}
                          <p>
                            {billingAddress.city}, {billingAddress.state}{" "}
                            {billingAddress.postal_code}
                          </p>
                          <p>{billingAddress.country}</p>
                          {billingAddress.phone && (
                            <p>📞 {billingAddress.phone}</p>
                          )}
                        </div>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(2)}
                        className="mt-2 text-purple-600"
                      >
                        Change Address
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Shipping Method Selection */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Shipping Method
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          id: "standard",
                          name: "Standard Shipping",
                          description: "5-7 business days",
                          price: "Free",
                          selected: true,
                        },
                        {
                          id: "express",
                          name: "Express Shipping",
                          description: "2-3 business days",
                          price: "₹99",
                          selected: false,
                        },
                        {
                          id: "overnight",
                          name: "Overnight Shipping",
                          description: "Next business day",
                          price: "₹299",
                          selected: false,
                        },
                      ].map((method) => (
                        <label
                          key={method.id}
                          className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value={method.id}
                            checked={
                              shippingMethod === method.id ||
                              (method.selected && !shippingMethod)
                            }
                            onChange={(e) => setShippingMethod(e.target.value)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {method.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {method.description}
                                </p>
                              </div>
                              <p className="font-medium text-gray-900">
                                {method.price}
                              </p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Method Selection */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Payment Method
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          id: "razorpay",
                          name: "Credit/Debit Card",
                          description: "Visa, Mastercard, RuPay",
                          icon: "💳",
                        },
                        {
                          id: "upi",
                          name: "UPI Payment",
                          description: "Pay using any UPI app",
                          icon: "📱",
                        },
                        {
                          id: "netbanking",
                          name: "Net Banking",
                          description: "Pay using your bank account",
                          icon: "🏦",
                        },
                        {
                          id: "wallet",
                          name: "Digital Wallet",
                          description: "Paytm, PhonePe, Google Pay",
                          icon: "💰",
                        },
                      ].map((method) => (
                        <label
                          key={method.id}
                          className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{method.icon}</span>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {method.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {method.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {currentStep === 1 ? "Back to Cart" : "Previous"}
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={handleNextStep}
                disabled={!canProceedToStep(currentStep + 1)}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  // Handle order placement
                  console.log("Placing order...", {
                    shippingAddress,
                    billingAddress: useShippingAsBilling
                      ? shippingAddress
                      : billingAddress,
                    shippingMethod: shippingMethod || "standard",
                    paymentMethod,
                    useShippingAsBilling,
                  });
                }}
                disabled={
                  !shippingAddress ||
                  (!useShippingAsBilling && !billingAddress) ||
                  !paymentMethod
                }
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2 px-8"
              >
                <ShoppingBag className="h-4 w-4" />
                Place Order
              </Button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <OrderSummary cartData={cartData} />

            {/* Trust Badges */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Secure Checkout
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">🔒</span>
                    <span>SSL Encrypted Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">🛡️</span>
                    <span>100% Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600">💳</span>
                    <span>Multiple Payment Options</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600">📞</span>
                    <span>24/7 Customer Support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
