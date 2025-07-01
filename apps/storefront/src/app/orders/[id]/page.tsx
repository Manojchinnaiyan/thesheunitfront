"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useOrderStore } from "@/store/order";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderActions } from "@/components/orders/OrderActions";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const {
    currentOrder: order,
    isLoading,
    error,
    fetchOrderById,
    cancelOrder,
    clearError,
  } = useOrderStore();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderById(parseInt(orderId));
    }
  }, [orderId, fetchOrderById]);

  // ✅ FIXED: Better cancellation logic
  const canCancelOrder = () => {
    if (!order) return false;
    const cancellableStatuses = ['pending', 'confirmed', 'processing', 'payment_processing'];
    return cancellableStatuses.includes(order.status.toLowerCase());
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }

    // ✅ FIXED: Check if order can be cancelled before attempting
    if (!canCancelOrder()) {
      alert(`Cannot cancel order with status: ${order?.status}`);
      return;
    }

    setIsCancelling(true);
    try {
      await cancelOrder(order!.id, cancelReason);
      setShowCancelModal(false);
      setCancelReason("");
      // Refresh order data
      await fetchOrderById(order!.id);
    } catch (error: any) {
      console.error("Failed to cancel order:", error);
      alert(`Failed to cancel order: ${error.message || 'Unknown error'}`);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 bg-gray-200 rounded"></div>
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.order_number}
            </h1>
            <p className="text-gray-600">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0">
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 rounded-md flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.product?.name || item.name || 'Product'}
                      </h3>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                      {item.variant_title && (
                        <p className="text-sm text-gray-500">{item.variant_title}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency((item.total_amount || item.total_price) / 100)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency((item.unit_price || item.price) / 100)} each
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No items found for this order.</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
              <div className="text-gray-600">
                <p>{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                {order.shipping_address.company && (
                  <p>{order.shipping_address.company}</p>
                )}
                <p>{order.shipping_address.address_line_1}</p>
                {order.shipping_address.address_line_2 && (
                  <p>{order.shipping_address.address_line_2}</p>
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

          {/* Payment Information */}
          {order.payments && order.payments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
              <div className="space-y-4">
                {order.payments.map((payment) => (
                  <div key={payment.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {payment.payment_method.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed' || payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                        payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Amount: {formatCurrency(payment.amount / 100)}</p>
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal_amount / 100)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(order.shipping_amount / 100)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(order.tax_amount / 100)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount_amount / 100)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount / 100)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <OrderActions
            order={order}
            onCancel={() => setShowCancelModal(true)}
            canCancel={canCancelOrder()}
          />
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Order</h3>
            
            {/* Show current status warning */}
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Current Status:</strong> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </p>
              {!canCancelOrder() && (
                <p className="text-sm text-red-600 mt-1">
                  This order cannot be cancelled in its current status.
                </p>
              )}
            </div>

            {canCancelOrder() ? (
              <>
                <p className="text-gray-600 mb-4">
                  Please provide a reason for canceling this order:
                </p>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Reason for cancellation..."
                />
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Keep Order
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={!cancelReason.trim() || isCancelling}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {isCancelling ? "Canceling..." : "Cancel Order"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  This order cannot be cancelled because it's already in "{order.status}" status.
                </p>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
