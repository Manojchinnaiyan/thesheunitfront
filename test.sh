# Complete fix for the Set Default Address issue

echo "🔧 Fixing Set Default Address functionality..."

# Step 1: Update types to include the missing 'type' field
cat > packages/types/address_update.ts << 'EOF'
// Add this to your existing packages/types/index.ts file

export interface UserAddress extends AddressForm {
  id: number;
  user_id: number;
  type: 'shipping' | 'billing';  // ✅ ADD THIS LINE!
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
EOF

# Step 2: Fix the API service to send type parameter
cat > packages/api/address_complete_fix.ts << 'EOF'
import { apiClient } from './client';
import { API_ENDPOINTS } from '@repo/config';
import type { UserAddress, AddressForm, ApiResponse } from '@repo/types';

export class AddressService {
  async getAddresses(): Promise<UserAddress[]> {
    try {
      const response = await apiClient.get<ApiResponse<UserAddress[]>>(API_ENDPOINTS.USER_ADDRESSES);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      throw error;
    }
  }

  async createAddress(addressData: AddressForm): Promise<UserAddress> {
    try {
      const response = await apiClient.post<ApiResponse<UserAddress>>(API_ENDPOINTS.USER_ADDRESSES, addressData);
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid address creation response');
    } catch (error) {
      console.error('Failed to create address:', error);
      throw error;
    }
  }

  async updateAddress(id: number, addressData: AddressForm): Promise<UserAddress> {
    try {
      const response = await apiClient.put<ApiResponse<UserAddress>>(`${API_ENDPOINTS.USER_ADDRESSES}/${id}`, addressData);
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid address update response');
    } catch (error) {
      console.error('Failed to update address:', error);
      throw error;
    }
  }

  async deleteAddress(id: number): Promise<void> {
    try {
      await apiClient.delete(`${API_ENDPOINTS.USER_ADDRESSES}/${id}`);
    } catch (error) {
      console.error('Failed to delete address:', error);
      throw error;
    }
  }

