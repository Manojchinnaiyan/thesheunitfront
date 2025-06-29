import { apiClient } from './client';
import { API_ENDPOINTS } from '@repo/config';

// Response interfaces matching your exact backend response
export interface CategoriesApiResponse {
  message: string;
  data: Array<{
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
  }>;
}

export class CategoriesService {
  async getCategories(params?: { include_counts?: boolean }): Promise<CategoriesApiResponse> {
    try {
      console.log('🔄 CategoriesService.getCategories called');
      console.log('📍 API Base URL:', 'http://localhost:8080/api/v1');
      console.log('📍 Categories endpoint:', API_ENDPOINTS.CATEGORIES);
      
      let url = API_ENDPOINTS.CATEGORIES;
      if (params?.include_counts) {
        url += '?include_counts=true';
      }
      
      console.log('🌐 Making request to:', url);
      
      const response = await apiClient.get<CategoriesApiResponse>(url);
      console.log('✅ Categories API success:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ CategoriesService.getCategories error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  async getRootCategories(): Promise<CategoriesApiResponse> {
    try {
      console.log('🔄 CategoriesService.getRootCategories called');
      const url = `${API_ENDPOINTS.CATEGORIES}/root`;
      console.log('🌐 Making request to:', url);
      
      const response = await apiClient.get<CategoriesApiResponse>(url);
      console.log('✅ Root categories API success:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ CategoriesService.getRootCategories error:', error);
      throw new Error(`Failed to fetch root categories: ${error.message}`);
    }
  }

  // Direct fetch method as fallback
  async getCategoriesDirect(): Promise<CategoriesApiResponse> {
    try {
      console.log('🔄 Direct fetch method called');
      const response = await fetch('http://localhost:8080/api/v1/products/categories');
      console.log('🌐 Direct fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Direct fetch success:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Direct fetch error:', error);
      throw error;
    }
  }
}

export const categoriesService = new CategoriesService();
