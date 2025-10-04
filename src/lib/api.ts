import axios from 'axios';
import { 
  ApiResponse, 
  Shop, 
  CreateShopData, 
  UpdateShopData, 
  Product, 
  CreateProductData, 
  UpdateProductData 
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to signin
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signin: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: { id: string; name: string; email: string; avatar: string } }>> => {
    const response = await api.post('/auth/signin', { email, password });
    return response.data;
  },
};

// Shop API
export const shopAPI = {
  getAll: async (): Promise<ApiResponse<Shop[]>> => {
    const response = await api.get('/shop/');
    return response.data;
  },
  create: async (shopData: CreateShopData): Promise<ApiResponse<Shop>> => {
    const response = await api.post('/shop/create', shopData);
    return response.data;
  },
  update: async (shopData: UpdateShopData): Promise<ApiResponse<Shop>> => {
    const response = await api.put('/shop/', shopData);
    return response.data;
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/shop/delete/${id}`);
    return response.data;
  },
};

// Product API
export const productAPI = {
  getByShop: async (shopId: string): Promise<ApiResponse<Product[]>> => {
    const response = await api.get(`/product/${shopId}`);
    return response.data;
  },
  create: async (productData: CreateProductData): Promise<ApiResponse<Product>> => {
    const response = await api.post('/product/create', productData);
    return response.data;
  },
  update: async (productData: UpdateProductData): Promise<ApiResponse<Product>> => {
    const response = await api.put('/product/update', productData);
    return response.data;
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/product/delete/${id}`);
    return response.data;
  },
};

export default api;
