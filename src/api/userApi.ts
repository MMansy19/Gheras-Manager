import { User } from './types';
import { apiClient } from './authApi';

export interface UsersListResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'admin' | 'supervisor' | 'volunteer';
  status?: boolean;
  telegram_id?: string;
  job_title?: string;
  weekly_hours?: number;
  teams?: number[];
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'supervisor' | 'volunteer';
  status?: boolean;
  telegram_id?: string;
  job_title?: string;
  weekly_hours?: number;
  teams?: number[];
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: boolean;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Get all users with pagination and filtering
export const getUsers = async (params: GetUsersParams = {}): Promise<UsersListResponse> => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const endpoint = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<UsersListResponse>(endpoint);
};

// Get user by ID
export const getUserById = async (id: number): Promise<UserResponse> => {
  return apiClient.get<UserResponse>(`/users/${id}`);
};

// Create new user (admin only)
export const createUser = async (userData: UserCreateRequest): Promise<UserResponse> => {
  return apiClient.post<UserResponse>('/users', userData);
};

// Update user
export const updateUser = async (id: number, userData: UserUpdateRequest): Promise<UserResponse> => {
  return apiClient.put<UserResponse>(`/users/${id}`, userData);
};

// Delete user (admin only)
export const deleteUser = async (id: number): Promise<{ success: boolean; message: string }> => {
  return apiClient.delete<{ success: boolean; message: string }>(`/users/${id}`);
};

// Assign user to team
export const assignUserToTeam = async (userId: number, teamId: number): Promise<{ success: boolean; message: string }> => {
  return apiClient.post<{ success: boolean; message: string }>(`/users/${userId}/teams/${teamId}`, {});
};

// Remove user from team
export const removeUserFromTeam = async (userId: number, teamId: number): Promise<{ success: boolean; message: string }> => {
  return apiClient.delete<{ success: boolean; message: string }>(`/users/${userId}/teams/${teamId}`);
};
