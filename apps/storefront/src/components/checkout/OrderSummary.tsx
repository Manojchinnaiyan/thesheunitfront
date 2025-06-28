'use client';

import { formatPrice } from '@repo/utils';
import type { BackendCartData } from '@repo/types';

interface OrderSummaryProps {
  cartData: BackendCartData;
  shippingCost?: number;
}

export function OrderSummary({ cartData, shippingCost = 0 }: OrderSummaryProps) {
  const subtotal = cartData.totals.sub_total;
  const tax = cartData.totals.tax_amount;
  const total = subtotal + shippingCost + tax;

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
      
      {/* Items */}
      <div className="space-y-3 mb-4">
        {cartData.items.map((item) => (
          <div key={item.product_id} className="flex justify-between text-sm">
            <div className="flex-1">
              <p className="text-gray-900">{item.product.name}</p>
              <p className="text-gray-500">Qty: {item.quantity}</p>
            </div>
            <p className="text-gray-900 font-medium">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>{shippingCost > 0 ? formatPrice(shippingCost) : 'Free'}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        
        <div className="border-t pt-2">
          <div className="flex justify-between text-base font-medium">
            <span>Total</span>
            <span className="text-lg">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
