'use client';

import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface OrderItem {
  id: number;
  product_id: number;
  sku: string;
  name: string;
  variant_title?: string;
  quantity: number;
  price: number;
  total_price: number;
}

interface OrderItemsProps {
  items: OrderItem[];
}

export function OrderItems({ items }: OrderItemsProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="p-6 flex items-center space-x-4">
            {/* Product Image Placeholder */}
            <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    <Link 
                      href={`/products/${item.product_id}`}
                      className="hover:text-blue-600"
                    >
                      {item.name}
                    </Link>
                  </h4>
                  
                  {item.variant_title && (
                    <p className="text-sm text-gray-500 mt-1">
                      Variant: {item.variant_title}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-500 mt-1">
                    SKU: {item.sku}
                  </p>
                  
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <span>Qty: {item.quantity}</span>
                    <span className="mx-2">×</span>
                    <span>{formatCurrency(item.price / 100)}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.total_price / 100)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
