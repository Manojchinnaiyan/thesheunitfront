'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart';

export function Notification() {
  const { lastNotification, clearNotification } = useCartStore();

  useEffect(() => {
    if (lastNotification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastNotification, clearNotification]);

  if (!lastNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {lastNotification}
        <button
          onClick={clearNotification}
          className="ml-4 text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  );
}
