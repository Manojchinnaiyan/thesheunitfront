'use client';

import { useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail('');
    }, 3000);
  };

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Stay Updated with Latest Deals
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get exclusive offers, new product alerts, and special discounts delivered to your inbox.
          </p>
          
          {isSubmitted ? (
            <div className="max-w-md mx-auto">
              <div className="bg-green-500 text-white p-4 rounded-xl flex items-center justify-center space-x-2">
                <span className="text-2xl">✅</span>
                <span className="font-semibold">Thank you for subscribing!</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-4 py-3 rounded-xl border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Subscribe
                </button>
              </div>
              <p className="text-blue-100 text-sm mt-3">
                No spam, unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
