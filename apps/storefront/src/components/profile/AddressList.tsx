'use client';

import { useEffect, useState } from 'react';
import { useAddressStore } from '@/store/address';
import { AddressCard } from './AddressCard';
import { AddressForm } from '@/components/checkout/AddressForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Truck, CreditCard, Plus } from 'lucide-react';
import type { UserAddress, AddressForm as AddressFormType } from '@repo/types';

export function AddressList() {
 const [showAddForm, setShowAddForm] = useState(false);
 const [newAddressType, setNewAddressType] = useState<'shipping' | 'billing'>('shipping');
 
 const { 
   addresses, 
   isLoading, 
   error, 
   lastNotification,
   fetchAddresses,
   createAddress,
   clearError,
   clearNotification,
   getDefaultAddress,
   getAddressesByType
 } = useAddressStore();

 useEffect(() => {
   fetchAddresses();
 }, [fetchAddresses]);

 const handleAddAddress = async (addressData: AddressFormType) => {
   try {
     await createAddress({ ...addressData, type: newAddressType });
     setShowAddForm(false);
   } catch (error) {
     console.error('Failed to create address:', error);
   }
 };

 const shippingAddresses = getAddressesByType('shipping');
 const billingAddresses = getAddressesByType('billing');
 const defaultShipping = getDefaultAddress('shipping');
 const defaultBilling = getDefaultAddress('billing');

 if (isLoading && addresses.length === 0) {
   return (
     <div className="flex justify-center items-center h-32">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
     </div>
   );
 }

 return (
   <div className="space-y-6">
     {/* Notifications */}
     {error && (
       <div className="bg-red-50 border border-red-200 rounded-lg p-4">
         <p className="text-red-800 text-sm">{error}</p>
         <Button onClick={clearError} variant="outline" size="sm" className="mt-2">
           Dismiss
         </Button>
       </div>
     )}

     {lastNotification && (
       <div className="bg-green-50 border border-green-200 rounded-lg p-4">
         <p className="text-green-800 text-sm">{lastNotification}</p>
         <Button onClick={clearNotification} variant="ghost" size="sm" className="mt-1 text-green-600">
           ×
         </Button>
       </div>
     )}

     {/* Header with Add Button */}
     <div className="flex justify-between items-center">
       <h2 className="text-xl font-semibold text-gray-900">Address Management</h2>
       <div className="flex gap-2">
         <Button 
           onClick={() => {
             setNewAddressType('shipping');
             setShowAddForm(true);
           }}
           variant="outline"
           className="text-blue-600 border-blue-200"
         >
           <Truck className="h-4 w-4 mr-2" />
           Add Shipping
         </Button>
         <Button 
           onClick={() => {
             setNewAddressType('billing');
             setShowAddForm(true);
           }}
           variant="outline"
           className="text-purple-600 border-purple-200"
         >
           <CreditCard className="h-4 w-4 mr-2" />
           Add Billing
         </Button>
       </div>
     </div>

     {/* Add Address Form */}
     {showAddForm && (
       <Card className="border-2 border-dashed border-gray-300">
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             {newAddressType === 'shipping' ? (
               <Truck className="h-5 w-5 text-blue-600" />
             ) : (
               <CreditCard className="h-5 w-5 text-purple-600" />
             )}
             Add New {newAddressType === 'shipping' ? 'Shipping' : 'Billing'} Address
           </CardTitle>
         </CardHeader>
         <CardContent>
           <AddressForm
             onSubmit={handleAddAddress}
             onCancel={() => setShowAddForm(false)}
             submitLabel={`Add ${newAddressType === 'shipping' ? 'Shipping' : 'Billing'} Address`}
             isLoading={isLoading}
           />
         </CardContent>
       </Card>
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

       <Card className="border-purple-200 bg-purple-50">
         <CardHeader className="pb-3">
           <CardTitle className="text-lg flex items-center gap-2">
             <CreditCard className="h-5 w-5 text-purple-600" />
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
             />
           ))}
         </div>
       )}
     </div>
   </div>
 );
}
