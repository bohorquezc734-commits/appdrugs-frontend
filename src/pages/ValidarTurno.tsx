import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentsService, AppointmentDto } from '../services/appointments';

export const ValidarTurno: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const data = await appointmentsService.getById(Number(id));
        setAppointment(data);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'No se pudo cargar la información del turno. Asegúrate de estar autenticado o verifica el ID.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id]);

  const getStatusIcon = (status: number) => {
    const svgClass = "w-12 h-12 ";
    switch (status) {
      case 1: 
        return (
          <svg className={svgClass + "text-yellow-500"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 2: 
        return (
          <svg className={svgClass + "text-blue-500"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 3: 
        return (
          <svg className={svgClass + "text-green-500"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 4: 
        return (
          <svg className={svgClass + "text-red-500"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default: 
        return (
          <svg className={svgClass + "text-gray-500"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 3: return 'bg-green-100 text-green-800 border-green-200';
      case 4: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-400 font-semibold animate-pulse">Validando código oficial...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border-t-8 border-rose-500">
          <svg className="text-rose-500 w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Turno Inválido</h2>
          <p className="text-slate-500 mb-8">{error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative">
        
        {/* Cabecera / Banner */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-10 rounded-tr-full"></div>
          
          <div className="relative z-10 flex justify-center mb-4">
             {getStatusIcon(appointment.status)}
          </div>
          <h1 className="relative z-10 text-white text-3xl font-black tracking-tight drop-shadow-md">
            TURNO #{appointment.id}
          </h1>
          <div className="relative z-10 mt-3 flex justify-center">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm backdrop-blur-md bg-white/90 ${
              appointment.status === 3 ? 'text-green-700 border-green-300' :
              appointment.status === 4 ? 'text-red-700 border-red-300' :
              'text-blue-700 border-blue-300'
            }`}>
              {appointment.statusName.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Información Principal */}
        <div className="p-8">
          
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <svg className="text-emerald-500 text-3xl mt-1 w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div>
                <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Sede Asignada</p>
                <p className="font-semibold text-slate-800 text-lg">{appointment.sedeName}</p>
                <p className="text-sm text-slate-500">Acércate a esta sucursal para la entrega.</p>
              </div>
            </div>

            <div>
              <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
                <svg className="text-slate-400 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg> Detalle de Medicamentos
              </h3>
              <ul className="space-y-3">
                {appointment.details.map((detail) => (
                  <li key={detail.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <span className="font-medium text-slate-700 truncate mr-2">{detail.drugName}</span>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                      {detail.quantity} un.
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-dashed border-slate-200 text-center">
            <p className="text-slate-400 text-xs mb-1">Emitido el {new Date(appointment.createdAt).toLocaleDateString()}</p>
            <p className="text-slate-600 font-bold tracking-wide">COMPROBANTE OFICIAL DE APPDRUGS</p>
          </div>
          
        </div>
      </div>
    </div>
  );
};
