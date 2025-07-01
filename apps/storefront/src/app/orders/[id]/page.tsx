"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { ordersService, paymentService, type OrderDetails } from "@repo/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchOrderDetails();
  }, [isAuthenticated, params.id, router]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError("");
      const orderData = await ordersService.getOrder(parseInt(params.id));
      setOrder(orderData);
    } catch (err: any) {
      console.error("Failed to fetch order details:", err);
      setError(err.message || "Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!order || !user) return;

    try {
      setIsProcessingPayment(true);
      setError("");

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway");
      }

      // Initiate payment
      const paymentData = await paymentService.initiatePayment(order.id);
      
      const options = {
        key: paymentData.key_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "Your Store Name",
        description: `Payment for Order #${order.order_number || order.id}`,
        order_id: paymentData.razorpay_order_id,
        prefill: {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          contact: order.shipping_address?.phone || "",
        },
        theme: {
          color: "#3B82F6",
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: order.id,
            });

            // Refresh order details
            await fetchOrderDetails();
            
            alert("Payment successful!");
          } catch (err: any) {
            console.error("Payment verification failed:", err);
            setError("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      console.error("Payment initiation failed:", err);
      setError(err.message || "Failed to initiate payment");
      setIsProcessingPayment(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    const reason = prompt("Please provide a reason for cancellation:");
    if (!reason) return;

    try {
      await ordersService.cancelOrder(order.id);
      await fetchOrderDetails(); // Refresh order details
    } catch (err: any) {
      setError(err.message || "Failed to cancel order");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canPayOrder = () => {
    return order && 
           (order.payment_status === "pending" || order.payment_status === "failed") &&
           (order.status === "pending" || order.status === "payment_processing");
  };

  const canCancelOrder = () => {
    return order && 
           (order.status === "pending" || order.status === "confirmed") &&
           order.payment_status !== "paid";
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Details</h1>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p>Please sign in to view order details.</p>
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Details</h1>
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
          <Link
            href="/orders"
            className="inline-flex items-center mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Link
            href="/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/orders"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            ← Back to Orders
          </Link>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.order_number || order.id}
            </h1>
            <p className="text-gray-600 mt-1">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="text-right">
            <div className="flex gap-2 mb-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
              {order.payment_status && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                    order.payment_status
                  )}`}
                >
                  {order.payment_status}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(order.total_amount, order.currency || "INR")}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Payment Button */}
      {canPayOrder() && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-yellow-800">
                Payment Required
              </h3>
              <p className="text-yellow-700 mt-1">
                Complete your payment to process this order.
              </p>
            </div>
            <button
              onClick={handlePayment}
              disabled={isProcessingPayment}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessingPayment ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items && order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-start border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name || item.product?.name}</h3>
                    {item.variant_title && (
                      <p className="text-sm text-gray-600">{item.variant_title}</p>
                    )}
                    <p className="text-sm text-gray-500">SKU: {item.sku || item.product?.sku}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × {formatCurrency(item.price, order.currency || "INR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(item.total_price || item.total, order.currency || "INR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Addresses */}
          {(order.shipping_address || order.billing_address) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {order.shipping_address && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-900">
                      {order.shipping_address.first_name} {order.shipping_address.last_name}
                    </p>
                    {order.shipping_address.company && (
                      <p>{order.shipping_address.company}</p>
                    )}
                    <p>{order.shipping_address.address_line1 || order.shipping_address.address_line_1}</p>
                    {(order.shipping_address.address_line2 || order.shipping_address.address_line_2) && (
                      <p>{order.shipping_address.address_line2 || order.shipping_address.address_line_2}</p>
                    )}
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                    </p>
                    <p>{order.shipping_address.country}</p>
                    {order.shipping_address.phone && (
                      <p>Phone: {order.shipping_address.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {order.billing_address && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h2>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-900">
                      {order.billing_address.first_name} {order.billing_address.last_name}
                    </p>
                    {order.billing_address.company && (
                      <p>{order.billing_address.company}</p>
                    )}
                    <p>{order.billing_address.address_line1 || order.billing_address.address_line_1}</p>
                    {(order.billing_address.address_line2 || order.billing_address.address_line_2) && (
                      <p>{order.billing_address.address_line2 || order.billing_address.address_line_2}</p>
                    )}
                    <p>
                      {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}
                    </p>
                    <p>{order.billing_address.country}</p>
                    {order.billing_address.phone && (
                      <p>Phone: {order.billing_address.phone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Order Timeline */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h2>
              <div className="flow-root">
                <ul className="-mb-8">
                  {order.status_history.map((history: any, idx: number) => (
                    <li key={history.id}>
                      <div className="relative pb-8">
                        {idx !== order.status_history!.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span
                              className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getStatusColor(
                                history.status
                              )}`}
                            >
                              <span className="text-xs font-medium">
                                {history.status.charAt(0).toUpperCase()}
                              </span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {history.status}
                              </p>
                              {history.comment && (
                                <p className="text-sm text-gray-500">{history.comment}</p>
                              )}
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {formatDate(history.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  {formatCurrency(
                    order.total_amount - (order.shipping_cost || 0) - (order.tax_amount || 0) + (order.discount_amount || 0),
                    order.currency || "INR"
                  )}
                </span>
              </div>
              {order.shipping_cost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping ({order.shipping_method || 'Standard'})</span>
                  <span className="text-gray-900">
                    {formatCurrency(order.shipping_cost, order.currency || "INR")}
                  </span>
                </div>
              )}
              {order.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">
                    {formatCurrency(order.tax_amount, order.currency || "INR")}
                  </span>
                </div>
              )}
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">
                    -{formatCurrency(order.discount_amount, order.currency || "INR")}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-medium text-gray-900">Total</span>
                  <span className="text-base font-medium text-gray-900">
                    {formatCurrency(order.total_amount, order.currency || "INR")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Order ID:</span>
                <span className="ml-2 font-medium text-gray-900">{order.id}</span>
              </div>
              <div>
                <span className="text-gray-600">Payment Method:</span>
                <span className="ml-2 font-medium text-gray-900">{order.payment_method || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-600">Shipping Method:</span>
                <span className="ml-2 font-medium text-gray-900">{order.shipping_method || 'Standard'}</span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 text-gray-900">{formatDate(order.created_at)}</span>
              </div>
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <span className="ml-2 text-gray-900">{formatDate(order.updated_at)}</span>
              </div>
              {order.notes && (
                <div>
                  <span className="text-gray-600">Notes:</span>
                  <p className="mt-1 text-gray-900">{order.notes}</p>
                </div>
              )}
              {order.tracking_number && (
                <div>
                  <span className="text-gray-600">Tracking Number:</span>
                  <span className="ml-2 font-medium text-gray-900">{order.tracking_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          {order.payments && order.payments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Payment History</h2>
              <div className="space-y-3">
                {order.payments.map((payment: any) => (
                  <div key={payment.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount, order.currency || "INR")}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Method: {payment.payment_method}</p>
                      {payment.payment_provider_id && (
                        <p>Transaction ID: {payment.payment_provider_id}</p>
                      )}
                      <p>Date: {formatDate(payment.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              {canCancelOrder() && (
                <button
                  className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                  onClick={handleCancelOrder}
                >
                  Cancel Order
                </button>
              )}
              <a
                href={`/api/v1/orders/${order.id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Download Invoice
              </a>
              <Link
                href={`/orders/${order.id}/track`}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Track Order
              </Link>
              <Link
                href="/contact"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
