'use client';

import { formatPrice } from '@repo/utils';

interface ShippingMethodProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  onCostChange: (cost: number) => void;
}

export function ShippingMethod({ selectedMethod, onMethodChange, onCostChange }: ShippingMethodProps) {
  const shippingMethods = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: '5-7 business days',
      cost: 0,
      icon: '📦'
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: '2-3 business days',
      cost: 15000, // ₹150 in paise
      icon: '⚡'
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Next business day',
      cost: 30000, // ₹300 in paise
      icon: '🚀'
    },
  ];

  const handleMethodChange = (methodId: string) => {
    onMethodChange(methodId);
    const method = shippingMethods.find(m => m.id === methodId);
    if (method) {
      onCostChange(method.cost);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Shipping Method</h3>
      
      <div className="space-y-3">
        {shippingMethods.map((method) => (
          <div
            key={method.id}
            className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => handleMethodChange(method.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <input
                  type="radio"
                  name="shipping-method"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => handleMethodChange(e.target.value)}
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
              <div className="text-sm font-medium text-gray-900">
                {method.cost > 0 ? formatPrice(method.cost) : 'Free'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
