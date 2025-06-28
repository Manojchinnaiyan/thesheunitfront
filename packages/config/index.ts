// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'Enterprise Ecommerce',
  VERSION: '1.0.0',
  DESCRIPTION: 'Modern ecommerce platform',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  CART: 'cart',
  THEME: 'theme',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  PROFILE: '/auth/profile',
  
  // Product endpoints
  PRODUCTS: '/products',
  CATEGORIES: '/products/categories',
  
  // Cart endpoints
  CART: '/cart',
  CART_ITEMS: '/cart/items',
  
  // Order endpoints
  ORDERS: '/orders',
  
  // User endpoints
  USER_ADDRESSES: '/users/addresses',
} as const;

// Environment helpers
export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';
