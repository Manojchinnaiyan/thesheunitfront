// packages/types/index.ts - COMPLETE FILE

// User types
export interface User {
 id: number;
 email: string;
 first_name: string;
 last_name: string;
 phone?: string;
 is_active: boolean;
 is_admin?: boolean;
 created_at: string;
 updated_at: string;
}

export interface LoginRequest {
 email: string;
 password: string;
}

export interface RegisterRequest {
 email: string;
 password: string;
 first_name: string;
 last_name: string;
 phone?: string;
}

export interface ApiResponse<T> {
 data: T;
 message?: string;
}

// Product related types
export interface Product {
 id: number;
 name: string;
 description: string;
 price: number;
 compare_price?: number;
 sku: string;
 brand: string;
 category_id: number;
 image_url?: string;
 is_active: boolean;
 is_featured: boolean;
 stock_quantity: number;
 weight?: number;
 dimensions?: string;
 created_at: string;
 updated_at: string;
 category?: Category;
}

export interface Category {
 id: number;
 name: string;
 description?: string;
 is_active: boolean;
 created_at: string;
 updated_at: string;
}

// API request types
export interface ProductListParams {
 page?: number;
 limit?: number;
 category_id?: number;
 brand_id?: number;
 search?: string;
 sort_by?: string;
 sort_order?: 'asc' | 'desc';
 min_price?: number;
 max_price?: number;
 is_active?: boolean;
 is_featured?: boolean;
}

// Pagination type
export interface Pagination {
 page: number;
 limit: number;
 total: number;
 total_pages: number;
 has_next: boolean;
 has_prev: boolean;
}

// Products data structure
export interface ProductsData {
 products: Product[];
 pagination: Pagination;
}

// Complete API response for products
export interface ProductsResponse {
 data: ProductsData;
 message?: string;
}

// Generic paginated response
export interface PaginatedResponse<T> {
 data: T[];
 pagination: Pagination;
}

// Cart types
export interface BackendCartItem {
 product_id: number;
 quantity: number;
 price: number;
 added_at: string;
 product: Product;
}

export interface CartTotals {
 item_count: number;
 total_quantity: number;
 sub_total: number;
 tax_amount: number;
 shipping_cost: number;
 discount_amount: number;
 total_amount: number;
}

export interface BackendCartData {
 user_id: number;
 items: BackendCartItem[];
 totals: CartTotals;
 created_at: string;
 updated_at: string;
}

export interface BackendCartResponse {
 data: BackendCartData;
 message: string;
}

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
 type: 'shipping' | 'billing';  // ✅ FIXED: Added missing type field
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

// Extended Order Types for detailed view
export interface OrderDetails {
  id: number;
  user_id: number;
  order_number: string;
  email: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  currency: string;
  shipping_method: string;
  payment_method: string;
  tracking_number?: string;
  shipping_carrier?: string;
  notes?: string;
  items: OrderItemDetails[];
  shipping_address: Address;
  billing_address: Address;
  status_history?: OrderStatusHistory[];
  payments?: PaymentRecord[];
  created_at: string;
  updated_at: string;
}

export interface OrderItemDetails {
  id: number;
  order_id: number;
  product_id: number;
  product_variant_id?: number;
  sku: string;
  name: string;
  variant_title?: string;
  quantity: number;
  price: number;
  total_price: number;
}

export interface OrderStatusHistory {
  id: number;
  order_id: number;
  status: OrderStatus;
  comment: string;
  created_by: number;
  created_at: string;
}

export interface PaymentRecord {
  id: number;
  order_id: number;
  payment_method: string;
  payment_provider_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway: string;
  gateway_response?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refunded';

// Order tracking types
export interface OrderTrackingInfo {
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  tracking_number?: string;
  shipping_carrier?: string;
  shipped_at?: string;
  delivered_at?: string;
  estimated_delivery?: string;
  status_history: OrderStatusHistory[];
}

// Order list response types
export interface OrderListResponse {
  orders: Order[];
  pagination: Pagination;
  total: number;
  limit: number;
  page: number;
}
