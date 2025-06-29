// Patch for address store to handle API conversion
import { convertAddressForAPI } from '@/lib/address-conversion';

// Enhanced create address function
export const createAddressWithConversion = async (addressData: any, createAddressFn: any) => {
  // Convert to API format
  const apiData = convertAddressForAPI(addressData, 'shipping');
  
  console.log('Converting address for API:', { original: addressData, converted: apiData });
  
  // Call the original create function
  return await createAddressFn(apiData);
};
