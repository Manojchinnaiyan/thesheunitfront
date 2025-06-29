// Re-export everything from the updated types
export * from './address_fixed';

// Keep all your existing types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
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
