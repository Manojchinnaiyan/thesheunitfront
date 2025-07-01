// Address conversion utilities for API compatibility

import type { AddressForm as AddressFormType, UserAddress } from '@repo/types';

// Country name to code mapping
const COUNTRY_CODE_MAP: Record<string, string> = {
  'India': 'IN',
  'United States': 'US',
  'United Kingdom': 'GB',
  'Canada': 'CA',
  'Australia': 'AU',
  'Germany': 'DE',
  'France': 'FR',
  'Japan': 'JP',
  'Singapore': 'SG',
  'United Arab Emirates': 'AE',
};

// Country code to name mapping
const COUNTRY_NAME_MAP: Record<string, string> = {
  'IN': 'India',
  'US': 'United States',
  'GB': 'United Kingdom',
  'CA': 'Canada',
  'AU': 'Australia',
  'DE': 'Germany',
  'FR': 'France',
  'JP': 'Japan',
  'SG': 'Singapore',
  'AE': 'United Arab Emirates',
};

// Convert frontend address form to backend API format
export const convertAddressForAPI = (address: AddressFormType, type: 'shipping' | 'billing' = 'shipping') => {
  return {
    type: type,
    first_name: address.first_name,
    last_name: address.last_name,
    company: address.company || '',
    address_line1: address.address_line_1, // Corrected field mapping
    address_line2: address.address_line_2 || '',
    city: address.city,
    state: address.state,
    postal_code: address.postal_code,
    country: address.country.length === 2 ? address.country : (COUNTRY_CODE_MAP[address.country] || address.country),
    phone: address.phone || '',
    is_default: false,
  };
};

// Convert UserAddress to frontend display format
export const convertUserAddressForDisplay = (address: UserAddress): UserAddress => {
  return {
    ...address,
    country: address.country.length === 2 ? (COUNTRY_NAME_MAP[address.country] || address.country) : address.country,
  };
};

// Convert UserAddress to order API format
export const convertUserAddressForOrder = (address: UserAddress) => ({
  first_name: address.first_name,
  last_name: address.last_name,
  company: address.company || undefined,
  address_line_1: address.address_line_1,
  address_line_2: address.address_line_2 || undefined,
  city: address.city,
  state: address.state,
  postal_code: address.postal_code,
  country: address.country.length === 2 ? (COUNTRY_NAME_MAP[address.country] || address.country) : address.country,
  phone: address.phone || undefined,
});
