'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrderStore } from '@/store/order';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline';
import { OrderItems } from '@/components/orders/OrderItems';
import { OrderActions } from '@/components/orders/OrderActions';
import Link from 'next/link';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string);
  
  const { 
    currentOrder, 
    isLoading, 
    error, 
    fetchOrder, 
    cancelOrder, 
    clearError 
  } = useOrderStore();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId, fetchOrder]);

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return;
    
    setCancelling(true);
    try {
      await cancelOrder(orderId, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      // Refresh order data
      await fetchOrder(orderId);
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error loading order</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => {
              clearError();
              fetchOrder(orderId);
            }}
            className="text-sm underline mt-2"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
          <Link href="/profile" className="text-blue-600 hover:text-blue-500 mt-4 inline-block">
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(currentOrder.status.toLowerCase());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link 
              href="/profile" 
              className="text-blue-600 hover:text-blue-500 text-sm mb-2 inline-block"
            >
              ← Back to Orders
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{currentOrder.order_number}
            </h1>
            <p className="text-gray-600 mt-1">
              Placed on {formatDate(currentOrder.created_at)}
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentOrder.status)}`}>
              {currentOrder.status}
            </div>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getPaymentStatusColor(currentOrder.payment_status)}`}>
              Payment: {currentOrder.payment_status}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <OrderItems items={currentOrder.items} />

          {/* Order Timeline */}
          <OrderStatusTimeline 
            statusHistory={currentOrder.status_history} 
            currentStatus={currentOrder.status}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(currentOrder.subtotal_amount / 100)}</span>
              </div>
              
              {currentOrder.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(currentOrder.discount_amount / 100)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{formatCurrency(currentOrder.shipping_amount / 100)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>{formatCurrency(currentOrder.tax_amount / 100)}</span>
              </div>
              
              <div className="border-t pt-3 flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(currentOrder.total_amount / 100)}</span>
              </div>
            </div>

            {currentOrder.coupon_code && (
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-800">
                  <span className="font-medium">Coupon applied:</span> {currentOrder.coupon_code}
                </p>
              </div>
            )}
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
            
            <div className="text-sm space-y-2">
              <div>
                <p className="font-medium text-gray-900">
                  {currentOrder.shipping_address.first_name} {currentOrder.shipping_address.last_name}
                </p>
                {currentOrder.shipping_address.company && (
                  <p className="text-gray-600">{currentOrder.shipping_address.company}</p>
                )}
                <p className="text-gray-600">{currentOrder.shipping_address.address_line1}</p>
                {currentOrder.shipping_address.address_line2 && (
                  <p className="text-gray-600">{currentOrder.shipping_address.address_line2}</p>
                )}
                <p className="text-gray-600">
                  {currentOrder.shipping_address.city}, {currentOrder.shipping_address.state} {currentOrder.shipping_address.postal_code}
                </p>
                <p className="text-gray-600">{currentOrder.shipping_address.country}</p>
                {currentOrder.shipping_address.phone && (
                  <p className="text-gray-600">{currentOrder.shipping_address.phone}</p>
                )}
              </div>
            </div>

            {currentOrder.tracking_number && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Tracking Number:</span> {currentOrder.tracking_number}
                </p>
                {currentOrder.shipping_carrier && (
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Carrier:</span> {currentOrder.shipping_carrier}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Order Actions */}
          <OrderActions 
            order={currentOrder}
            onCancel={() => setShowCancelModal(true)}
            canCancel={canCancel}
          />
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Order</h3>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation *
              </label>
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please tell us why you're cancelling this order..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={cancelling}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim() || cancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