  // ✅ FIXED: Now properly sends the type parameter
  async setDefaultAddress(id: number, type: 'shipping' | 'billing' = 'shipping'): Promise<UserAddress> {
    try {
      console.log('Setting default address:', { id, type }); // Debug log
      
      const response = await apiClient.put<ApiResponse<UserAddress>>(
        `${API_ENDPOINTS.USER_ADDRESSES}/${id}/default`,
        { type } // ✅ Send the type in JSON body
      );
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid set default address response');
    } catch (error) {
      console.error('Failed to set default address:', error);
      throw error;
    }
  }
}

export const addressService = new AddressService();
EOF

# Step 3: Fix the address store
cat > apps/storefront/src/store/address_complete_fix.ts << 'EOF'
import { create } from 'zustand';
import { addressService } from '@repo/api';
import type { UserAddress, AddressForm } from '@repo/types';

interface AddressState {
  addresses: UserAddress[];
  isLoading: boolean;
  error: string | null;
  lastNotification: string | null;
}

interface AddressActions {
  fetchAddresses: () => Promise<void>;
  createAddress: (addressData: AddressForm) => Promise<UserAddress>;
  updateAddress: (id: number, addressData: AddressForm) => Promise<UserAddress>;
  deleteAddress: (id: number) => Promise<void>;
  setDefaultAddress: (id: number, type?: 'shipping' | 'billing') => Promise<void>; // ✅ FIXED signature
  clearError: () => void;
  clearNotification: () => void;
}

export const useAddressStore = create<AddressState & AddressActions>((set, get) => ({
  addresses: [],
  isLoading: false,
  error: null,
  lastNotification: null,

  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const addresses = await addressService.getAddresses();
      console.log('Fetched addresses:', addresses);
      set({ addresses, error: null });
    } catch (error: any) {
      console.error('Failed to fetch addresses:', error);
      set({ 
        addresses: [], 
        error: error.message || 'Failed to fetch addresses' 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createAddress: async (addressData: AddressForm) => {
    set({ isLoading: true, error: null });
    try {
      const newAddress = await addressService.createAddress(addressData);
      console.log('Created address:', newAddress);
      
      set(state => ({ 
        addresses: [...state.addresses, newAddress],
        error: null,
        lastNotification: 'Address added successfully!' 
      }));
      
      setTimeout(() => {
        set({ lastNotification: null });
      }, 3000);
      
      return newAddress;
    } catch (error: any) {
      console.error('Failed to create address:', error);
      set({ error: error.message || 'Failed to create address' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateAddress: async (id: number, addressData: AddressForm) => {
    set({ isLoading: true, error: null });
    try {
      const updatedAddress = await addressService.updateAddress(id, addressData);
      console.log('Updated address:', updatedAddress);
      
      set(state => ({
        addresses: state.addresses.map(addr => 
          addr.id === id ? updatedAddress : addr
        ),
        error: null,
        lastNotification: 'Address updated successfully!'
      }));
      
      setTimeout(() => {
        set({ lastNotification: null });
      }, 3000);
      
      return updatedAddress;
    } catch (error: any) {
      console.error('Failed to update address:', error);
      set({ error: error.message || 'Failed to update address' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAddress: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await addressService.deleteAddress(id);
      console.log('Deleted address:', id);
      
      set(state => ({
        addresses: state.addresses.filter(addr => addr.id !== id),
        error: null,
        lastNotification: 'Address deleted successfully!'
      }));
      
      setTimeout(() => {
        set({ lastNotification: null });
      }, 3000);
    } catch (error: any) {
      console.error('Failed to delete address:', error);
      set({ error: error.message || 'Failed to delete address' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ COMPLETELY FIXED setDefaultAddress function
  setDefaultAddress: async (id: number, type?: 'shipping' | 'billing') => {
    set({ isLoading: true, error: null });
    try {
      // If no type provided, try to get it from the existing address
      if (!type) {
        const existingAddress = get().addresses.find(addr => addr.id === id);
        type = existingAddress?.type || 'shipping';
      }
      
      console.log('Setting default address:', { id, type }); // Debug log
      
      // Call API with type parameter
      const updatedAddress = await addressService.setDefaultAddress(id, type);
      console.log('API returned:', updatedAddress);
      
      // Update state: only addresses of the same type should be affected
      set(state => ({
        addresses: state.addresses.map(addr => ({
          ...addr,
          is_default: addr.type === type ? addr.id === id : addr.is_default
        })),
        error: null,
        lastNotification: `Default ${type} address updated!`
      }));
      
      setTimeout(() => {
        set({ lastNotification: null });
      }, 3000);
      
    } catch (error: any) {
      console.error('Failed to set default address:', error);
      set({ error: error.message || 'Failed to set default address' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearNotification: () => {
    set({ lastNotification: null });
  },
}));
EOF

# Step 4: Fix the AddressCard component
cat > apps/storefront/src/components/profile/AddressCard_fixed.tsx << 'EOF'
'use client';

import { useState } from 'react';
import { useAddressStore } from '@/store/address';
import { AddressForm } from '@/components/checkout/AddressForm';
import type { UserAddress } from '@repo/types';

interface AddressCardProps {
  address: UserAddress;
  onEdit?: (address: UserAddress) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (address: UserAddress) => void;
}

export function AddressCard({ 
  address, 
  onEdit, 
  selectable = false, 
  selected = false, 
  onSelect 
}: AddressCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { deleteAddress, setDefaultAddress, updateAddress, isLoading } = useAddressStore();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(address.id);
      } catch (error) {
        console.error('Failed to delete address:', error);
      }
    }
  };

  // ✅ FIXED: Now passes the address type correctly
  const handleSetDefault = async () => {
    try {
      console.log('Setting default for address:', address); // Debug log
      await setDefaultAddress(address.id, address.type); // ✅ Pass the type!
    } catch (error) {
      console.error('Failed to set default address:', error);
    }
  };

  const handleEditSave = async (addressData: any) => {
    try {
      await updateAddress(address.id, addressData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update address:', error);
    }
  };

  const handleSelect = () => {
    if (selectable && onSelect) {
      onSelect(address);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Address</h3>
        <AddressForm
          initialData={address}
          onSubmit={handleEditSave}
          onCancel={() => setIsEditing(false)}
          submitLabel="Update Address"
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div 
      className={`bg-white border rounded-lg p-6 transition-all ${
        selectable 
          ? `cursor-pointer hover:border-blue-300 ${
              selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`
          : 'border-gray-200'
      }`}
      onClick={handleSelect}
    >
      {/* Selection indicator */}
      {selectable && (
        <div className="flex items-center mb-3">
          <input
            type="radio"
            checked={selected}
            onChange={handleSelect}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">
            {selected ? 'Selected' : 'Select this address'}
          </span>
        </div>
      )}

      {/* Address type and default badges */}
      <div className="flex items-center gap-2 mb-3">
        {/* Address type badge */}
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          address.type === 'shipping' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-purple-100 text-purple-800'
        }`}>
          {address.type === 'shipping' ? '📦 Shipping' : '💳 Billing'}
        </span>
        
        {/* Default badge */}
        {address.is_default && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Default
          </span>
        )}
      </div>

      {/* Address details */}
      <div className="space-y-1 text-sm text-gray-600">
        <p className="font-medium text-gray-900">
          {address.first_name} {address.last_name}
        </p>
        {address.company && <p>{address.company}</p>}
        <p>{address.address_line_1}</p>
        {address.address_line_2 && <p>{address.address_line_2}</p>}
        <p>{address.city}, {address.state} {address.postal_code}</p>
        <p>{address.country}</p>
        {address.phone && <p>Phone: {address.phone}</p>}
      </div>

      {/* Actions */}
      {!selectable && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-blue-600 hover:text-blue-500"
              disabled={isLoading}
            >
              Edit
            </button>
            {!address.is_default && (
              <button
                onClick={handleSetDefault}
                className="text-sm text-green-600 hover:text-green-500"
                disabled={isLoading}
              >
                Set as Default {address.type === 'shipping' ? 'Shipping' : 'Billing'}
              </button>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="text-sm text-red-600 hover:text-red-500"
            disabled={isLoading || address.is_default}
            title={address.is_default ? 'Cannot delete default address' : 'Delete address'}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
EOF

echo "✅ All fixes applied!"
echo ""
echo "🚀 Apply these changes to your files:"
echo ""
echo "1. packages/types/index.ts - Add 'type' field to UserAddress:"
echo "   type: 'shipping' | 'billing';"
echo ""
echo "2. packages/api/address.ts - Replace with address_complete_fix.ts content"
echo ""
echo "3. apps/storefront/src/store/address.ts - Replace with address_complete_fix.ts content"
echo ""
echo "4. apps/storefront/src/components/profile/AddressCard.tsx - Replace with AddressCard_fixed.tsx content"
echo ""
echo "🔍 Key fixes:"
echo "• API now sends {\"type\": \"shipping\"} in JSON body"
echo "• Store correctly handles type-specific default setting"
echo "• AddressCard passes address.type to setDefaultAddress"
echo "• UI shows address type (shipping/billing) clearly"
echo "• State management only affects addresses of same type"
echo ""
echo "After applying these changes, your 'Set as Default' should work correctly! 🎯"