'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart';

export function CartDebug() {
  const { cart, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (!cart) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
      <h3 className="font-bold text-yellow-800">Cart Debug Info:</h3>
      <pre className="text-xs mt-2 overflow-auto">
        {JSON.stringify(cart, null, 2)}
      </pre>
    </div>
  );
}
