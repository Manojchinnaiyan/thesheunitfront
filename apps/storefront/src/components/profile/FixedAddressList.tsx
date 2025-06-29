'use client';

import { useEffect, useState } from 'react';
import { useAddressStore } from '@/store/address';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, MapPin, Truck, CreditCard } from 'lucide-react';
import type { UserAddress } from '@repo/types';

export function FixedAddressList() {
  const { 
    addresses, 
    isLoading, 
    error, 
    lastNotification,
    fetchAddresses,
    deleteAddress,
    setDefaultAddress,
    clearError,
    clearNotification
  } = useAddressStore();

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Group addresses by type
  const shippingAddresses = addresses.filter(addr => addr.type === 'shipping');
  const billingAddresses = addresses.filter(addr => addr.type === 'billing');
  const defaultShipping = shippingAddresses.find(addr => addr.is_default);
  const defaultBilling = billingAddresses.find(addr => addr.is_default);

  if (isLoading && addresses.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm">{error}</p>
        <Button 
          onClick={clearError} 
          variant="outline" 
          size="sm" 
          className="mt-2"
        >
          Dismiss
        </Button>
      </div>
    );
  }

  const handleSetDefault = async (address: UserAddress, type: 'shipping' | 'billing') => {
    try {
      await setDefaultAddress(address.id, type);
    } catch (error) {
      console.error('Failed to set default address:', error);
    }
  };

  const handleDelete = async (addressId: number) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(addressId);
      } catch (error) {
        console.error('Failed to delete address:', error);
      }
    }
  };

  const AddressCard = ({ address, type }: { address: UserAddress; type: 'shipping' | 'billing' }) => {
    const isDefault = address.is_default && address.type === type;
    const canSetAsDefault = address.type === type && !isDefault;

    return (
      <Card key={`${address.id}-${type}`} className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {type === 'shipping' ? (
                <Truck className="h-5 w-5 text-blue-600" />
              ) : (
                <CreditCard className="h-5 w-5 text-green-600" />
              )}
              {address.first_name} {address.last_name}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className={type === 'shipping' ? 'border-blue-200 text-blue-700' : 'border-green-200 text-green-700'}>
                {type === 'shipping' ? 'Shipping' : 'Billing'}
              </Badge>
              {isDefault && (
                <Badge variant="default">Default</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm text-gray-600">
            {address.company && (
              <p className="font-medium">{address.company}</p>
            )}
            <p>{address.address_line_1}</p>
            {address.address_line_2 && <p>{address.address_line_2}</p>}
            <p>
              {address.city}, {address.state} {address.postal_code}
            </p>
            <p>{address.country}</p>
            {address.phone && <p>{address.phone}</p>}
          </div>

          <div className="flex items-center gap-2 mt-4">
            {canSetAsDefault && (
              <Button
                onClick={() => handleSetDefault(address, type)}
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={isLoading}
              >
                Set as Default {type === 'shipping' ? 'Shipping' : 'Billing'}
              </Button>
            )}
            
            <Button
              onClick={() => handleDelete(address.id)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {lastNotification && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">{lastNotification}</p>
          <Button 
            onClick={clearNotification} 
            variant="ghost" 
            size="sm" 
            className="mt-1 text-green-600"
          >
            ×
          </Button>
        </div>
      )}

      {/* Default Addresses Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Default Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {defaultShipping ? (
              <div className="text-sm text-gray-700">
                <p className="font-medium">{defaultShipping.first_name} {defaultShipping.last_name}</p>
                <p>{defaultShipping.address_line_1}</p>
                <p>{defaultShipping.city}, {defaultShipping.state} {defaultShipping.postal_code}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No default shipping address set</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Default Billing Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {defaultBilling ? (
              <div className="text-sm text-gray-700">
                <p className="font-medium">{defaultBilling.first_name} {defaultBilling.last_name}</p>
                <p>{defaultBilling.address_line_1}</p>
                <p>{defaultBilling.city}, {defaultBilling.state} {defaultBilling.postal_code}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No default billing address set</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Addresses */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">All Addresses</h3>
        
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
              <p className="text-gray-500 text-center">Add your first address to get started with checkout.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <AddressCard 
                key={address.id} 
                address={address} 
                type={address.type} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
