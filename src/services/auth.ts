import api from './api';
import { APP_CONSTANTS } from '../constants/appConstants';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role?: string;
}

export interface LoginResponse {
  userId: number;
  fullName: string;
  role: string;
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/Auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post('/Auth/register', data);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/Auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER);
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
    window.location.href = '/login';
  },

  getToken: () => null,
  
  getUser: () => {
    const user = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => !!localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USER),

  // 🔐 MÉTODOS DE ROLES
  getUserRole: () => {
    const user = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USER);
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return parsed.role || null;
      } catch {
        return null;
      }
    }
    return null;
  },

  isAdmin: () => {
    return authService.getUserRole() === APP_CONSTANTS.ROLES.ADMIN;
  },

  isPharmacist: () => {
    return authService.getUserRole() === APP_CONSTANTS.ROLES.PHARMACIST;
  },

  isUser: () => {
    return authService.getUserRole() === APP_CONSTANTS.ROLES.USER;
  },

  hasRole: (role: string) => {
    return authService.getUserRole() === role;
  },

  canEditDrugs: () => {
    const userRole = authService.getUserRole();
    return userRole === APP_CONSTANTS.ROLES.ADMIN;
  },

  canManageSedes: () => {
    const userRole = authService.getUserRole();
    return userRole === APP_CONSTANTS.ROLES.ADMIN;
  },

  canViewReports: () => {
    const userRole = authService.getUserRole();
    return userRole === APP_CONSTANTS.ROLES.ADMIN || userRole === APP_CONSTANTS.ROLES.PHARMACIST;
  },

  canUpdateStock: () => {
    const userRole = authService.getUserRole();
    return userRole === APP_CONSTANTS.ROLES.ADMIN || userRole === APP_CONSTANTS.ROLES.PHARMACIST;
  },

  updateProfile: async (fullName: string) => {
    const response = await api.put('/Auth/me/profile', { fullName });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/Auth/me/password', { currentPassword, newPassword });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/Auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email: string, token: string, newPassword: string) => {
    const response = await api.post('/Auth/reset-password', { email, token, newPassword });
    return response.data;
  }
};