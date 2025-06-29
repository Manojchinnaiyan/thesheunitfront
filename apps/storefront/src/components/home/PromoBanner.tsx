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
              <p className="font-bold text-lg">Welcome to TheShe Unit!</p>
              <p className="text-sm opacity-90">Your modern e-commerce platform</p>
            </div>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center px-6 py-2 bg-white text-red-600 font-medium rounded-full hover:bg-gray-100 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}
