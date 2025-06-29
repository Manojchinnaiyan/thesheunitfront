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
     console.log('AddressCard: Setting default for address:', address); // Debug log
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
