"use client";

import { useState, useEffect } from "react";
import { useAddressStore } from "@/store/address";
import { AddressCard } from "@/components/profile/AddressCard";
import { AddressForm } from "@/components/checkout/AddressForm";
import type { UserAddress, AddressForm as AddressFormType } from "@repo/types";

interface AddressSelectionProps {
  selectedAddress: UserAddress | null;
  onAddressSelect: (address: UserAddress) => void;
  onNewAddress: (address: AddressFormType) => void;
  title: string;
  addressType?: "shipping" | "billing"; // Add this prop
}

export function AddressSelection({
  selectedAddress,
  onAddressSelect,
  onNewAddress,
  title,
  addressType = "shipping", // Default to shipping
}: AddressSelectionProps) {
  const { addresses, isLoading, fetchAddresses, createAddress } =
    useAddressStore();
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Auto-select default address if none selected
  useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.is_default);
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
      console.error("Failed to create address:", error);
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
          {showNewAddressForm ? "Cancel" : "+ Add New Address"}
        </button>
      </div>

      {showNewAddressForm && (
        <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
          <h3 className="text-md font-medium text-gray-900 mb-4">
            Add New Address
          </h3>
          <AddressForm
            onSubmit={handleNewAddress}
            onCancel={() => setShowNewAddressForm(false)}
            submitLabel="Save & Use This Address"
            isLoading={isLoading}
            addressType={addressType} // Pass the address type
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSelected={selectedAddress?.id === address.id}
              onClick={() => onAddressSelect(address)}
              showActions={false}
            />
          ))}

          {addresses.length === 0 && !showNewAddressForm && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">No addresses found</p>
              <button
                onClick={() => setShowNewAddressForm(true)}
                className="btn-primary"
              >
                Add Your First Address
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
