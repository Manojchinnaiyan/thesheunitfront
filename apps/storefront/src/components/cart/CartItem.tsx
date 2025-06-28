'use client';

import { useState } from 'react';
import { formatPrice } from '@repo/utils';
import { useCartStore } from '@/store/cart';
import type { BackendCartItem } from '@repo/types';

interface CartItemProps {
  item: BackendCartItem;
}

export function CartItem({ item }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { updateItem, removeItem } = useCartStore();

  console.log('CartItem received item:', item);

  // Extract values from your backend structure
  const productId = item.product_id;
  const quantity = item.quantity;
  const price = item.price;
  const product = item.product;
  const productName = product?.name || 'Unknown Product';
  const productSku = product?.sku || 'N/A';
  const maxQuantity = product?.quantity || 99;
  
  // Calculate total for this item
  const itemTotal = price * quantity;

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      console.log('Updating quantity by product_id:', { productId, newQuantity });
      await updateItem(productId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      console.log('Removing item by product_id:', productId);
      await removeItem(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Failed to remove item');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex items-center py-6 border-b border-gray-200">
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
        <span className="text-gray-400 text-xs">No Image</span>
      </div>

      {/* Product Details */}
      <div className="ml-4 flex-1">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {productName}
            </h3>
            <p className="text-sm text-gray-500">SKU: {productSku}</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {formatPrice(price)} each
            </p>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            {/* Quantity Controls */}
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isUpdating}
                className="px-2 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                -
              </button>
              <span className="px-3 py-1 border-l border-r border-gray-300 text-sm">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={isUpdating || quantity >= maxQuantity}
                className="px-2 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                +
              </button>
            </div>

            {/* Item Total */}
            <p className="text-sm font-semibold text-gray-900">
              Total: {formatPrice(itemTotal)}
            </p>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="text-sm text-red-600 hover:text-red-500 disabled:opacity-50"
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>

        {/* Stock Warning */}
        {quantity >= maxQuantity && (
          <p className="text-xs text-orange-600 mt-1">
            Maximum available quantity: {maxQuantity}
          </p>
        )}
      </div>
    </div>
  );
}
