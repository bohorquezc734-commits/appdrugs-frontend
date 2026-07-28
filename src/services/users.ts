import api from './api';

export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export const usersService = {
  getAll: async (): Promise<UserDto[]> => {
    const response = await api.get<UserDto[]>('/Auth/users');
    return response.data;
  },

  changeRole: async (id: number, role: string) => {
    const response = await api.put(`/Auth/users/${id}/role`, { role });
    return response.data;
  },

  toggleStatus: async (id: number, isActive: boolean) => {
    const response = await api.patch(`/Auth/users/${id}/status`, { isActive });
    return response.data;
  },
};
