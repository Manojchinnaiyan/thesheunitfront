'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export function DealsSection() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-8 bg-gradient-to-r from-red-500 to-pink-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="text-3xl animate-pulse">⚡</div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold">Flash Sale - Up to 60% Off!</h3>
              <p className="text-sm opacity-90">Limited time offer on selected items</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
              <div className="text-xs uppercase">Hours</div>
            </div>
            <div className="text-2xl">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
              <div className="text-xs uppercase">Minutes</div>
            </div>
            <div className="text-2xl">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
              <div className="text-xs uppercase">Seconds</div>
            </div>
            
            <Link
              href="/products?sale=true"
              className="ml-6 px-6 py-3 bg-white text-red-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
