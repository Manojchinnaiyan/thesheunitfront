// Address and Checkout types - FIXED VERSION
export interface AddressForm {
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface UserAddress extends AddressForm {
  id: number;
  user_id: number;
  type: 'shipping' | 'billing';  // ✅ ADD THIS MISSING FIELD
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CheckoutData {
  shipping_address: AddressForm;
  billing_address?: AddressForm;
  use_shipping_as_billing: boolean;
  shipping_method: string;
  payment_method: string;
  notes?: string;
}

export interface OrderCreateRequest {
  shipping_address: AddressForm;
  billing_address?: AddressForm;
  shipping_method: string;
  payment_method: string;
  notes?: string;
  use_shipping_as_billing?: boolean;
}
