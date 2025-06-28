import { apiClient } from './client';
import { API_ENDPOINTS } from '@repo/config';
import type { Order, OrderCreateRequest, ApiResponse, PaginatedResponse } from '@repo/types';

export class OrdersService {
  async createOrder(orderData: OrderCreateRequest): Promise<Order> {
    try {
      console.log('Creating order with data:', orderData);
      const response = await apiClient.post<ApiResponse<Order>>(API_ENDPOINTS.ORDERS, orderData);
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid order creation response');
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }

  async getOrders(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Order>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Order>>(API_ENDPOINTS.ORDERS, {
        params: { page, limit }
      });
      
      if (response.data) {
        return response.data;
      } else if (response.orders) {
        // Handle different response structures
        return response as PaginatedResponse<Order>;
      }
      
      throw new Error('Invalid orders response');
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  }

  async getOrder(id: number): Promise<Order> {
    try {
      const response = await apiClient.get<ApiResponse<Order>>(`${API_ENDPOINTS.ORDERS}/${id}`);
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid order response');
    } catch (error) {
      console.error('Failed to fetch order:', error);
      throw error;
    }
  }

  async cancelOrder(id: number): Promise<Order> {
    try {
      const response = await apiClient.put<ApiResponse<Order>>(`${API_ENDPOINTS.ORDERS}/${id}/cancel`);
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid cancel order response');
    } catch (error) {
      console.error('Failed to cancel order:', error);
      throw error;
    }
  }
}

export const ordersService = new OrdersService();
