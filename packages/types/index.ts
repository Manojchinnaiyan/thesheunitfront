// API Response wrapper
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  details?: string;
}

// User types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  is_verified: boolean;
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
  confirm_password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Category types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Product types
export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  category_id: number;
  brand_id?: number;
  weight?: number;
  dimensions?: string;
  is_active: boolean;
  is_featured: boolean;
  is_digital: boolean;
  requires_shipping: boolean;
  track_quantity: boolean;
  quantity: number;
  low_stock_threshold: number;
  seo_title?: string;
  seo_description?: string;
  tags?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

// Cart types - matching backend
export interface CartItem {
  id: number;
  cart_id?: number;
  product_id: number;
  quantity: number;
  price: number;
  total: number;
  created_at?: string;
  updated_at?: string;
  product: Product;
}

export interface Cart {
  id: number;
  user_id: number;
  total_amount: number;
  item_count: number;
  created_at: string;
  updated_at: string;
  items: CartItem[];
}

// Order types
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  product_id: number;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  total_amount: number;
  items: OrderItem[];
  shipping_address: Address;
  billing_address?: Address;
  created_at: string;
  updated_at: string;
}

export interface Address {
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
// Exact structure from your backend response
export interface BackendCartItem {
  product_id: number;
  quantity: number;
  price: number;
  added_at: string;
  product: Product;
  // NOTE: Backend cart items don't have individual IDs
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
  // NOTE: Backend cart doesn't have a cart ID
}

export interface BackendCartResponse {
  data: BackendCartData;
  message: string;
}

// Address and Checkout types
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

// Category interface (ensuring it matches your backend response)
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  parent_id: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: Category;
  children?: Category[];
}
