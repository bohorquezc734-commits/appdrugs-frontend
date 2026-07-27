import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { appointmentsService, AppointmentDto } from '../../services/appointments';
import { AppointmentQrCard } from '../Appointments/AppointmentQrCard';
import { CustomDialog } from '../Common/CustomDialog';
import { useDrugiStore } from '../../store/useDrugiStore';

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Recibido', color: '#3b82f6' },
  2: { label: 'En Proceso', color: '#f59e0b' },
  3: { label: 'Entregado', color: '#10b981' },
  4: { label: 'Cancelado', color: '#ef4444' },
};

const AdminAppointmentsTab: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const { showMessage } = useDrugiStore();

  const [statusModal, setStatusModal] = useState<{ open: boolean; aptId: number; current: number }>({
    open: false, aptId: 0, current: 1,
  });
  const [newStatus, setNewStatus] = useState<number>(1);
  
  const loadAppointments = useCallback(async () => {
    try {
      setLoadingAppointments(true);
      const data = await appointmentsService.getAll();
      setAppointments(data);
    } catch { toast.error('Error cargando turnos'); }
    finally { setLoadingAppointments(false); }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const openStatusModal = (id: number, current: number) => {
    setNewStatus(current);
    setStatusModal({ open: true, aptId: id, current });
  };

  const confirmChangeStatus = async () => {
    if (![1,2,3,4].includes(newStatus)) { toast.warn('Estado inválido'); return; }
    try {
      await appointmentsService.updateStatus(statusModal.aptId, newStatus);
      toast.success('Estado actualizado');
      showMessage(`¡Listo! El turno #${statusModal.aptId} ha sido actualizado correctamente. 👍`, 'feliz');
      setStatusModal(s => ({ ...s, open: false }));
      loadAppointments();
    } catch (err: any) {
      toast.error('Error al actualizar estado');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Supervisión de Turnos</h2>
        <button onClick={loadAppointments} className="bg-white dark:bg-slate-900 border rounded-lg px-4 py-2 hover:bg-gray-50 dark:bg-gray-800 transition shadow-sm font-bold text-gray-700 dark:text-gray-200">🔄 Actualizar</button>
      </div>

      {loadingAppointments ? <p>Cargando...</p> : (
        <div className="grid gap-4">
          {appointments.map(apt => {
            const statusInfo = STATUS_LABELS[apt.status] || { label: apt.statusName, color: '#64748b' };
            return (
              <div key={apt.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border-l-4 transition hover:shadow-md" style={{ borderColor: statusInfo.color }}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Turno #{apt.id} - Sede: {apt.sedeName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Usuario: {apt.userName} | Creado: {new Date(apt.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-sm font-bold text-white shadow-sm" style={{ background: statusInfo.color }}>
                      {statusInfo.label}
                    </span>
                    <button onClick={() => openStatusModal(apt.id, apt.status)} style={{ display:'block', marginTop:8, background:'none', border:'none', fontSize:13, color:'#2563eb', cursor:'pointer', fontWeight:600, textDecoration:'underline', marginLeft:'auto' }}>
                      Cambiar Estado
                    </button>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <strong>Medicamentos:</strong> {apt.details.map(d => `${d.drugName} (x${d.quantity})`).join(', ')}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                  <div className="w-full max-w-sm">
                    <AppointmentQrCard appointment={apt} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CustomDialog
        isOpen={statusModal.open}
        title="Cambiar estado del turno"
        icon="📋"
        iconBg="#eff6ff"
        confirmLabel="Actualizar"
        confirmColor="#2563eb"
        onConfirm={confirmChangeStatus}
        onCancel={() => setStatusModal(s => ({ ...s, open: false }))}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[{v:1,l:'Recibido',c:'#3b82f6'},{v:2,l:'En Proceso',c:'#f59e0b'},{v:3,l:'Entregado',c:'#10b981'},{v:4,l:'Cancelado',c:'#ef4444'}].map(opt => (
            <button key={opt.v} onClick={() => setNewStatus(opt.v)} style={{
              padding:'10px 14px', borderRadius:10, border:'none', cursor:'pointer',
              background: newStatus === opt.v ? opt.c + '18' : '#f8fafc',
              color: newStatus === opt.v ? opt.c : '#475569',
              fontWeight: newStatus === opt.v ? 700 : 500,
              fontSize:14, textAlign:'left', display:'flex', alignItems:'center', gap:8,
              outline: newStatus === opt.v ? `2px solid ${opt.c}` : '2px solid transparent',
              transition:'all 0.15s',
            }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:opt.c, flexShrink:0 }} />
              {opt.l}
            </button>
          ))}
        </div>
      </CustomDialog>
    </div>
  );
};

export default AdminAppointmentsTab;
