import api from './api';

export interface AuditLog {
  id: number;
  userId: number | null;
  userName?: string;
  action: string;
  entityName: string;
  primaryKey: string;
  oldValues: string | null;
  newValues: string | null;
  timestamp: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const auditService = {
  getAuditLogs: async (pageNumber: number = 1, pageSize: number = 10): Promise<PaginatedResult<AuditLog>> => {
    const response = await api.get<PaginatedResult<AuditLog>>('/AuditLogs', {
      params: { pageNumber, pageSize }
    });
    return response.data;
  },
};
