// apps/storefront/src/app/orders/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ordersService, paymentService } from "@repo/api";
import { useAuthStore } from "@/store/auth";
import type { Order, PaginatedResponse } from "@repo/types";

export default function OrdersPage() {
  console.log("OOOOOOOOOOOOOOOOOO");
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingOrderId, setPayingOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("LLLLLLLLL");
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      // Using your existing API pattern
      const response: PaginatedResponse<Order> =
        await ordersService.getOrders();
      setOrders(response.data || []);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const canRetryPayment = (order: Order) => {
    // Allow retry for confirmed orders with failed payments OR pending orders
    return (
      (order.status === "confirmed" && order.payment_status === "failed") ||
      (order.status === "pending" && order.payment_status === "pending")
    );
  };

  const initiatePayment = async (orderId: number) => {
    try {
      setPayingOrderId(orderId);

      // Using your existing payment service
      const paymentData = await paymentService.initiatePayment(orderId);

      // Initialize Razorpay
      const razorpay = new (window as any).Razorpay({
        key: paymentData.key_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        order_id: paymentData.razorpay_order_id,
        name: "Your Store",
        description: `Order #${orders.find((o) => o.id === orderId)?.order_number}`,
        handler: function (response: any) {
          // Redirect to confirmation page with payment details
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
            setPayingOrderId(null);
          },
        },
        theme: {
          color: "#3B82F6",
        },
      });

      razorpay.open();
    } catch (err: any) {
      console.error("Failed to initiate payment:", err);
      alert(err.message || "Failed to initiate payment. Please try again.");
      setPayingOrderId(null);
    }
  };

  const getStatusBadge = (order: Order) => {
    if (order.payment_status === "paid" && order.status === "confirmed") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium text-green-600 bg-green-50">
          Confirmed
        </span>
      );
    }
    if (order.payment_status === "failed") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium text-red-600 bg-red-50">
          Payment Failed
        </span>
      );
    }
    if (order.payment_status === "pending") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-50">
          Payment Pending
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-50">
        {order.status}
      </span>
    );
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">My Orders</h1>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p>Please sign in to view your orders.</p>
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button onClick={fetchOrders} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <button onClick={fetchOrders} className="btn-outline">
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No orders yet
          </h2>
          <p className="text-gray-600 mb-6">
            Start shopping to see your orders here!
          </p>
          <Link href="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {getStatusBadge(order)}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Order #{order.order_number}
                  </h3>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-600">
                    <span>
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="font-semibold text-gray-900">
                      ₹{(order.total_amount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-4 lg:mt-0 lg:ml-4">
                  {/* View Order Button */}
                  <Link
                    href={`/orders/${order.id}/confirmation`}
                    className="btn-outline flex items-center justify-center px-4 py-2"
                  >
                    View Details
                  </Link>

                  {/* Payment/Retry Button */}
                  {canRetryPayment(order) && (
                    <button
                      onClick={() => initiatePayment(order.id)}
                      disabled={payingOrderId === order.id}
                      className="btn-primary flex items-center justify-center px-4 py-2"
                    >
                      {payingOrderId === order.id
                        ? "Processing..."
                        : order.payment_status === "failed"
                          ? "Retry Payment"
                          : "Pay Now"}
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Status Messages */}
              {order.payment_status === "failed" && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">
                    Payment failed for this order. Click "Retry Payment" to try
                    again.
                  </p>
                </div>
              )}

              {order.payment_status === "pending" &&
                order.status === "pending" && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-600">
                      Complete your payment to confirm this order.
                    </p>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
