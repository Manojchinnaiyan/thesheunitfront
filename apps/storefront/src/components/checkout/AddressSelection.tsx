'use client';

import { useState, useEffect } from 'react';
import { useAddressStore } from '@/store/address';
import { AddressForm } from './AddressForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Truck, CreditCard, Plus, Edit, MapPin, Check } from 'lucide-react';
import type { UserAddress, AddressForm as AddressFormType } from '@repo/types';

interface AddressSelectionProps {
  type: 'shipping' | 'billing';
  selectedAddress: UserAddress | null;
  onAddressSelect: (address: UserAddress) => void;
  title?: string;
}

export function AddressSelection({ 
  type, 
  selectedAddress, 
  onAddressSelect,
  title 
}: AddressSelectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const { 
    addresses, 
    isLoading, 
    error, 
    fetchAddresses,
    createAddress,
    updateAddress,
    getAddressesByType,
    getDefaultAddress,
    clearError
  } = useAddressStore();

  // Get addresses of the specific type
  const typeAddresses = getAddressesByType(type);
  const defaultAddress = getDefaultAddress(type);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Auto-select default address if none selected
  useEffect(() => {
    if (!selectedAddress && defaultAddress) {
      onAddressSelect(defaultAddress);
    }
  }, [defaultAddress, selectedAddress, onAddressSelect]);

  const handleAddAddress = async (addressData: AddressFormType) => {
    try {
      const newAddress = await createAddress({ ...addressData, type });
      onAddressSelect(newAddress);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create address:', error);
    }
  };

  const handleEditAddress = async (addressData: AddressFormType) => {
    if (!editingAddress) return;
    
    try {
      const updatedAddress = await updateAddress(editingAddress.id, addressData);
      
      // If this was the selected address, update selection
      if (selectedAddress?.id === editingAddress.id) {
        onAddressSelect(updatedAddress);
      }
      
      setEditingAddress(null);
      setShowEditDialog(false);
    } catch (error) {
      console.error('Failed to update address:', error);
    }
  };

  const startEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setShowEditDialog(true);
  };

  const AddressCard = ({ address }: { address: UserAddress }) => {
    const isSelected = selectedAddress?.id === address.id;
    
    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected 
            ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => onAddressSelect(address)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Selection indicator and badges */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  type === 'shipping' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {type === 'shipping' ? '📦 Shipping' : '💳 Billing'}
                </span>
                
                {address.is_default && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800">
                    ✓ Default
                  </span>
                )}
              </div>

              {/* Address details */}
              <div className="space-y-1 text-sm">
                <p className="font-medium text-gray-900">
                  {address.first_name} {address.last_name}
                </p>
                {address.company && <p className="text-gray-600">{address.company}</p>}
                <p className="text-gray-600">{address.address_line_1}</p>
                {address.address_line_2 && <p className="text-gray-600">{address.address_line_2}</p>}
                <p className="text-gray-600">
                  {address.city}, {address.state} {address.postal_code}
                </p>
                <p className="text-gray-600">{address.country}</p>
                {address.phone && <p className="text-gray-600">📞 {address.phone}</p>}
              </div>
            </div>

            {/* Edit button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                startEdit(address);
              }}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading && addresses.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          {type === 'shipping' ? <Truck className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
          {title || `Select ${type === 'shipping' ? 'Shipping' : 'Billing'} Address`}
        </h3>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{error}</p>
          <Button onClick={clearError} variant="ghost" size="sm" className="mt-1 text-red-600">
            Dismiss
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          {type === 'shipping' ? <Truck className="h-5 w-5 text-blue-600" /> : <CreditCard className="h-5 w-5 text-purple-600" />}
          {title || `${type === 'shipping' ? 'Shipping' : 'Billing'} Address`}
        </h3>
        
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="outline"
          size="sm"
          className={`${type === 'shipping' ? 'text-blue-600 border-blue-200' : 'text-purple-600 border-purple-200'}`}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add New
        </Button>
      </div>

      {/* Add new address form */}
      {showAddForm && (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New {type === 'shipping' ? 'Shipping' : 'Billing'} Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AddressForm
              onSubmit={handleAddAddress}
              onCancel={() => setShowAddForm(false)}
              submitLabel={`Save & Use This Address`}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      )}

      {/* Address selection */}
      {typeAddresses.length === 0 && !showAddForm ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No {type} addresses found
            </h4>
            <p className="text-gray-500 text-center mb-4">
              Add your first {type} address to continue with checkout.
            </p>
            <Button onClick={() => setShowAddForm(true)} className="mt-2">
              <Plus className="h-4 w-4 mr-2" />
              Add {type === 'shipping' ? 'Shipping' : 'Billing'} Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {typeAddresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      )}

      {/* Edit Address Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit {type === 'shipping' ? 'Shipping' : 'Billing'} Address
            </DialogTitle>
          </DialogHeader>
          
          {editingAddress && (
            <AddressForm
              initialData={editingAddress}
              onSubmit={handleEditAddress}
              onCancel={() => {
                setEditingAddress(null);
                setShowEditDialog(false);
              }}
              submitLabel="Update Address"
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
