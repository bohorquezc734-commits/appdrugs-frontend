import React, { useEffect, useState } from 'react';
import { useMyAppointments } from '../../hooks/useAppointments';
import { AppointmentDto } from '../../services/appointments';
import { AppointmentSkeleton } from '../Common/AppointmentSkeleton';
import { ErrorBoundary } from '../Common/ErrorBoundary';
import { AppointmentQrCard } from '../Appointments/AppointmentQrCard';
import Lottie from 'lottie-react';

const STATUS_LABELS: Record<number, { label: string; color: string; bg: string; border: string }> = {
  1: { label: 'Recibido',   color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  2: { label: 'En Proceso', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  3: { label: 'Entregado',  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  4: { label: 'Cancelado',  color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
};

interface MyAppointmentsTabProps {
  onCreateNewClick: () => void;
  isActive: boolean;
}

const MyAppointmentsTab: React.FC<MyAppointmentsTabProps> = ({ onCreateNewClick, isActive }) => {
  const { 
    data: appointments = [], 
    isLoading: loadingAppts, 
    isError: isErrorAppts,
    error: apptsError,
    refetch: refetchAppts
  } = useMyAppointments();

  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [emptyAnimData, setEmptyAnimData] = useState<any>(null);

  useEffect(() => {
    fetch('https://assets3.lottiefiles.com/packages/lf20_r0d3m5z3.json')
      .then(res => res.json())
      .then(data => setEmptyAnimData(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isActive) {
      refetchAppts();
    }
  }, [isActive, refetchAppts]);

  const filteredAppointments = appointments.filter((apt: AppointmentDto) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return apt.status === 1 || apt.status === 2;
    if (filter === 'COMPLETED') return apt.status === 3;
    if (filter === 'CANCELLED') return apt.status === 4;
    return true;
  });

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Mis Turnos</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Historial de tus pedidos y estado de entrega.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-700 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto w-full md:w-auto hide-scrollbar">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'PENDING', label: 'Pendientes' },
              { id: 'COMPLETED', label: 'Entregados' },
              { id: 'CANCELLED', label: 'Cancelados' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  filter === f.id 
                    ? 'bg-white dark:bg-slate-900 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700/50 dark:border-slate-600' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button 
            onClick={() => refetchAppts()} 
            className="hidden md:flex px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refrescar
          </button>
        </div>
      </div>

      <ErrorBoundary>
        {(() => {
          if (loadingAppts) {
            return (
              <div className="space-y-4">
                <AppointmentSkeleton />
                <AppointmentSkeleton />
                <AppointmentSkeleton />
              </div>
            );
          }

          if (isErrorAppts) {
            throw apptsError || new Error('Ocurrió un error al cargar tus turnos');
          }

          if (filteredAppointments.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 shadow-sm">
                {emptyAnimData ? (
                  <Lottie animationData={emptyAnimData} style={{ width: 200, height: 200 }} />
                ) : (
                  <div className="text-7xl mb-4">📭</div>
                )}
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  {filter === 'ALL' ? 'Aún no tienes turnos' : 'No hay turnos en este estado'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">
                  {filter === 'ALL' 
                    ? 'Explora el catálogo de medicamentos y crea tu primer turno para retirarlo en tu sede más cercana.'
                    : 'Intenta cambiar los filtros para ver otros turnos en tu historial.'}
                </p>
                {filter === 'ALL' && (
                  <button 
                    onClick={onCreateNewClick}
                    className="px-8 py-3.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Crear mi primer turno
                  </button>
                )}
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredAppointments.map((apt: AppointmentDto) => {
                const statusInfo = STATUS_LABELS[apt.status] || { label: apt.statusName, color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-700', border: 'border-slate-200 dark:border-slate-700' };
                
                return (
                  <div key={apt.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-emerald-100 dark:hover:border-emerald-500/50 transition-all duration-200 flex flex-col h-full relative overflow-hidden">
                    
                    {/* Decorative accent based on status */}
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${statusInfo.bg.replace('50', '400')}`} />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="pl-2">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">Turno #{apt.id}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.border} ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                          {apt.sedeName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 dark:text-slate-400 font-medium uppercase tracking-wider mb-0.5">Fecha de Creación</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {new Date(apt.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {apt.details && apt.details.length > 0 && (
                      <div className="pl-2 mt-2 mb-5">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Medicamentos Solicitados</p>
                        <div className="flex flex-wrap gap-2">
                          {apt.details.map((d: any) => (
                            <span key={d.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold">
                              <span className="text-emerald-600 font-black">{d.quantity}x</span> {d.drugName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {apt.observaciones && (
                      <div className="pl-2 mt-auto mb-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-3 flex gap-2">
                          <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">{apt.observaciones}</p>
                        </div>
                      </div>
                    )}

                    {apt.fechaEntrega && (
                      <div className="pl-2 mt-auto mb-4">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-3 flex gap-2 items-center">
                          <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-bold">
                            Entregado el: {new Date(apt.fechaEntrega).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* QR Component */}
                    <div className="mt-auto pt-5 border-t border-slate-100 dark:border-slate-700 pl-2">
                      <AppointmentQrCard appointment={apt} />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </ErrorBoundary>
    </div>
  );
};

export default MyAppointmentsTab;
