import { apiClient } from './client';
import { API_ENDPOINTS } from '@repo/config';
import type { 
  Product, 
  Category, 
  ProductListParams, 
  ProductsResponse,
  ApiResponse
} from '@repo/types';

export class ProductsService {
  async getProducts(params?: ProductListParams): Promise<ProductsResponse> {
    console.log('ProductsService.getProducts called with params:', params);
    
    try {
      const response = await apiClient.get<ProductsResponse>(API_ENDPOINTS.PRODUCTS, {
        params
      });
      
      console.log('Raw API response:', response);
      return response;
    } catch (error) {
      console.error('Error in ProductsService.getProducts:', error);
      throw new Error('Failed to fetch products');
    }
  }

  async getProduct(id: number): Promise<Product> {
    try {
      const response = await apiClient.get<ApiResponse<Product>>(`${API_ENDPOINTS.PRODUCTS}/${id}`);
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid product response structure');
    } catch (error) {
      console.error('Error in ProductsService.getProduct:', error);
      throw new Error('Failed to fetch product');
    }
  }

  async getProductBySlug(slug: string): Promise<Product> {
    try {
      const response = await apiClient.get<ApiResponse<Product>>(`${API_ENDPOINTS.PRODUCTS}/slug/${slug}`);
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid product response structure');
    } catch (error) {
      console.error('Error in ProductsService.getProductBySlug:', error);
      throw new Error('Failed to fetch product');
    }
  }

  async searchProducts(query: string, params?: Omit<ProductListParams, 'search'>): Promise<ProductsResponse> {
    try {
      const response = await apiClient.get<ProductsResponse>(`${API_ENDPOINTS.PRODUCTS}/search`, {
        params: { ...params, search: query }
      });
      
      return response;
    } catch (error) {
      console.error('Error in ProductsService.searchProducts:', error);
      throw new Error('Failed to search products');
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<ApiResponse<Category[]>>(API_ENDPOINTS.CATEGORIES);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      }
      
      throw new Error('Invalid categories response structure');
    } catch (error) {
      console.error('Error in ProductsService.getCategories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  async getCategoryTree(): Promise<Category[]> {
    try {
      const response = await apiClient.get<ApiResponse<Category[]>>(`${API_ENDPOINTS.CATEGORIES}/tree`);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      }
      
      throw new Error('Invalid category tree response structure');
    } catch (error) {
      console.error('Error in ProductsService.getCategoryTree:', error);
      throw new Error('Failed to fetch category tree');
    }
  }

  async getCategory(id: number): Promise<Category> {
    try {
      const response = await apiClient.get<ApiResponse<Category>>(`${API_ENDPOINTS.CATEGORIES}/${id}`);
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid category response structure');
    } catch (error) {
      console.error('Error in ProductsService.getCategory:', error);
      throw new Error('Failed to fetch category');
    }
  }
}

export const productsService = new ProductsService();
