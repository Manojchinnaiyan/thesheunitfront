'use client';

import Link from 'next/link';
import { formatPrice } from '@repo/utils';
import type { BackendCartData } from '@repo/types';

interface CartSummaryProps {
  cartData: BackendCartData;
}

export function CartSummary({ cartData }: CartSummaryProps) {
  console.log('CartSummary received cartData:', cartData);
  
  const totals = cartData.totals;
  const subtotal = totals.sub_total;
  const itemCount = totals.item_count;
  const shipping = totals.shipping_cost;
  const tax = totals.tax_amount;
  const total = totals.total_amount;

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Subtotal ({itemCount} items)</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>{shipping > 0 ? formatPrice(shipping) : 'Free'}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between text-base font-medium">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/checkout"
          className="w-full btn-primary py-3 text-center block"
        >
          Proceed to Checkout
        </Link>
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/products"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
