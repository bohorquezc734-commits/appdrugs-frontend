import api from './api';
import { PagedResult } from './drugs';

export interface AppointmentDetailDto {
  id: number;
  appointmentId: number;
  inventoryId: number;
  drugName: string;
  quantity: number;
  createdAt: string;
}

export interface AppointmentDto {
  id: number;
  userId: number;
  userName: string;
  gestorFarmaceuticoId: number;
  sedeName: string;
  status: number;
  statusName: string;
  archivoNombre?: string;
  createdAt: string;
  fechaEntrega?: string;
  observaciones?: string;
  isActive: boolean;
  details: AppointmentDetailDto[];
  /** Base64 del QR generado – se puebla tras llamar a POST /appointments/{id}/qr */
  qrCodeBase64?: string;
}


export interface CreateAppointmentDetailRequest {
  inventoryId: number;
  quantity: number;
}

export const appointmentsService = {
  // Obtener mis turnos (usuario autenticado)
  getMyAppointments: async (): Promise<PagedResult<AppointmentDto>> => {
    const response = await api.get<any>('/Appointments/mis-turnos');
    if (Array.isArray(response.data)) {
      return { items: response.data, totalCount: response.data.length, pageNumber: 1, pageSize: response.data.length, totalPages: 1 };
    }
    return response.data;
  },

  // Obtener todos los turnos (Admin/Pharmacist)
  getAll: async (): Promise<PagedResult<AppointmentDto>> => {
    const response = await api.get<any>('/Appointments');
    if (Array.isArray(response.data)) {
      return { items: response.data, totalCount: response.data.length, pageNumber: 1, pageSize: response.data.length, totalPages: 1 };
    }
    return response.data;
  },

  // Obtener un turno específico por ID
  getById: async (id: number): Promise<AppointmentDto> => {
    const response = await api.get<AppointmentDto>(`/Appointments/${id}`);
    return response.data;
  },

  // Crear turno con FormData (soporta archivo adjunto)
  create: async (
    gestorFarmaceuticoId: number,
    details: CreateAppointmentDetailRequest[],
    archivo?: File
  ): Promise<{ appointmentId: number }> => {
    const formData = new FormData();
    formData.append('GestorFarmaceuticoId', gestorFarmaceuticoId.toString());

    details.forEach((d, i) => {
      formData.append(`Details[${i}].InventoryId`, d.inventoryId.toString());
      formData.append(`Details[${i}].Quantity`, d.quantity.toString());
    });

    if (archivo) {
      formData.append('file', archivo);
    }

    const response = await api.post<{ appointmentId: number }>('/Appointments', formData, {
      headers: {
        'Content-Type': undefined
      }
    });
    return response.data;
  },

  // Actualizar estado del turno (Admin/Pharmacist)
  // El backend espera: { AppointmentId, NewStatus } (UpdateAppointmentStatusCommand)
  updateStatus: async (id: number, status: number) => {
    const response = await api.patch(`/Appointments/${id}/status`, { appointmentId: id, newStatus: status });
    return response.data;
  },

  /**
   * Paso 2 – Genera el código QR de un turno.
   * POST /api/appointments/{id}/qr
   * El JWT ya va inyectado por el interceptor de api.ts.
   * Retorna el QR en Base64 (string plano, sin prefijo data:image).
   */
  generateQr: async (appointmentId: number): Promise<string> => {
    const response = await api.post<{ qrBase64: string }>(
      `/Appointments/${appointmentId}/qr`
    );
    return response.data.qrBase64;
  },

  // Descargar la receta médica adjunta al turno
  downloadFile: async (id: number, fileName: string) => {
    try {
      const response = await api.get(`/Appointments/${id}/archivo`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      throw new Error("El archivo no pudo ser descargado. Es posible que esté corrupto o haya sido eliminado.");
    }
  },
};

