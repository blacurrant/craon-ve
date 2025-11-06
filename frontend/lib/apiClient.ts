// lib/apiClient.ts
"use client";

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  onUnauthorized?: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refresh_token";

// ============================================================================
// Error Handler
// ============================================================================

class ApiErrorHandler {
  static parse(error: AxiosError): ApiError {
    if (error.response) {
      const { data, status } = error.response;
      
      // Handle Flask error responses
      if (typeof data === "object" && data !== null) {
        const errorData = data as any;
        
        // Standard Flask error format
        if (errorData.message || errorData.error) {
          return {
            message: errorData.message || errorData.error,
            status,
            errors: errorData.errors,
          };
        }
        
        // Validation errors
        if (errorData.errors && typeof errorData.errors === "object") {
          const firstError = Object.values(errorData.errors)[0];
          return {
            message: Array.isArray(firstError) ? firstError[0] : "Validation error",
            status,
            errors: errorData.errors,
          };
        }
      }
      
      // Default error messages by status code
      const statusMessages: Record<number, string> = {
        400: "Bad request. Please check your input.",
        401: "Unauthorized. Please log in again.",
        403: "Access forbidden. You don't have permission.",
        404: "Resource not found.",
        409: "Conflict. Resource already exists.",
        422: "Validation error. Please check your input.",
        429: "Too many requests. Please try again later.",
        500: "Internal server error. Please try again.",
        502: "Bad gateway. Service temporarily unavailable.",
        503: "Service unavailable. Please try again later.",
      };
      
      return {
        message: statusMessages[status] || `Request failed with status ${status}`,
        status,
      };
    }
    
    if (error.request) {
      return {
        message: "No response from server. Please check your connection.",
        status: 0,
      };
    }
    
    return {
      message: error.message || "An unexpected error occurred.",
      status: 0,
    };
  }
}

// ============================================================================
// Token Manager
// ============================================================================

class TokenManager {
  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  static setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  static clearTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}

// ============================================================================
// API Client Class
// ============================================================================

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];
  private onUnauthorized?: () => void;

  constructor(config: ApiClientConfig = {}) {
    this.onUnauthorized = config.onUnauthorized;

    this.client = axios.create({
      baseURL: config.baseURL || BASE_URL,
      timeout: config.timeout || DEFAULT_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = TokenManager.getToken();
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => this.client(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = TokenManager.getRefreshToken();
            
            if (refreshToken) {
              // Attempt to refresh the token
              const response = await axios.post(
                `${BASE_URL}/auth/refresh`,
                { refresh_token: refreshToken }
              );

              const { access_token } = response.data;
              TokenManager.setToken(access_token);

              // Retry all queued requests
              this.failedQueue.forEach(({ resolve }) => resolve());
              this.failedQueue = [];

              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];
            
            TokenManager.clearTokens();
            
            if (this.onUnauthorized) {
              this.onUnauthorized();
            }
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
          console.error("Access forbidden:", error.response.data);
        }

        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // HTTP Methods
  // ============================================================================

  async get<T = any>(url: string, config = {}): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.parse(error as AxiosError);
    }
  }

  async post<T = any>(url: string, data?: any, config = {}): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.parse(error as AxiosError);
    }
  }

  async put<T = any>(url: string, data?: any, config = {}): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.parse(error as AxiosError);
    }
  }

  async patch<T = any>(url: string, data?: any, config = {}): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.parse(error as AxiosError);
    }
  }

  async delete<T = any>(url: string, config = {}): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw ApiErrorHandler.parse(error as AxiosError);
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  setAuthToken(token: string): void {
    TokenManager.setToken(token);
  }

  setRefreshToken(token: string): void {
    TokenManager.setRefreshToken(token);
  }

  clearAuth(): void {
    TokenManager.clearTokens();
  }

  getAuthToken(): string | null {
    return TokenManager.getToken();
  }

  isAuthenticated(): boolean {
    const token = TokenManager.getToken();
    if (!token) return false;
    return !TokenManager.isTokenExpired(token);
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

let apiClientInstance: ApiClient | null = null;

export function getApiClient(config?: ApiClientConfig): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient(config);
  }
  return apiClientInstance;
}

// Default export for convenience
const api = getApiClient();
export default api;

// Export helper function for easy usage
export const apiFetch = {
  get: <T = any>(url: string, config = {}) => api.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config = {}) => api.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config = {}) => api.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config = {}) => api.patch<T>(url, data, config),
  delete: <T = any>(url: string, config = {}) => api.delete<T>(url, config),
};

// Export types
export type { ApiError, ApiClientConfig };