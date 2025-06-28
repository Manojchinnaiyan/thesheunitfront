'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@repo/utils';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import type { Product } from '@repo/api';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addItem(product.id);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="aspect-w-1 aspect-h-1 w-full">
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">No Image</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            <Link href={`/products/${product.id}`} className="hover:text-blue-600">
              {product.name}
            </Link>
          </h3>
          {product.is_featured && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>

        {product.short_description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.short_description}
          </p>
        )}

        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            SKU: {product.sku}
          </div>
        </div>

        {/* Stock Status */}
        <div className="mb-3">
          {product.quantity > 0 ? (
            <span className="text-green-600 text-sm">
              In Stock ({product.quantity} available)
            </span>
          ) : (
            <span className="text-red-600 text-sm">Out of Stock</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link
            href={`/products/${product.id}`}
            className="flex-1 btn-outline py-2 text-center"
          >
            View Details
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={product.quantity === 0 || isAddingToCart}
            className="flex-1 btn-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
