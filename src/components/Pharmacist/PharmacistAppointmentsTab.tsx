import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { appointmentsService, AppointmentDto } from '../../services/appointments';
import { useDrugiStore } from '../../store/useDrugiStore';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const COLUMNS = [
  { id: 1, title: 'Recibido', color: '#3b82f6', bg: '#eff6ff' },
  { id: 2, title: 'En Proceso', color: '#f59e0b', bg: '#fffbeb' },
  { id: 3, title: 'Entregado', color: '#10b981', bg: '#ecfdf5' },
  { id: 4, title: 'Cancelado', color: '#ef4444', bg: '#fef2f2' },
];

const PharmacistAppointmentsTab: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { showMessage } = useDrugiStore();

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await appointmentsService.getAll();
      setAppointments(data);
    } catch { toast.error('Error cargando turnos'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const aptId = Number(draggableId);
    const newStatusId = Number(destination.droppableId);

    // Optimistic UI update
    const previousAppointments = [...appointments];
    setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: newStatusId } : a));

    try {
      await appointmentsService.updateStatus(aptId, newStatusId);
      toast.success('Estado actualizado');
      if (newStatusId === 3) {
        showMessage(`¡Excelente! Has entregado el turno #${aptId}. 🎉`, 'feliz');
      }
    } catch (err: any) {
      toast.error('Error al actualizar estado');
      setAppointments(previousAppointments); // Revert
    }
  };

  if (loading) return <p className="text-slate-500 dark:text-slate-400">Cargando tablero...</p>;

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 m-0">Tablero de Despacho</h2>
        <button onClick={loadAppointments} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-4 py-2 cursor-pointer font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          🔄 Actualizar
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => {
            const colAppointments = appointments.filter(a => a.status === col.id);
            return (
              <div key={col.id} className="flex-1 min-w-[280px] flex flex-col bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full" style={{ background: col.color }} />
                  <h3 className="m-0 text-base font-bold text-slate-700 dark:text-slate-200">{col.title}</h3>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: col.bg, color: col.color }}>
                    {colAppointments.length}
                  </span>
                </div>
                
                <Droppable droppableId={String(col.id)}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-grow min-h-[150px] p-2 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-slate-100 dark:bg-slate-800/50' : 'bg-transparent'}`}
                    >
                      {colAppointments.map((apt, index) => (
                        <Draggable key={apt.id} draggableId={String(apt.id)} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`select-none p-4 mb-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-transform ${snapshot.isDragging ? 'bg-white dark:bg-slate-800 shadow-xl scale-105' : 'bg-white dark:bg-slate-800 shadow-sm'}`}
                              style={{
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div className="flex justify-between mb-2">
                                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Turno #{apt.id}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(apt.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="m-0 mb-2 text-sm text-slate-600 dark:text-slate-300">👤 {apt.userName}</p>
                              <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/50 p-2 rounded-md">
                                {apt.details.map(d => `${d.drugName} (x${d.quantity})`).join(', ')}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default PharmacistAppointmentsTab;
