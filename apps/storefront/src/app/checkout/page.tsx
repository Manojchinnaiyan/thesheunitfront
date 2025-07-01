// apps/storefront/src/app/checkout/page.tsx
// RESTORED ORIGINAL WORKING VERSION - Only fixed the items.map() error
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useAddressStore } from "@/store/address";
import { AddressForm } from "@/components/checkout/AddressForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PaymentMethod } from "@/components/checkout/PaymentMethod";
import { ShippingMethod } from "@/components/checkout/ShippingMethod";
import { ordersService } from "@repo/api";
import type {
  AddressForm as AddressFormType,
  UserAddress,
  OrderCreateRequest,
} from "@repo/types";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: { color: string };
  modal: { ondismiss: () => void };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const {
    cartData,
    isLoading: cartLoading,
    fetchCart,
    clearCart,
  } = useCartStore();
  const {
    addresses,
    isLoading: addressLoading,
    fetchAddresses,
    createAddress,
  } = useAddressStore();

  // Checkout state
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  // Address management
  const [selectedShippingAddress, setSelectedShippingAddress] =
    useState<UserAddress | null>(null);
  const [selectedBillingAddress, setSelectedBillingAddress] =
    useState<UserAddress | null>(null);
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  const [showNewShippingForm, setShowNewShippingForm] = useState(false);
  const [showNewBillingForm, setShowNewBillingForm] = useState(false);

  // Other form data
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [shippingCost, setShippingCost] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchAddresses();
    }
  }, [isAuthenticated, fetchCart, fetchAddresses]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Auto-select default shipping address
  useEffect(() => {
    if (addresses.length > 0 && !selectedShippingAddress) {
      const defaultAddress =
        addresses.find((addr) => addr.is_default) || addresses[0];
      setSelectedShippingAddress(defaultAddress);
      if (useShippingAsBilling) {
        setSelectedBillingAddress(defaultAddress);
      }
    }
  }, [addresses, selectedShippingAddress, useShippingAsBilling]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Checkout</h1>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p>Please sign in to continue with checkout.</p>
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 ml-1"
            >
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Only this part was changed - safer cart check
  if (
    !cartLoading &&
    (!cartData || !cartData.items || cartData.items.length === 0)
  ) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Checkout</h1>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            <p>Your cart is empty. Add some products before checking out.</p>
            <Link
              href="/products"
              className="font-medium text-blue-600 hover:text-blue-500 ml-1"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle new shipping address
  const handleNewShippingAddress = async (addressData: AddressFormType) => {
    try {
      console.log("Creating new shipping address:", addressData);
      const newAddress = await createAddress(addressData);
      console.log("New shipping address created:", newAddress);
      setSelectedShippingAddress(newAddress);
      setShowNewShippingForm(false);
      if (useShippingAsBilling) {
        setSelectedBillingAddress(newAddress);
      }
    } catch (error) {
      console.error("Failed to create shipping address:", error);
      setError("Failed to save shipping address. Please try again.");
    }
  };

  // Handle new billing address
  const handleNewBillingAddress = async (addressData: AddressFormType) => {
    try {
      console.log("Creating new billing address:", addressData);
      const newAddress = await createAddress(addressData);
      console.log("New billing address created:", newAddress);
      setSelectedBillingAddress(newAddress);
      setShowNewBillingForm(false);
    } catch (error) {
      console.error("Failed to create billing address:", error);
      setError("Failed to save billing address. Please try again.");
    }
  };

  // Convert UserAddress to API address format
  const convertAddressForAPI = (address: UserAddress) => ({
    first_name: address.first_name,
    last_name: address.last_name,
    company: address.company || undefined,
    address_line_1: address.address_line_1,
    address_line_2: address.address_line_2 || undefined,
    city: address.city,
    state: address.state,
    postal_code: address.postal_code,
    country: address.country,
    phone: address.phone || undefined,
  });

  // Handle order placement with proper API integration
  const handlePlaceOrder = async () => {
    if (!selectedShippingAddress || !cartData) {
      setError("Please select a shipping address.");
      return;
    }

    const finalBillingAddress = useShippingAsBilling
      ? selectedShippingAddress
      : selectedBillingAddress;
    if (!finalBillingAddress) {
      setError("Please select a billing address.");
      return;
    }

    setIsPlacingOrder(true);
    setError("");

    try {
      // Prepare order data in the correct format for the backend API
      const orderData: OrderCreateRequest = {
        shipping_address: convertAddressForAPI(selectedShippingAddress),
        billing_address: convertAddressForAPI(finalBillingAddress),
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
        use_shipping_as_billing: useShippingAsBilling,
      };

      console.log("🚀 Creating order with data:", orderData);

      // Call the backend API
      const response = await ordersService.createOrder(orderData);
      console.log("✅ Order creation response:", response);

      // Handle the response based on your backend API structure
      let orderId;
      if (response.data && response.data.id) {
        orderId = response.data.id;
      } else if (response.id) {
        orderId = response.id;
      } else {
        throw new Error("Invalid order response: missing order ID");
      }

      console.log("✅ Order created successfully with ID:", orderId);

      // Clear cart after successful order
      try {
        await clearCart();
        console.log("✅ Cart cleared successfully");
      } catch (cartError) {
        console.warn(
          "⚠️ Failed to clear cart, but order was created:",
          cartError
        );
      }

      // Redirect based on payment method
      if (paymentMethod === "cod") {
        // For COD, redirect to order confirmation
        router.push(`/orders/${orderId}/confirmation`);
      } else {
        // For online payments, redirect to payment page
        router.push(`/orders/${orderId}/payment`);
      }
    } catch (err: any) {
      console.error("❌ Failed to place order:", err);

      // Handle different types of errors
      let errorMessage = "Failed to place order. Please try again.";

      if (err.response) {
        // HTTP error response
        const status = err.response.status;
        const data = err.response.data;

        console.error("❌ HTTP Error:", { status, data });

        if (status === 400 && data.error) {
          errorMessage = data.error;
        } else if (status === 401) {
          errorMessage = "Please login to continue.";
        } else if (status === 422 && data.details) {
          errorMessage = `Validation error: ${data.details}`;
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
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

          {/* Step 1: Shipping Address */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Shipping Address
              </h2>

              {/* Existing Addresses */}
              {addresses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Choose from saved addresses
                  </h3>
                  <div className="space-y-3">
                    {addresses
                      .filter((addr) => addr.type === "shipping" || !addr.type)
                      .map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedShippingAddress?.id === address.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => {
                            setSelectedShippingAddress(address);
                            if (useShippingAsBilling) {
                              setSelectedBillingAddress(address);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {address.first_name} {address.last_name}
                              </p>
                              {address.company && (
                                <p className="text-sm text-gray-600">
                                  {address.company}
                                </p>
                              )}
                              <p className="text-sm text-gray-600">
                                {address.address_line_1}
                              </p>
                              {address.address_line_2 && (
                                <p className="text-sm text-gray-600">
                                  {address.address_line_2}
                                </p>
                              )}
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.state}{" "}
                                {address.postal_code}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.country}
                              </p>
                              {address.phone && (
                                <p className="text-sm text-gray-600">
                                  {address.phone}
                                </p>
                              )}
                            </div>
                            <div className="ml-4">
                              <input
                                type="radio"
                                checked={
                                  selectedShippingAddress?.id === address.id
                                }
                                onChange={() => {
                                  setSelectedShippingAddress(address);
                                  if (useShippingAsBilling) {
                                    setSelectedBillingAddress(address);
                                  }
                                }}
                                className="form-radio text-blue-600"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Add New Address Option */}
              <div className="mb-6">
                <button
                  onClick={() => setShowNewShippingForm(!showNewShippingForm)}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  {showNewShippingForm ? "Cancel" : "Add New Address"}
                </button>
              </div>

              {/* New Address Form */}
              {showNewShippingForm && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Add New Shipping Address
                  </h3>
                  <AddressForm
                    onSubmit={handleNewShippingAddress}
                    addressType="shipping"
                    isLoading={false}
                  />
                </div>
              )}

              {/* Use Same for Billing Checkbox */}
              <div className="mt-6 flex items-center">
                <input
                  id="use-shipping-as-billing"
                  type="checkbox"
                  checked={useShippingAsBilling}
                  onChange={(e) => {
                    setUseShippingAsBilling(e.target.checked);
                    if (e.target.checked && selectedShippingAddress) {
                      setSelectedBillingAddress(selectedShippingAddress);
                    }
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="use-shipping-as-billing"
                  className="ml-2 text-sm text-gray-900"
                >
                  Use this address for billing
                </label>
              </div>

              {/* Next Button */}
              <div className="mt-6">
                <button
                  onClick={() => setCurrentStep(useShippingAsBilling ? 3 : 2)}
                  disabled={!selectedShippingAddress}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to {useShippingAsBilling ? "Shipping" : "Billing"}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Billing Address (if different from shipping) */}
          {currentStep === 2 && !useShippingAsBilling && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Billing Address
              </h2>

              {/* Existing Billing Addresses */}
              {addresses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Choose from saved addresses
                  </h3>
                  <div className="space-y-3">
                    {addresses
                      .filter((addr) => addr.type === "billing" || !addr.type)
                      .map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedBillingAddress?.id === address.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedBillingAddress(address)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {address.first_name} {address.last_name}
                              </p>
                              {address.company && (
                                <p className="text-sm text-gray-600">
                                  {address.company}
                                </p>
                              )}
                              <p className="text-sm text-gray-600">
                                {address.address_line_1}
                              </p>
                              {address.address_line_2 && (
                                <p className="text-sm text-gray-600">
                                  {address.address_line_2}
                                </p>
                              )}
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.state}{" "}
                                {address.postal_code}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.country}
                              </p>
                            </div>
                            <input
                              type="radio"
                              checked={
                                selectedBillingAddress?.id === address.id
                              }
                              onChange={() =>
                                setSelectedBillingAddress(address)
                              }
                              className="form-radio text-blue-600"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Add New Billing Address */}
              <div className="mb-6">
                <button
                  onClick={() => setShowNewBillingForm(!showNewBillingForm)}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  {showNewBillingForm ? "Cancel" : "Add New Billing Address"}
                </button>
              </div>

              {showNewBillingForm && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Add New Billing Address
                  </h3>
                  <AddressForm
                    onSubmit={handleNewBillingAddress}
                    addressType="billing"
                    isLoading={false}
                  />
                </div>
              )}

              {/* Navigation */}
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 bg-gray-200 text-gray-900 py-3 px-4 rounded-md hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!selectedBillingAddress}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Shipping & Payment */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Shipping Method */}
              <ShippingMethod
                selectedMethod={shippingMethod}
                onMethodChange={setShippingMethod}
                onCostChange={setShippingCost}
              />

              {/* Payment Method */}
              <PaymentMethod
                selectedMethod={paymentMethod}
                onMethodChange={setPaymentMethod}
              />

              {/* Order Notes */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Order Notes (Optional)
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions for your order..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Navigation */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep(useShippingAsBilling ? 1 : 2)}
                  className="flex-1 bg-gray-200 text-gray-900 py-3 px-4 rounded-md hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review Order */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Review Your Order
              </h2>

              {/* Order Review */}
              <div className="border-b border-gray-200 pb-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Shipping Address
                    </h3>
                    {selectedShippingAddress && (
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium text-gray-900">
                          {selectedShippingAddress.first_name}{" "}
                          {selectedShippingAddress.last_name}
                        </p>
                        {selectedShippingAddress.company && (
                          <p>{selectedShippingAddress.company}</p>
                        )}
                        <p>{selectedShippingAddress.address_line_1}</p>
                        {selectedShippingAddress.address_line_2 && (
                          <p>{selectedShippingAddress.address_line_2}</p>
                        )}
                        <p>
                          {selectedShippingAddress.city},{" "}
                          {selectedShippingAddress.state}{" "}
                          {selectedShippingAddress.postal_code}
                        </p>
                        <p>{selectedShippingAddress.country}</p>
                        {selectedShippingAddress.phone && (
                          <p>Phone: {selectedShippingAddress.phone}</p>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Billing Address */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Billing Address
                    </h3>
                    {(useShippingAsBilling
                      ? selectedShippingAddress
                      : selectedBillingAddress) && (
                      <div className="text-sm text-gray-600 space-y-1">
                        {useShippingAsBilling && (
                          <p className="text-xs text-blue-600 mb-2">
                            Same as shipping address
                          </p>
                        )}
                        <p className="font-medium text-gray-900">
                          {
                            (useShippingAsBilling
                              ? selectedShippingAddress
                              : selectedBillingAddress
                            )?.first_name
                          }{" "}
                          {
                            (useShippingAsBilling
                              ? selectedShippingAddress
                              : selectedBillingAddress
                            )?.last_name
                          }
                        </p>
                        {(useShippingAsBilling
                          ? selectedShippingAddress
                          : selectedBillingAddress
                        )?.company && (
                          <p>
                            {
                              (useShippingAsBilling
                                ? selectedShippingAddress
                                : selectedBillingAddress
                              )?.company
                            }
                          </p>
                        )}
                        <p>
                          {
                            (useShippingAsBilling
                              ? selectedShippingAddress
                              : selectedBillingAddress
                            )?.address_line_1
                          }
                        </p>
                        {(useShippingAsBilling
                          ? selectedShippingAddress
                          : selectedBillingAddress
                        )?.address_line_2 && (
                          <p>
                            {
                              (useShippingAsBilling
                                ? selectedShippingAddress
                                : selectedBillingAddress
                              )?.address_line_2
                            }
                          </p>
                        )}
                        <p>
                          {
                            (useShippingAsBilling
                              ? selectedShippingAddress
                              : selectedBillingAddress
                            )?.city
                          }
                          ,{" "}
                          {
                            (useShippingAsBilling
                              ? selectedShippingAddress
                              : selectedBillingAddress
                            )?.state
                          }{" "}
                          {
                            (useShippingAsBilling
                              ? selectedShippingAddress
                              : selectedBillingAddress
                            )?.postal_code
                          }
                        </p>
                        <p>
                          {
                            (useShippingAsBilling
                              ? selectedShippingAddress
                              : selectedBillingAddress
                            )?.country
                          }
                        </p>
                        {(useShippingAsBilling
                          ? selectedShippingAddress
                          : selectedBillingAddress
                        )?.phone && (
                          <p>
                            Phone:{" "}
                            {
                              (useShippingAsBilling
                                ? selectedShippingAddress
                                : selectedBillingAddress
                              )?.phone
                            }
                          </p>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>

              {/* Shipping and Payment Summary */}
              <div className="border-b border-gray-200 pb-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Shipping Method
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {shippingMethod.replace("_", " ")}
                    </p>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                    >
                      Edit
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Payment Method
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </p>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              {notes && (
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Order Notes
                  </h3>
                  <p className="text-sm text-gray-600">{notes}</p>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                  >
                    Edit
                  </button>
                </div>
              )}

              {/* Place Order Button */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 bg-gray-200 text-gray-900 py-3 px-4 rounded-md hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlacingOrder ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="mt-10 lg:mt-0 lg:col-span-5">
          {/* ✅ FIXED: This is the only part that was changed - safe handling of items */}
          <OrderSummary
            cartData={cartData}
            shippingCost={shippingCost}
            couponCode={couponCode}
            onCouponChange={setCouponCode}
          />
        </div>
      </div>
    </div>
  );
}
