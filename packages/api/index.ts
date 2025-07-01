// Export API client
export { apiClient } from "./client";

// Export services
export { authService, AuthService } from "./auth";
export { productsService, ProductsService } from "./products";
export { cartService, CartService } from "./cart";
export { ordersService, OrdersService } from "./orders";
export { paymentService, PaymentService } from "./payment";

// Export service types
export type { CreateOrderRequest } from "./orders";
export type {
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentVerificationRequest,
  PaymentFailureRequest,
  PaymentMethod,
} from "./payment";

// Re-export types from @repo/types for convenience
export type {
  User,
  Product,
  Category,
  Cart,
  CartItem,
  Order,
  OrderItem,
  OrderStatus,
  Address,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ProductListParams,
  PaginatedResponse,
  ApiResponse,
} from "@repo/types";

// Export address service
export { addressService, AddressService } from "./address";
