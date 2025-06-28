'use client';

import { useState } from 'react';

interface PaymentMethodProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

export function PaymentMethod({ selectedMethod, onMethodChange }: PaymentMethodProps) {
  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'Pay securely with cards, UPI, wallets & more',
      icon: '💳'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: '💰'
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
      
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => onMethodChange(method.id)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="payment-method"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={(e) => onMethodChange(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{method.icon}</span>
                  <label className="block text-sm font-medium text-gray-900 cursor-pointer">
                    {method.name}
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-1">{method.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
