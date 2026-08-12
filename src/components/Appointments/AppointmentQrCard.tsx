import React from 'react';
import QRCode from 'react-qr-code';
import { AppointmentDto } from '../../services/appointments';

interface AppointmentQrCardProps {
  appointment: AppointmentDto;
}

/**
 * Paso 4 – Tarjeta de turno con generación de QR nativo en Frontend.
 *
 * Flujo Mejorado:
 * 1. El QR se genera instantáneamente sin consultar al backend,
 *    usando una URL dinámica que abre la validación.
 */
export const AppointmentQrCard: React.FC<AppointmentQrCardProps> = ({ appointment }) => {
  // Usamos REACT_APP_PUBLIC_URL si está configurada (para acceso desde celular en red local),
  // de lo contrario usamos window.location.origin como fallback.
  const baseUrl = process.env.REACT_APP_PUBLIC_URL || window.location.origin;
  const qrUrl = `${baseUrl}/validar-turno/${appointment.id}`;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700 overflow-hidden">
      
      {/* Cabecera */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-base">Turno #{appointment.id}</p>
          <p className="text-blue-100 text-xs mt-0.5">{appointment.sedeName}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
          appointment.status === 3
            ? 'bg-green-100 text-green-700'
            : appointment.status === 4
            ? 'bg-red-100 text-red-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {appointment.statusName}
        </span>
      </div>

      {/* Cuerpo */}
      <div className="p-5 flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-3">
            <div className="border-4 border-blue-100 dark:border-slate-700 rounded-xl p-2 shadow-inner bg-white">
              <QRCode
                value={qrUrl}
                size={180}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-4">
              Abre la cámara de tu celular y escanea este QR oficial para acceder al estado de tu retiro.
            </p>
          </div>
      </div>
    </div>
  );
};

export default AppointmentQrCard;
