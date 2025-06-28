'use client';

import Link from 'next/link';

export function PromoBanner() {
  return (
    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-2xl animate-pulse">🔥</span>
            <div>
              <p className="font-bold text-lg">Summer Sale - Up to 50% Off!</p>
              <p className="text-sm opacity-90">Free shipping on orders over $50</p>
            </div>
          </div>
          <Link
            href="/products?is_featured=true"
            className="hidden sm:inline-flex items-center px-6 py-2 bg-white text-red-600 font-medium rounded-full hover:bg-gray-100 transition-colors"
          >
            Shop Sale
          </Link>
        </div>
      </div>
    </div>
  );
}
