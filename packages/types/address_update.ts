// Add this to your existing packages/types/index.ts file

export interface UserAddress extends AddressForm {
  id: number;
  user_id: number;
  type: 'shipping' | 'billing';  // ✅ ADD THIS LINE!
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
