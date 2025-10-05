// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Shop Types
export interface Shop {
  id: string;
  name: string;
  description: string;
  logo: string;
  contactNumber: string;
  contactNumber2?: string;
  contactEmail: string;
  postalCode?: string;
  blockName?: string;
  district?: string;
}

export interface CreateShopData {
  name: string;
  description: string;
  logo: string;
  contactNumber: string;
  contactNumber2?: string;
  contactEmail: string;
  postalCode?: string;
  blockName?: string;
  district?: string;
}

export interface UpdateShopData extends CreateShopData {
  id: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  expiryDate: string;
  shopId: string;
  qrCode?: string;
  verificationId?: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: string;
  image: string;
  expiryDate: string;
  shopId: string;
  qrCode?: string;
}

export interface UpdateProductData extends CreateProductData {
  id: string;
  verificationId?: string;
}

// Form Submission Types
export interface ShopFormData {
  name: string;
  userId: string;
  description: string;
  logo: string;
  contactNumber: string;
  contactNumber2?: string;
  contactEmail: string;
  postalCode?: string;
  blockName?: string;
  district?: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  image: string;
  expiryDate: string;
  verificationId?: string;
  qrCode?: string;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'message' in error;
}
