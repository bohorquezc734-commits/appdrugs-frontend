import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { appointmentsService, AppointmentDto } from '../../services/appointments';
import { useDrugiStore } from '../../store/useDrugiStore';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import QrScannerModal from './QrScannerModal';

const COLUMNS = [
  { id: 1, title: 'Recibido', color: '#3b82f6', bg: '#eff6ff' },
  { id: 2, title: 'En Proceso', color: '#f59e0b', bg: '#fffbeb' },
  { id: 3, title: 'Entregado', color: '#10b981', bg: '#ecfdf5' },
  { id: 4, title: 'Cancelado', color: '#ef4444', bg: '#fef2f2' },
];

const PharmacistAppointmentsTab: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const { showMessage } = useDrugiStore();

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await appointmentsService.getAll();
      setAppointments(data.items);
    } catch { toast.error('Error cargando turnos'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleScanSuccess = async (decodedText: string) => {
    setShowScanner(false);
    
    let aptId = NaN;

    // 1. Extraer ID si el código es nuestra nueva URL dinámica
    if (decodedText.includes('/validar-turno/')) {
      const urlParts = decodedText.split('/');
      aptId = Number(urlParts[urlParts.length - 1]);
    }
    // 2. Extraer ID si el código es el formato antiguo (APPDRUGS|TURNO:X)
    else if (decodedText.includes('APPDRUGS|TURNO:')) {
      const match = decodedText.match(/TURNO:(\d+)/);
      if (match) {
        aptId = Number(match[1]);
      }
    }
    // 3. Intento desesperado por si antes solo guardaban números
    else {
      aptId = Number(decodedText);
    }
    
    if (isNaN(aptId) || aptId === 0) {
      toast.error('El código QR escaneado no pertenece al sistema AppDrugs o está en formato irreconocible.');
      return;
    }

    try {
      await appointmentsService.updateStatus(aptId, 3); // Estado 3 = Entregado
      toast.success(`Turno #${aptId} escaneado y marcado como Entregado 🎉`);
      showMessage(`¡QR Detectado! Has entregado el turno #${aptId} de forma automática.`, 'feliz');
      loadAppointments();
    } catch (err: any) {
      toast.error('Error al procesar el QR. Verifica que el turno pertenezca a esta sede.');
    }
  };

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
        <div className="flex gap-3">
          <button onClick={() => setShowScanner(true)} className="bg-blue-600 border border-blue-700 text-white rounded-lg px-4 py-2 cursor-pointer font-bold hover:bg-blue-700 hover:shadow-lg transition-all shadow-md shadow-blue-500/20 flex items-center gap-2">
            📸 Escanear QR
          </button>
          <button onClick={loadAppointments} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-4 py-2 cursor-pointer font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            🔄 Actualizar
          </button>
        </div>
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
                              {apt.archivoNombre && (
                                <button
                                  onClick={async () => {
                                    try {
                                      await appointmentsService.downloadFile(apt.id, apt.archivoNombre!);
                                    } catch (err: any) {
                                      toast.error(err.message);
                                    }
                                  }}
                                  className="mt-3 w-full px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  📄 Ver Receta
                                </button>
                              )}
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

      {/* Modal del Escáner */}
      {showScanner && (
        <QrScannerModal 
          onClose={() => setShowScanner(false)} 
          onScanSuccess={handleScanSuccess} 
        />
      )}
    </div>
  );
};

export default PharmacistAppointmentsTab;
