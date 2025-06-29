import { apiClient } from './client';
import { API_ENDPOINTS } from '@repo/config';
import type { UserAddress, AddressForm, ApiResponse } from '@repo/types';

export class AddressService {
  async getAddresses(): Promise<UserAddress[]> {
    try {
      const response = await apiClient.get<ApiResponse<UserAddress[]>>(API_ENDPOINTS.USER_ADDRESSES);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      throw error;
    }
  }

  async createAddress(addressData: AddressForm): Promise<UserAddress> {
    try {
      const response = await apiClient.post<ApiResponse<UserAddress>>(API_ENDPOINTS.USER_ADDRESSES, addressData);
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid address creation response');
    } catch (error) {
      console.error('Failed to create address:', error);
      throw error;
    }
  }

  async updateAddress(id: number, addressData: AddressForm): Promise<UserAddress> {
    try {
      const response = await apiClient.put<ApiResponse<UserAddress>>(`${API_ENDPOINTS.USER_ADDRESSES}/${id}`, addressData);
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid address update response');
    } catch (error) {
      console.error('Failed to update address:', error);
      throw error;
    }
  }

  async deleteAddress(id: number): Promise<void> {
    try {
      await apiClient.delete(`${API_ENDPOINTS.USER_ADDRESSES}/${id}`);
    } catch (error) {
      console.error('Failed to delete address:', error);
      throw error;
    }
  }

  // ✅ FIXED: Now properly sends the type parameter
  async setDefaultAddress(id: number, type: 'shipping' | 'billing' = 'shipping'): Promise<UserAddress> {
    try {
      console.log('Setting default address:', { id, type }); // Debug log
      
      const response = await apiClient.put<ApiResponse<UserAddress>>(
        `${API_ENDPOINTS.USER_ADDRESSES}/${id}/default`,
        { type } // ✅ Send the type in JSON body
      );
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid set default address response');
    } catch (error) {
      console.error('Failed to set default address:', error);
      throw error;
    }
  }
}

export const addressService = new AddressService();
