import { User } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Types for API responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    expires_in: number;
    user: User;
  };
  message?: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    token: string;
    expires_in: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any[];
  };
}

// HTTP client with interceptors
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    return sessionStorage.getItem('authToken');
  }

  private setAuthToken(token: string): void {
    sessionStorage.setItem('authToken', token);
  }

  private removeAuthToken(): void {
    sessionStorage.removeItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          ...data,
        };
      }

      return data;
    } catch (error: any) {
      if (error.status === 401) {
        // Token expired or invalid, redirect to login
        this.removeAuthToken();
        sessionStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw error;
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success) {
      this.setAuthToken(response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout(): Promise<LogoutResponse> {
    try {
      const response = await this.request<LogoutResponse>('/auth/logout', {
        method: 'POST',
      });
      this.removeAuthToken();
      sessionStorage.removeItem('user');
      return response;
    } catch (error) {
      // Even if logout fails on server, clear local state
      this.removeAuthToken();
      sessionStorage.removeItem('user');
      throw error;
    }
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await this.request<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
    });

    if (response.success) {
      this.setAuthToken(response.data.token);
    }

    return response;
  }

  // Generic methods for other endpoints
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  // Get current user from sessionStorage
  getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_URL);

// Export individual auth methods for convenience
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.login({ email, password }),

  logout: () => apiClient.logout(),

  refreshToken: () => apiClient.refreshToken(),

  isAuthenticated: () => apiClient.isAuthenticated(),

  getCurrentUser: () => apiClient.getCurrentUser(),
};
