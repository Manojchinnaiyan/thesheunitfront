'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';

export default function CartPage() {
  const { isAuthenticated } = useAuthStore();
  const { cartData, isLoading, fetchCart, clearCart, error } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Shopping Cart</h1>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p>Please sign in to view your cart.</p>
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 ml-1">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const itemCount = cartData?.totals?.item_count || 0;
  const hasItems = cartData && cartData.items && cartData.items.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Shopping Cart {cartData && `(${itemCount} ${itemCount === 1 ? 'item' : 'items'})`}
        </h1>
        {hasItems && (
          <button
            onClick={async () => {
              if (window.confirm('Are you sure you want to clear your cart?')) {
                await clearCart();
              }
            }}
            className="text-sm text-red-600 hover:text-red-500"
          >
            Clear Cart
          </button>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="animate-pulse">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center py-6 border-b">
                <div className="w-20 h-20 bg-gray-200 rounded"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty cart */}
      {!isLoading && !hasItems && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h6a2 2 0 002-2v-.5"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <Link href="/products" className="btn-primary">
              Shop Now
            </Link>
          </div>
        </div>
      )}

      {/* Cart with items */}
      {!isLoading && hasItems && (
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Cart Items */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4">
                {cartData.items.map((item) => (
                  <CartItem key={item.product_id} item={item} />
                ))}
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <CartSummary cartData={cartData} />
          </div>
        </div>
      )}
    </div>
  );
}
