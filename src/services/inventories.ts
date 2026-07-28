import api from './api';

export interface InventoryDto {
  id: number;
  drugId: number;
  drugName: string;
  gestorFarmaceuticoId: number;
  sedeName: string;
  quantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateInventoryRequest {
  drugId: number;
  gestorFarmaceuticoId: number;
  quantity: number;
}

export const inventoriesService = {
  getAll: async (params?: { 
    gestorFarmaceuticoId?: number; 
    onlyActive?: boolean; 
    onlyLowStock?: boolean;
    page?: number; 
    pageSize?: number;
  }) => {
    const response = await api.get<InventoryDto[]>('/Inventories', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<InventoryDto>(`/Inventories/${id}`);
    return response.data;
  },

  create: async (data: CreateInventoryRequest) => {
    const response = await api.post('/Inventories', data);
    return response.data;
  },

  addStock: async (id: number, quantity: number) => {
    const response = await api.patch(`/Inventories/${id}/add-stock`, { inventoryId: id, quantity });
    return response.data;
  },

  removeStock: async (id: number, quantity: number) => {
    const response = await api.patch(`/Inventories/${id}/remove-stock`, { inventoryId: id, quantity });
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/Inventories/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/Inventories/${id}`);
    return response.data;
  }
};
