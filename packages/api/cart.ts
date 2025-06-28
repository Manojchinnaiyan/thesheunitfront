import { apiClient } from './client';
import { API_ENDPOINTS } from '@repo/config';
import type { BackendCartResponse, BackendCartData } from '@repo/types';

export class CartService {
  async getCart(): Promise<BackendCartResponse> {
    try {
      const response = await apiClient.get<BackendCartResponse>(API_ENDPOINTS.CART);
      console.log('Cart API response:', response);
      return response;
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      throw error;
    }
  }

  async addItem(productId: number, quantity: number = 1): Promise<BackendCartResponse> {
    try {
      const response = await apiClient.post<BackendCartResponse>(API_ENDPOINTS.CART_ITEMS, {
        product_id: productId,
        quantity
      });
      
      console.log('Add item API response:', response);
      return response;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  }

  async updateItem(productId: number, quantity: number): Promise<BackendCartResponse> {
    try {
      console.log('Updating cart item by product_id:', { productId, quantity });
      
      // Since your backend doesn't have item IDs, we'll use product_id
      const response = await apiClient.put<BackendCartResponse>(`${API_ENDPOINTS.CART_ITEMS}/${productId}`, {
        quantity
      });
      
      console.log('Update item API response:', response);
      return response;
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  }

  async removeItem(productId: number): Promise<BackendCartResponse> {
    try {
      console.log('Removing cart item by product_id:', productId);
      
      // Since your backend doesn't have item IDs, we'll use product_id
      const response = await apiClient.delete<BackendCartResponse>(`${API_ENDPOINTS.CART_ITEMS}/${productId}`);
      
      console.log('Remove item API response:', response);
      return response;
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      throw error;
    }
  }

  async clearCart(): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.CART);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  }

  async getItemCount(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.data.totals.item_count || 0;
    } catch (error) {
      console.error('Failed to get cart count:', error);
      return 0;
    }
  }
}

export const cartService = new CartService();
