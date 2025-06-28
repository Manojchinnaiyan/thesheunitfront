# Navigate to storefront
cd apps/storefront

# Create address store
cat > src/store/address.ts << 'EOF'
import { create } from 'zustand';
import { addressService } from '@repo/api';
import type { UserAddress, AddressForm } from '@repo/types';

interface AddressState {
  addresses: UserAddress[];
  isLoading: boolean;
  error: string | null;
  lastNotification: string | null;
  fetchAddresses: () => Promise<void>;
  createAddress: (addressData: AddressForm) => Promise<UserAddress>;
  updateAddress: (id: number, addressData: AddressForm) => Promise<UserAddress>;
  deleteAddress: (id: number) => Promise<void>;
  setDefaultAddress: (id: number) => Promise<void>;
  clearError: () => void;
  clearNotification: () => void;
}

export const useAddressStore = create<AddressState>((set, get) => ({
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
      
      // Clear notification after 3 seconds
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

  setDefaultAddress: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await addressService.setDefaultAddress(id);
      console.log('Set default address:', id);
      
      set(state => ({
        addresses: state.addresses.map(addr => ({
          ...addr,
          is_default: addr.id === id
        })),
        error: null,
        lastNotification: 'Default address updated!'
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

# Create address card component
mkdir -p src/components/profile
cat > src/components/profile/AddressCard.tsx << 'EOF'
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

  const handleSetDefault = async () => {
    try {
      await setDefaultAddress(address.id);
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

      {/* Default badge */}
      {address.is_default && (
        <div className="flex items-center mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Default Address
          </span>
        </div>
      )}

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
                Set as Default
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

# Create profile page
mkdir -p src/app/profile
cat > src/app/profile/page.tsx << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useAddressStore } from '@/store/address';
import { AddressCard } from '@/components/profile/AddressCard';
import { AddressForm } from '@/components/checkout/AddressForm';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const { 
    addresses, 
    isLoading, 
    error, 
    fetchAddresses, 
    createAddress, 
    clearError 
  } = useAddressStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated, fetchAddresses]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p>Please sign in to view your profile.</p>
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 ml-1">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAddAddress = async (addressData: any) => {
    try {
      await createAddress(addressData);
      setShowAddAddressForm(false);
    } catch (error) {
      console.error('Failed to create address:', error);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '👤' },
    { id: 'addresses', name: 'Addresses', icon: '📍' },
    { id: 'orders', name: 'Orders', icon: '📦' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-red-600">×</button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.first_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.last_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Status</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user?.is_verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user?.is_verified ? '✓ Verified' : '⚠ Unverified'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{addresses.length}</div>
                    <div className="text-sm text-gray-600">Saved Addresses</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {user?.is_admin ? 'Admin' : 'Customer'}
                    </div>
                    <div className="text-sm text-gray-600">Account Type</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">My Addresses</h2>
                <button
                  onClick={() => setShowAddAddressForm(true)}
                  className="btn-primary"
                >
                  Add New Address
                </button>
              </div>

              {showAddAddressForm && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Address</h3>
                  <AddressForm
                    initialData={{
                      first_name: user?.first_name || '',
                      last_name: user?.last_name || '',
                    }}
                    onSubmit={handleAddAddress}
                    onCancel={() => setShowAddAddressForm(false)}
                    submitLabel="Add Address"
                    isLoading={isLoading}
                  />
                </div>
              )}

              {isLoading && !showAddAddressForm ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((address) => (
                    <AddressCard
                      key={address.id}
                      address={address}
                    />
                  ))}
                </div>
              ) : !showAddAddressForm ? (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-lg p-8">
                    <div className="text-4xl mb-4">📍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
                    <p className="text-gray-600 mb-4">Add your first address to make checkout faster.</p>
                    <button
                      onClick={() => setShowAddAddressForm(true)}
                      className="btn-primary"
                    >
                      Add Your First Address
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order History</h2>
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-4">When you place orders, they'll appear here.</p>
                <Link href="/products" className="btn-primary">
                  Start Shopping
                </Link>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">Email Preferences</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Order updates and shipping notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">Promotional emails and special offers</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">Privacy Settings</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Allow order history for recommendations</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-base font-medium text-red-900 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    These actions cannot be undone. Please be careful.
                  </p>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
EOF

cd ../..

# Navigate to storefront
cd apps/storefront

# Create address selection component
cat > src/components/checkout/AddressSelection.tsx << 'EOF'
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
EOF

cd ../..

