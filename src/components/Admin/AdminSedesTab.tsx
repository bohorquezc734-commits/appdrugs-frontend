import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { gestoresService, GestorDto } from '../../services/gestores';
import { PremiumTable, ColumnDef } from '../Common/PremiumTable';

type GestorFormData = {
  nombreSede: string;
  direccion: string;
  telefono: string;
  idEps: number;
};

const AdminSedesTab: React.FC = () => {
  const [gestores, setGestores] = useState<GestorDto[]>([]);
  const [loadingGestores, setLoadingGestores] = useState(false);
  const [showCreateGestorModal, setShowCreateGestorModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GestorFormData>({
    defaultValues: { nombreSede: '', direccion: '', telefono: '', idEps: 1 }
  });

  const loadGestores = useCallback(async () => {
    try {
      setLoadingGestores(true);
      const data = await gestoresService.getAll();
      setGestores(data);
    } catch { 
      toast.error('Error cargando sedes'); 
    } finally { 
      setLoadingGestores(false); 
    }
  }, []);

  useEffect(() => {
    loadGestores();
  }, [loadGestores]);

  const onSubmit = async (data: GestorFormData) => {
    try {
      await gestoresService.create(data);
      toast.success('Sede creada exitosamente');
      setShowCreateGestorModal(false);
      reset();
      loadGestores();
    } catch { 
      toast.error('Error al crear sede'); 
    }
  };

  const columns: ColumnDef<GestorDto>[] = [
    {
      header: 'ID',
      render: (g) => <span className="font-bold text-slate-400 dark:text-slate-500">#{g.id}</span>,
      width: '80px',
    },
    {
      header: 'Nombre Sede',
      render: (g) => <span className="font-bold text-slate-800 dark:text-slate-100">{g.nombreSede}</span>,
    },
    {
      header: 'Dirección',
      accessor: 'direccion',
    },
    {
      header: 'Teléfono',
      render: (g) => <span className="font-mono text-slate-500 dark:text-slate-400">{g.telefono}</span>,
    },
    {
      header: 'Estado',
      render: (g) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
          g.isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          {g.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    }
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Sedes Farmacéuticas</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gestión de sucursales y puntos de retiro autorizados.</p>
        </div>
        
        <button 
          onClick={() => setShowCreateGestorModal(true)} 
          className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva Sede
        </button>
      </div>

      <PremiumTable
        columns={columns}
        data={gestores}
        loading={loadingGestores}
        keyExtractor={(g) => g.id}
        emptyMessage="No hay sedes registradas."
      />

      {/* Modal */}
      {showCreateGestorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowCreateGestorModal(false)}></div>
          
          <div className="relative bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700 transform transition-all animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-2xl text-slate-800 dark:text-slate-100 tracking-tight">Añadir Sede</h3>
              <button onClick={() => setShowCreateGestorModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:bg-slate-700 rounded-full p-2 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">Nombre de la Sede</label>
                <input 
                  {...register('nombreSede', { required: 'El nombre es obligatorio', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })} 
                  className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.nombreSede ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/50'} text-slate-800 dark:text-slate-100 text-sm rounded-xl focus:ring-2 focus:outline-none block p-3.5 transition-all`} 
                  placeholder="Ej: Farmacia Central" 
                />
                {errors.nombreSede && <p className="mt-1 text-sm text-rose-500 font-bold">{errors.nombreSede.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">Dirección Completa</label>
                <input 
                  {...register('direccion', { required: 'La dirección es obligatoria' })} 
                  className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.direccion ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/50'} text-slate-800 dark:text-slate-100 text-sm rounded-xl focus:ring-2 focus:outline-none block p-3.5 transition-all`} 
                  placeholder="Ej: Av. Siempreviva 742" 
                />
                {errors.direccion && <p className="mt-1 text-sm text-rose-500 font-bold">{errors.direccion.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">Teléfono de Contacto</label>
                <input 
                  {...register('telefono', { required: 'El teléfono es obligatorio', pattern: { value: /^[0-9+ ]+$/, message: 'Solo números y signos de +' } })} 
                  className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.telefono ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/50'} text-slate-800 dark:text-slate-100 text-sm rounded-xl focus:ring-2 focus:outline-none block p-3.5 transition-all font-mono`} 
                  placeholder="Ej: +57 300 123 4567" 
                />
                {errors.telefono && <p className="mt-1 text-sm text-rose-500 font-bold">{errors.telefono.message}</p>}
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100 dark:border-slate-700 mt-2">
                <button type="button" onClick={() => setShowCreateGestorModal(false)} className="flex-1 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold py-3.5 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5">
                  Guardar Sede
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSedesTab;
