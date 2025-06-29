// store/order.ts
import { create } from "zustand";
import { API_CONFIG, API_ENDPOINTS } from "@repo/config";

interface Order {
  id: number;
  user_id: number;
  order_number: string;
  email: string;
  status: string;
  payment_status: string;
  subtotal_amount: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  notes?: string;
  coupon_code?: string;
  shipping_method?: string;
  shipping_address: any;
  billing_address: any;
  tracking_number?: string;
  shipping_carrier?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  status_history: OrderStatusHistory[];
}

interface OrderItem {
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

interface OrderStatusHistory {
  id: number;
  order_id: number;
  status: string;
  comment: string;
  created_by: number;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface OrderResponse {
  orders: Order[];
  pagination: Pagination;
}

interface OrderStore {
  orders: Order[];
  currentOrder: Order | null;
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOrders: (page?: number, limit?: number) => Promise<void>;
  fetchOrder: (orderId: number) => Promise<Order | null>;
  fetchOrderByNumber: (orderNumber: string) => Promise<Order | null>;
  cancelOrder: (orderId: number, reason: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  currentOrder: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchOrders: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ORDERS}?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch orders");
      }

      const data = await response.json();
      const orderResponse: OrderResponse = data.data;

      set({
        orders: orderResponse.orders || [],
        pagination: orderResponse.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch orders",
        isLoading: false,
      });
    }
  },

  fetchOrder: async (orderId: number) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ORDERS}/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch order");
      }

      const data = await response.json();
      const order: Order = data.data;

      set({
        currentOrder: order,
        isLoading: false,
      });

      return order;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch order",
        isLoading: false,
      });
      return null;
    }
  },

  fetchOrderByNumber: async (orderNumber: string) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ORDERS}/number/${orderNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch order");
      }

      const data = await response.json();
      const order: Order = data.data;

      set({
        currentOrder: order,
        isLoading: false,
      });

      return order;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch order",
        isLoading: false,
      });
      return null;
    }
  },

  cancelOrder: async (orderId: number, reason: string) => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ORDERS}/${orderId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel order");
      }

      // Refresh orders after cancellation
      await get().fetchOrders();

      set({ isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to cancel order",
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      orders: [],
      currentOrder: null,
      pagination: null,
      isLoading: false,
      error: null,
    }),
}));

export { useOrderStore };
export type { Order, OrderItem, OrderStatusHistory, Pagination };
