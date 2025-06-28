
// Updated Cart types to match backend response
export interface CartItemResponse {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  price: number;
  total: number;
  created_at: string;
  updated_at: string;
  product: Product;
}

export interface CartResponse {
  id: number;
  user_id: number;
  total_amount: number;
  item_count: number;
  created_at: string;
  updated_at: string;
  items: CartItemResponse[];
}

// Updated Cart types to match backend response
export interface CartItemResponse {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  price: number;
  total: number;
  created_at: string;
  updated_at: string;
  product: Product;
}

export interface CartResponse {
  id: number;
  user_id: number;
  total_amount: number;
  item_count: number;
  created_at: string;
  updated_at: string;
  items: CartItemResponse[];
}
