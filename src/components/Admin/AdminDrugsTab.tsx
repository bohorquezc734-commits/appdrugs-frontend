import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { drugsService, Drug } from '../../services/drugs';
import { useDrugiStore } from '../../store/useDrugiStore';
import { PremiumTable, ColumnDef } from '../Common/PremiumTable';

type DrugFormData = {
  name: string;
  genericName: string;
  laboratory: string;
  price: number;
  stock: number;
  category: string;
  requiresPrescription: boolean;
  expirationDate: string;
};

const AdminDrugsTab: React.FC = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loadingDrugs, setLoadingDrugs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDrugModal, setShowDrugModal] = useState(false);
  const [editingDrugId, setEditingDrugId] = useState<number | null>(null);
  const [drugCurrentPage, setDrugCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const { showMessage } = useDrugiStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DrugFormData>({
    defaultValues: {
      name: '', genericName: '', laboratory: '', price: 0, stock: 0,
      category: '', requiresPrescription: false, expirationDate: ''
    }
  });

  const loadDrugs = useCallback(async (page = 1) => {
    try {
      setLoadingDrugs(true);
      const data = await drugsService.getAll({ searchTerm: searchTerm || undefined, page, pageSize });
      setDrugs(Array.isArray((data as any)?.items) ? (data as any).items : ((data as any)?.items || (data as any)?.$values || (data as any)?.data || (data as any)?.results || []));
      setDrugCurrentPage(data.pageNumber);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Error cargando medicamentos');
    } finally {
      setLoadingDrugs(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadDrugs(1);
  }, [loadDrugs]);

  const openCreateModal = () => {
    setEditingDrugId(null);
    reset({ name: '', genericName: '', laboratory: '', price: 0, stock: 0, category: '', requiresPrescription: false, expirationDate: '' });
    setShowDrugModal(true);
  };

  const openEditModal = (drug: Drug) => {
    setEditingDrugId(drug.id);
    reset({
      name: drug.name,
      genericName: drug.genericName,
      laboratory: drug.laboratory,
      price: drug.price,
      stock: drug.stock,
      category: drug.category,
      requiresPrescription: drug.requiresPrescription,
      expirationDate: drug.expirationDate.split('T')[0]
    });
    setShowDrugModal(true);
  };

  const onSubmit = async (data: DrugFormData) => {
    try {
      if (editingDrugId) {
        await drugsService.update({ id: editingDrugId, ...data });
        toast.success('Medicamento actualizado');
      } else {
        await drugsService.create(data);
        toast.success('Medicamento creado exitosamente');
        showMessage('¡Excelente! El nuevo medicamento ya está en el catálogo. 💊', 'feliz');
      }
      setShowDrugModal(false);
      loadDrugs(drugCurrentPage);
    } catch { 
      toast.error(editingDrugId ? 'Error al actualizar medicamento' : 'Error al crear medicamento'); 
    }
  };

  const handleDeleteDrug = async (id: number) => {
    if (!window.confirm('¿Eliminar este medicamento?')) return;
    try {
      await drugsService.delete(id);
      toast.success('Medicamento eliminado');
      loadDrugs(drugCurrentPage);
    } catch { toast.error('Error al eliminar'); }
  };

  const columns: ColumnDef<Drug>[] = [
    {
      header: 'ID',
      render: (d) => <span className="font-bold text-slate-400 dark:text-slate-400">#{d.id}</span>,
      width: '60px',
    },
    {
      header: 'Medicamento',
      render: (d) => (
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-100">{d.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{d.genericName}</p>
        </div>
      ),
    },
    {
      header: 'Laboratorio',
      accessor: 'laboratory',
    },
    {
      header: 'Categoría',
      render: (d) => (
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 dark:border-slate-600">
          {d.category}
        </span>
      ),
    },
    {
      header: 'Precio',
      render: (d) => <span className="font-bold text-emerald-600">${d.price.toFixed(2)}</span>,
    },
    {
      header: 'Receta',
      render: (d) => (
        d.requiresPrescription 
          ? <span className="text-rose-500 dark:text-rose-400 font-bold text-xs bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-100 dark:border-rose-500/20">Sí</span>
          : <span className="text-slate-400 dark:text-slate-400 font-semibold text-xs">No</span>
      ),
    },
    {
      header: 'Acciones',
      render: (d) => (
        <div className="flex gap-2">
          <button onClick={() => openEditModal(d)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={() => handleDeleteDrug(d.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      ),
      width: '100px',
    }
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Catálogo de Medicamentos</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gestión global de los productos disponibles en las sedes.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
              type="text" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Buscar medicamento..." 
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-shadow shadow-sm text-slate-700 dark:text-slate-200" 
              onKeyDown={e => e.key === 'Enter' && loadDrugs(1)}
            />
          </div>
          <button 
            onClick={() => loadDrugs(1)} 
            className="px-5 py-2 bg-slate-800 dark:bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-sm"
          >
            Buscar
          </button>
          <button 
            onClick={openCreateModal} 
            className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nuevo
          </button>
        </div>
      </div>

      <PremiumTable
        columns={columns}
        data={drugs}
        loading={loadingDrugs}
        keyExtractor={(d) => d.id}
        emptyMessage="No se encontraron medicamentos."
        currentPage={drugCurrentPage}
        totalPages={totalPages}
        onPageChange={loadDrugs}
      />

      {/* Modal */}
      {showDrugModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Cerrar modal" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm w-full h-full cursor-default" onClick={() => setShowDrugModal(false)}></button>
          
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-2xl text-slate-800 dark:text-slate-100">{editingDrugId ? 'Editar Medicamento' : 'Nuevo Medicamento'}</h3>
              <button onClick={() => setShowDrugModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-300 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-700 rounded-full p-2 transition">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label htmlFor="input-name" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nombre Comercial</label>
                  <input id="input-name" {...register('name', { required: 'Requerido' })} className="w-full bg-slate-50 dark:bg-slate-800 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm p-3 transition-all text-slate-800 dark:text-slate-100" />
                  {errors.name && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="input-genericName" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nombre Genérico</label>
                  <input id="input-genericName" {...register('genericName', { required: 'Requerido' })} className="w-full bg-slate-50 dark:bg-slate-800 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm p-3 transition-all text-slate-800 dark:text-slate-100" />
                  {errors.genericName && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.genericName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label htmlFor="input-laboratory" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Laboratorio</label>
                  <input id="input-laboratory" {...register('laboratory', { required: 'Requerido' })} className="w-full bg-slate-50 dark:bg-slate-800 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm p-3 transition-all text-slate-800 dark:text-slate-100" />
                  {errors.laboratory && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.laboratory.message}</p>}
                </div>
                <div>
                  <label htmlFor="input-category" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Categoría</label>
                  <input id="input-category" {...register('category', { required: 'Requerido' })} className="w-full bg-slate-50 dark:bg-slate-800 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm p-3 transition-all text-slate-800 dark:text-slate-100" />
                  {errors.category && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.category.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div>
                  <label htmlFor="input-price" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Precio ($)</label>
                  <input id="input-price" type="number" step="0.01" {...register('price', { required: 'Requerido', min: {value: 0.1, message: '> 0'} })} className="w-full bg-slate-50 dark:bg-slate-800 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm p-3 font-bold text-emerald-700 dark:text-emerald-500 transition-all" />
                  {errors.price && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.price.message}</p>}
                </div>
                <div>
                  <label htmlFor="input-stock" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Stock Inicial</label>
                  <input id="input-stock" type="number" {...register('stock', { required: 'Requerido', min: {value: 0, message: '>= 0'} })} className="w-full bg-slate-50 dark:bg-slate-800 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm p-3 font-bold text-blue-700 dark:text-blue-500 transition-all" />
                  {errors.stock && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.stock.message}</p>}
                </div>
                <div>
                  <label htmlFor="input-expirationDate" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Vencimiento</label>
                  <input id="input-expirationDate" type="date" {...register('expirationDate', { required: 'Requerido' })} className="w-full bg-slate-50 dark:bg-slate-800 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm p-3 transition-all text-slate-800 dark:text-slate-100 [color-scheme:light] dark:[color-scheme:dark]" />
                  {errors.expirationDate && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.expirationDate.message}</p>}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 dark:bg-slate-900 cursor-pointer hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-800 transition-colors">
                  <input type="checkbox" {...register('requiresPrescription')} className="w-5 h-5 text-emerald-600 rounded border-slate-300 dark:border-slate-600 focus:ring-emerald-500 dark:bg-slate-800" />
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Requiere receta médica obligatoria</span>
                </label>
              </div>

              <div className="pt-6 flex gap-3 border-t border-slate-100 dark:border-slate-700 mt-6">
                <button type="button" onClick={() => setShowDrugModal(false)} className="flex-1 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all">
                  {editingDrugId ? 'Guardar Cambios' : 'Crear Medicamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDrugsTab;
