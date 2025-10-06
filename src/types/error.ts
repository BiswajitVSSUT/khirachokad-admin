interface AuthError {
  message : string;
  response : {
    data : {
    status ?: boolean;
    message ?: string;
    error ?: string
  }}
}

// Type guard function
export function isAuthError(error: unknown): error is AuthError {
  return typeof error === 'object' && error !== null && 'response' in error;
}

interface ProductError {
  message: string;
}

export function isProductError(error: unknown): error is ProductError {
  return typeof error === 'object' && error !== null && 'message' in error;
}