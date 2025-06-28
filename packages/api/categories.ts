import { apiClient } from './client';
import { API_ENDPOINTS } from '@repo/config';
import type { Category, ApiResponse } from '@repo/types';

// API Response interfaces based on your backend
export interface CategoriesResponse {
  message: string;
  data: Category[];
}

export interface CategoryResponse {
  message: string;
  data: Category;
}

export interface CategoryTreeResponse {
  message: string;
  data: CategoryTree[];
}

export interface CategoryTree extends Category {
  children?: CategoryTree[];
}

export class CategoriesService {
  async getCategories(params?: { include_counts?: boolean }): Promise<CategoriesResponse> {
    try {
      console.log('CategoriesService.getCategories called with params:', params);
      
      const queryParams = new URLSearchParams();
      if (params?.include_counts) {
        queryParams.append('include_counts', 'true');
      }
      
      const url = queryParams.toString() 
        ? `${API_ENDPOINTS.CATEGORIES}?${queryParams.toString()}`
        : API_ENDPOINTS.CATEGORIES;
      
      console.log('Making API call to:', url);
      const response = await apiClient.get<CategoriesResponse>(url);
      
      console.log('Categories API response:', response);
      return response;
    } catch (error) {
      console.error('Error in CategoriesService.getCategories:', error);
      throw error;
    }
  }

  async getCategoryTree(): Promise<CategoryTreeResponse> {
    try {
      console.log('CategoriesService.getCategoryTree called');
      const response = await apiClient.get<CategoryTreeResponse>(`${API_ENDPOINTS.CATEGORIES}/tree`);
      console.log('Category tree API response:', response);
      return response;
    } catch (error) {
      console.error('Error in CategoriesService.getCategoryTree:', error);
      throw error;
    }
  }

  async getRootCategories(): Promise<CategoriesResponse> {
    try {
      console.log('CategoriesService.getRootCategories called');
      const response = await apiClient.get<CategoriesResponse>(`${API_ENDPOINTS.CATEGORIES}/root`);
      console.log('Root categories API response:', response);
      return response;
    } catch (error) {
      console.error('Error in CategoriesService.getRootCategories:', error);
      throw error;
    }
  }

  async getCategory(id: number): Promise<CategoryResponse> {
    try {
      console.log('CategoriesService.getCategory called with id:', id);
      const response = await apiClient.get<CategoryResponse>(`${API_ENDPOINTS.CATEGORIES}/${id}`);
      console.log('Category API response:', response);
      return response;
    } catch (error) {
      console.error('Error in CategoriesService.getCategory:', error);
      throw error;
    }
  }

  async getCategoryBySlug(slug: string): Promise<CategoryResponse> {
    try {
      console.log('CategoriesService.getCategoryBySlug called with slug:', slug);
      const response = await apiClient.get<CategoryResponse>(`${API_ENDPOINTS.CATEGORIES}/slug/${slug}`);
      console.log('Category by slug API response:', response);
      return response;
    } catch (error) {
      console.error('Error in CategoriesService.getCategoryBySlug:', error);
      throw error;
    }
  }

  async getSubcategories(id: number): Promise<CategoriesResponse> {
    try {
      console.log('CategoriesService.getSubcategories called with id:', id);
      const response = await apiClient.get<CategoriesResponse>(`${API_ENDPOINTS.CATEGORIES}/${id}/subcategories`);
      console.log('Subcategories API response:', response);
      return response;
    } catch (error) {
      console.error('Error in CategoriesService.getSubcategories:', error);
      throw error;
    }
  }
}

export const categoriesService = new CategoriesService();
