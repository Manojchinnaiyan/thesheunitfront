import { create } from 'zustand';
import { cartService } from '@repo/api';
import type { BackendCartResponse, BackendCartData } from '@repo/types';

interface CartState {
  cartData: BackendCartData | null;
  isLoading: boolean;
  error: string | null;
  lastNotification: string | null;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
  getTotalAmount: () => number;
  clearError: () => void;
  clearNotification: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartData: null,
  isLoading: false,
  error: null,
  lastNotification: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartService.getCart();
      console.log('Cart response in store:', response);
      
      if (response.data) {
        set({ cartData: response.data, error: null });
      } else {
        throw new Error('Invalid cart response structure');
      }
    } catch (error: any) {
      console.error('Failed to fetch cart:', error);
      
      // If error is "cart not found" or similar, it's just an empty cart
      if (error.response?.status === 404) {
        set({ cartData: null, error: null });
      } else {
        set({ 
          cartData: null, 
          error: error.message || 'Failed to fetch cart' 
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId: number, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartService.addItem(productId, quantity);
      console.log('Add item response in store:', response);
      
      if (response.data) {
        set({ 
          cartData: response.data, 
          error: null,
          lastNotification: 'Item added to cart successfully!' 
        });
        
        // Clear notification after 3 seconds
        setTimeout(() => {
          set({ lastNotification: null });
        }, 3000);
      }
    } catch (error: any) {
      console.error('Failed to add item to cart:', error);
      set({ error: error.message || 'Failed to add item to cart' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (productId: number, quantity: number) => {
    console.log('Updating item in store by product_id:', { productId, quantity });
    set({ isLoading: true, error: null });
    try {
      const response = await cartService.updateItem(productId, quantity);
      console.log('Update item response in store:', response);
      
      if (response.data) {
        set({ 
          cartData: response.data, 
          error: null,
          lastNotification: 'Cart updated successfully!' 
        });
        
        // Clear notification after 2 seconds
        setTimeout(() => {
          set({ lastNotification: null });
        }, 2000);
      }
    } catch (error: any) {
      console.error('Failed to update cart item:', error);
      set({ error: error.message || 'Failed to update cart item' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (productId: number) => {
    console.log('Removing item in store by product_id:', productId);
    set({ isLoading: true, error: null });
    try {
      const response = await cartService.removeItem(productId);
      console.log('Remove item response in store:', response);
      
      if (response.data) {
        set({ 
          cartData: response.data, 
          error: null,
          lastNotification: 'Item removed from cart!' 
        });
      } else {
        // If no data returned, cart might be empty now
        set({ cartData: null, error: null });
      }
      
      // Clear notification after 2 seconds
      setTimeout(() => {
        set({ lastNotification: null });
      }, 2000);
    } catch (error: any) {
      console.error('Failed to remove cart item:', error);
      set({ error: error.message || 'Failed to remove cart item' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await cartService.clearCart();
      set({ 
        cartData: null, 
        error: null,
        lastNotification: 'Cart cleared!' 
      });
      
      // Clear notification after 2 seconds
      setTimeout(() => {
        set({ lastNotification: null });
      }, 2000);
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
      set({ error: error.message || 'Failed to clear cart' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getItemCount: () => {
    const { cartData } = get();
    const count = cartData?.totals?.item_count || 0;
    console.log('Getting item count:', count, 'from cartData:', cartData);
    return count;
  },

  getTotalAmount: () => {
    const { cartData } = get();
    return cartData?.totals?.total_amount || 0;
  },

  clearError: () => {
    set({ error: null });
  },

  clearNotification: () => {
    set({ lastNotification: null });
  },
}));
