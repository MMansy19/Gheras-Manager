import { Team } from './types';
import { apiClient } from './authApi';

export interface TeamsListResponse {
  success: boolean;
  data: Team[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface TeamResponse {
  success: boolean;
  data: Team & {
    members?: {
      id: number;
      name: string;
      email: string;
      role: string;
      status: boolean;
    }[];
  };
  message?: string;
}

export interface CreateTeamRequest {
  name: string;
  slug: string;
}

export interface UpdateTeamRequest {
  name?: string;
  slug?: string;
}

export interface GetTeamsParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  include_members?: boolean;
}

// Get all teams with pagination and filtering
export const getTeams = async (params: GetTeamsParams = {}): Promise<TeamsListResponse> => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const endpoint = `/teams${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<TeamsListResponse>(endpoint);
};

// Get team by ID
export const getTeamById = async (id: number, includeMembers: boolean = false): Promise<TeamResponse> => {
  const params = includeMembers ? '?include_members=true' : '';
  return apiClient.get<TeamResponse>(`/teams/${id}${params}`);
};

// Create new team (admin only)
export const createTeam = async (teamData: CreateTeamRequest): Promise<TeamResponse> => {
  return apiClient.post<TeamResponse>('/teams', teamData);
};

// Update team
export const updateTeam = async (id: number, teamData: UpdateTeamRequest): Promise<TeamResponse> => {
  return apiClient.put<TeamResponse>(`/teams/${id}`, teamData);
};

// Delete team (admin only)
export const deleteTeam = async (id: number): Promise<{ success: boolean; message: string }> => {
  return apiClient.delete<{ success: boolean; message: string }>(`/teams/${id}`);
};

// Get team members
export const getTeamMembers = async (
  id: number,
  params: { page?: number; limit?: number; role?: string } = {}
): Promise<TeamsListResponse> => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const endpoint = `/teams/${id}/members${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<TeamsListResponse>(endpoint);
};
