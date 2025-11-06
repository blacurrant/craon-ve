// lib/authService.ts
"use client";

import api from "./apiClient";
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  created_at?: string;
}

// ============================================================================
// Auth Service
// ============================================================================

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", {
      username: email,
      password,
    });

    api.setAuthToken(response.access_token);
    if (response.refresh_token) {
      api.setRefreshToken(response.refresh_token);
    }

    return response;
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/signup", data);

    // Store tokens
    api.setAuthToken(response.access_token);
    if (response.refresh_token) {
      api.setRefreshToken(response.refresh_token);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint if available
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear tokens regardless of backend response
      api.clearAuth();
    }
  }

  async getProfile(): Promise<User> {
    return api.get<User>("/auth/profile");
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return api.put<User>("/auth/profile", data);
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return api.post("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return api.post("/auth/forgot-password", { email });
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return api.post("/auth/reset-password", {
      token,
      password: newPassword,
    });
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return api.post("/auth/verify-email", { token });
  }

  async refreshToken(): Promise<{ access_token: string }> {
    const refreshToken = api.getAuthToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await api.post<{ access_token: string }>("/auth/refresh", {
      refresh_token: refreshToken,
    });

    api.setAuthToken(response.access_token);
    return response;
  }

  isAuthenticated(): boolean {
    return api.isAuthenticated();
  }

  getToken(): string | null {
    return api.getAuthToken();
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;