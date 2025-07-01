// store/order.ts - FIXED VERSION
import { create } from "zustand";
import { API_CONFIG, API_ENDPOINTS } from "@repo/config";
import type { Order, OrderItem, OrderStatusHistory, Pagination } from "@repo/types";

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
  fetchOrderById: (orderId: number) => Promise<void>; // ✅ ADDED MISSING METHOD
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
        error: error instanceof Error ? error.message : "Failed to fetch orders",
        isLoading: false,
        orders: [],
        pagination: null,
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
        currentOrder: null,
      });
      return null;
    }
  },

  // ✅ ADDED MISSING METHOD
  fetchOrderById: async (orderId: number) => {
    await get().fetchOrder(orderId);
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
        currentOrder: null,
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
        error: error instanceof Error ? error.message : "Failed to cancel order",
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
