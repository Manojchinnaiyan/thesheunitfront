import { apiClient } from './client';
import { API_ENDPOINTS, STORAGE_KEYS } from '@repo/config';
import type { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  ApiResponse 
} from '@repo/types';

export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.LOGIN, credentials);
      
      if (response.data) {
        // Store tokens and user data
        apiClient.setTokens(response.data.access_token, response.data.refresh_token);
        this.setUser(response.data.user);
        return response.data;
      }
      
      throw new Error(response.error || 'Login failed');
    } catch (error: any) {
      console.error('AuthService login error:', error);
      
      // Handle different error formats
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed. Please check your credentials.');
      }
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.REGISTER, userData);
      
      if (response.data) {
        // Store tokens and user data
        apiClient.setTokens(response.data.access_token, response.data.refresh_token);
        this.setUser(response.data.user);
        return response.data;
      }
      
      throw new Error(response.error || 'Registration failed');
    } catch (error: any) {
      console.error('AuthService register error:', error);
      
      // Handle different error formats
      if (error.response?.data?.details) {
        throw new Error(error.response.data.details);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Even if logout fails on server, clear local data
      console.warn('Logout request failed:', error);
    } finally {
      this.clearAuthData();
    }
  }

  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.PROFILE);
    
    if (response.data) {
      this.setUser(response.data);
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get profile');
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(API_ENDPOINTS.PROFILE, userData);
    
    if (response.data) {
      this.setUser(response.data);
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to update profile');
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  private setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  private clearAuthData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
}

export const authService = new AuthService();
