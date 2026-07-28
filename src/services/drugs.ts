import api from './api';

export interface Drug {
  id: number;
  name: string;
  genericName: string;
  laboratory: string;
  price: number;
  stock: number;
  category: string;
  requiresPrescription: boolean;
  expirationDate: string;
  isExpired: boolean;
  isActive: boolean;
}

export interface CreateDrugRequest {
  name: string;
  genericName: string;
  laboratory: string;
  price: number;
  stock: number;
  category: string;
  requiresPrescription: boolean;
  expirationDate: string;
}

export interface UpdateDrugRequest {
  id: number;
  name: string;
  genericName: string;
  laboratory: string;
  price: number;
  stock: number;
  category: string;
  requiresPrescription: boolean;
  expirationDate: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const drugsService = {
  // Obtener todos los medicamentos
  getAll: async (params?: { 
    searchTerm?: string; 
    category?: string; 
    requiresPrescription?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<Drug>> => {
    const response = await api.get<PagedResult<Drug>>('/Drugs', { params });
    // Si el backend aún devolviera un array, lo emulamos como PagedResult para evitar fallos
    if (Array.isArray(response.data)) {
      return {
        items: response.data,
        totalCount: response.data.length,
        pageNumber: 1,
        pageSize: response.data.length,
        totalPages: 1
      };
    }
    return response.data;
  },

  // Obtener medicamento por ID
  getById: async (id: number) => {
    const response = await api.get<Drug>(`/Drugs/${id}`);
    return response.data;
  },

  // Crear medicamento
  create: async (data: CreateDrugRequest) => {
    const response = await api.post('/Drugs', data);
    return response.data;
  },

  // ✅ ACTUALIZAR medicamento
  update: async (data: UpdateDrugRequest) => {
    const response = await api.put(`/Drugs/${data.id}`, data);
    return response.data;
  },

  // ✅ ACTUALIZAR stock
  updateStock: async (drugId: number, quantity: number) => {
    const response = await api.patch(`/Drugs/${drugId}/stock`, { drugId, quantity });
    return response.data;
  },

  // ✅ ELIMINAR medicamento (soft delete)
  delete: async (id: number) => {
    const response = await api.delete(`/Drugs/${id}`);
    return response.data;
  },
};