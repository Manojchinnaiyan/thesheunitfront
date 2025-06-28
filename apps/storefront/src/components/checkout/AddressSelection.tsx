'use client';

import { useState, useEffect } from 'react';
import { useAddressStore } from '@/store/address';
import { AddressCard } from '@/components/profile/AddressCard';
import { AddressForm } from '@/components/checkout/AddressForm';
import type { UserAddress, AddressForm as AddressFormType } from '@repo/types';

interface AddressSelectionProps {
  selectedAddress: UserAddress | null;
  onAddressSelect: (address: UserAddress) => void;
  onNewAddress: (address: AddressFormType) => void;
  title: string;
}

export function AddressSelection({ 
  selectedAddress, 
  onAddressSelect, 
  onNewAddress, 
  title 
}: AddressSelectionProps) {
  const { addresses, isLoading, fetchAddresses, createAddress } = useAddressStore();
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Auto-select default address if none selected
  useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.is_default);
      if (defaultAddress) {
        onAddressSelect(defaultAddress);
      }
    }
  }, [addresses, selectedAddress, onAddressSelect]);

  const handleNewAddress = async (addressData: AddressFormType) => {
    try {
      const newAddress = await createAddress(addressData);
      onNewAddress(addressData);
      onAddressSelect(newAddress);
      setShowNewAddressForm(false);
    } catch (error) {
      console.error('Failed to create address:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        <button
          onClick={() => setShowNewAddressForm(!showNewAddressForm)}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          {showNewAddressForm ? 'Cancel' : '+ Add New Address'}
        </button>
      </div>

      {showNewAddressForm && (
        <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
          <h3 className="text-md font-medium text-gray-900 mb-4">Add New Address</h3>
          <AddressForm
            onSubmit={handleNewAddress}
            onCancel={() => setShowNewAddressForm(false)}
            submitLabel="Save & Use This Address"
            isLoading={isLoading}
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              selectable={true}
              selected={selectedAddress?.id === address.id}
              onSelect={onAddressSelect}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">📍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No saved addresses</h3>
          <p className="text-gray-600 mb-4">Add your first address to continue.</p>
          <button
            onClick={() => setShowNewAddressForm(true)}
            className="btn-primary"
          >
            Add Address
          </button>
        </div>
      )}
    </div>
  );
}
