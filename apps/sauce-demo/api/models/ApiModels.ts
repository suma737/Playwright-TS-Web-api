/**
 * API models for Sauce Demo API interactions
 */

// Authentication models
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  userId?: string;
  success: boolean;
  message?: string;
}

// Product models
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface ProductsResponse {
  products: Product[];
}

// Cart models
export interface CartItem {
  productId: number;
  quantity: number;
}

export interface CartRequest {
  items: CartItem[];
}

export interface CartResponse {
  cartId: string;
  items: CartItem[];
  totalPrice: number;
}

// Order models
export interface OrderRequest {
  cartId: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    postalCode: string;
  };
}

export interface OrderResponse {
  orderId: string;
  success: boolean;
  message?: string;
}

// API Error model
export interface ApiError {
  statusCode: number;
  message: string;
  details?: string;
}
