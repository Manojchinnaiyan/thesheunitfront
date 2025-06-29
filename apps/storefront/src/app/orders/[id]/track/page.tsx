'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useOrderStore } from '@/store/order';
import { formatDate, formatDateTime } from '@/lib/utils';
import { OrderTrackingTimeline } from '@/components/orders/OrderTrackingTimeline';
import Link from 'next/link';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = parseInt(params.id as string);
  
  const { 
    currentOrder, 
    isLoading, 
    error, 
    fetchOrder, 
    clearError 
  } = useOrderStore();

  const [trackingData, setTrackingData] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId, fetchOrder]);

  useEffect(() => {
    if (currentOrder?.tracking_number) {
      fetchTrackingData();
    }
  }, [currentOrder]);

  const fetchTrackingData = async () => {
    if (!currentOrder?.tracking_number) return;
    
    setLoadingTracking(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${orderId}/track`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTrackingData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tracking data:', error);
    } finally {
      setLoadingTracking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '⏳';
      case 'confirmed':
        return '✅';
      case 'processing':
        return '🔄';
      case 'shipped':
        return '🚚';
      case 'out_for_delivery':
        return '🚛';
      case 'delivered':
        return '📦';
      case 'cancelled':
        return '❌';
      default:
        return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'confirmed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'processing':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'shipped':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'out_for_delivery':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error loading order</p>
          <p className="text-sm">{error || 'Order not found'}</p>
          <Link href="/profile" className="text-sm underline mt-2 inline-block">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href={`/orders/${orderId}`}
          className="text-blue-600 hover:text-blue-500 text-sm mb-2 inline-block"
        >
          ← Back to Order Details
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Track Order #{currentOrder.order_number}
        </h1>
        <p className="text-gray-600 mt-1">
          Placed on {formatDate(currentOrder.created_at)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Tracking Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Current Status</h2>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentOrder.status)}`}>
                <span className="mr-2">{getStatusIcon(currentOrder.status)}</span>
                {currentOrder.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            {currentOrder.tracking_number ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Tracking Number</p>
                      <p className="text-lg font-mono text-blue-800">{currentOrder.tracking_number}</p>
                    </div>
                    {currentOrder.shipping_carrier && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-900">Carrier</p>
                        <p className="text-blue-800">{currentOrder.shipping_carrier}</p>
                      </div>
                    )}
                  </div>
                </div>

                {currentOrder.shipped_at && (
                  <div className="text-sm text-gray-600">
                    <p><strong>Shipped:</strong> {formatDateTime(currentOrder.shipped_at)}</p>
                  </div>
                )}

                {currentOrder.delivered_at && (
                  <div className="text-sm text-green-600">
                    <p><strong>Delivered:</strong> {formatDateTime(currentOrder.delivered_at)}</p>
                  </div>
                )}

                {/* Estimated Delivery */}
                {!currentOrder.delivered_at && currentOrder.status === 'shipped' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-900">Estimated Delivery</p>
                    <p className="text-green-800">
                      {new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">{getStatusIcon(currentOrder.status)}</div>
                <p className="text-gray-600">
                  {currentOrder.status === 'pending' && "Your order is being processed. We'll update you once it ships!"}
                  {currentOrder.status === 'confirmed' && "Your order has been confirmed and is being prepared for shipment."}
                  {currentOrder.status === 'processing' && "Your order is currently being processed in our fulfillment center."}
                  {currentOrder.status === 'cancelled' && "This order has been cancelled."}
                </p>
              </div>
            )}
          </div>

          {/* Order Timeline */}
          <OrderTrackingTimeline 
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
                <span className="text-gray-600">Order #</span>
                <span className="font-medium">{currentOrder.order_number}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Items</span>
                <span>{currentOrder.items.length} item{currentOrder.items.length !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-medium">${(currentOrder.total_amount / 100).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Payment</span>
                <span className={`capitalize ${
                  currentOrder.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {currentOrder.payment_status}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <Link
                href={`/orders/${orderId}`}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                View Full Order Details
              </Link>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping To</h3>
            
            <div className="text-sm space-y-1">
              <p className="font-medium">
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
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
            
            <div className="space-y-3">
              <Link
                href={`/support?order=${currentOrder.order_number}`}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact Support
              </Link>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Questions about your order?<br />
                  We're here to help!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
