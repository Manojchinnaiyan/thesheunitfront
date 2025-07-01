// apps/storefront/src/app/orders/[id]/confirmation/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ordersService, paymentService } from "@repo/api";
import type { Order } from "@repo/types";

export default function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = parseInt(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Get payment result from URL parameters
  const paymentStatus = searchParams.get("payment");
  const razorpayPaymentId = searchParams.get("razorpay_payment_id");
  const razorpayOrderId = searchParams.get("razorpay_order_id");
  const razorpaySignature = searchParams.get("razorpay_signature");

  useEffect(() => {
    fetchOrder();

    // If payment success parameters are present, verify payment
    if (
      paymentStatus === "success" &&
      razorpayPaymentId &&
      razorpayOrderId &&
      razorpaySignature
    ) {
      verifyPayment();
    }
  }, [orderId, paymentStatus]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const orderData = await ordersService.getOrder(orderId);
      setOrder(orderData);
    } catch (err: any) {
      console.error("Failed to fetch order:", err);
      setError("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async () => {
    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) return;

    try {
      setIsProcessingPayment(true);

      await paymentService.verifyPayment({
        order_id: orderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      });

      // Refresh order data to get updated status
      await fetchOrder();

      // Clean up URL parameters after successful verification
      router.replace(`/orders/${orderId}/confirmation`);
    } catch (err: any) {
      console.error("Payment verification failed:", err);
      setError("Payment verification failed. Please contact support.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const initiatePayment = async () => {
    if (!order) return;

    try {
      setIsProcessingPayment(true);

      // Get payment details from backend using existing service
      const paymentData = await paymentService.initiatePayment(order.id);

      // Initialize Razorpay
      const razorpay = new (window as any).Razorpay({
        key: paymentData.key_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        order_id: paymentData.razorpay_order_id,
        name: "Your Store",
        description: `Order #${order.order_number}`,
        handler: function (response: any) {
          // Redirect to verification using existing pattern
          const params = new URLSearchParams({
            payment: "success",
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });

          router.push(`/orders/${orderId}/confirmation?${params.toString()}`);
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          },
        },
        theme: {
          color: "#3B82F6",
        },
      });

      razorpay.open();
    } catch (err: any) {
      console.error("Failed to initiate payment:", err);
      setError("Failed to initiate payment. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  // Show not found state
  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Order Not Found
          </h1>
          <Link href="/orders" className="text-blue-600 hover:text-blue-500">
            View all orders
          </Link>
        </div>
      </div>
    );
  }

  const canPayNow =
    order.payment_status === "pending" || order.payment_status === "failed";
  const isPaymentSuccess = order.payment_status === "paid";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Status Header */}
      <div className="text-center mb-8">
        {isProcessingPayment ? (
          <div className="text-yellow-600">
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="text-3xl font-bold mb-2">Processing Payment...</h1>
            <p className="text-gray-600">
              Please wait while we verify your payment.
            </p>
          </div>
        ) : isPaymentSuccess ? (
          <div className="text-green-600">
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-600">
              Your order has been confirmed and will be processed soon.
            </p>
          </div>
        ) : (
          <div className="text-yellow-600">
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
            <p className="text-gray-600">
              Your order is reserved. Complete payment to confirm.
            </p>
          </div>
        )}
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Order Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="font-semibold">{order.order_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="font-semibold text-lg">
              ₹{(order.total_amount / 100).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Order Status</p>
            <p className="font-semibold capitalize">
              {order.status.replace("_", " ")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Payment Status</p>
            <p
              className={`font-semibold capitalize ${
                order.payment_status === "paid"
                  ? "text-green-600"
                  : order.payment_status === "failed"
                    ? "text-red-600"
                    : "text-yellow-600"
              }`}
            >
              {order.payment_status.replace("_", " ")}
            </p>
          </div>
        </div>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ₹{(item.total / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Button */}
      {canPayNow && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {order.payment_status === "failed"
              ? "Retry Payment"
              : "Complete Payment"}
          </h3>
          {order.payment_status === "failed" && (
            <p className="text-red-600 mb-4">
              Your previous payment attempt failed. Please try again.
            </p>
          )}
          <button
            onClick={initiatePayment}
            disabled={isProcessingPayment}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessingPayment
              ? "Processing..."
              : `Pay ₹${(order.total_amount / 100).toFixed(2)}`}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/orders"
          className="flex-1 bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 text-center"
        >
          View All Orders
        </Link>
        <Link
          href="/products"
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 text-center"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
