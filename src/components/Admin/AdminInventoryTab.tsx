import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { inventoriesService, InventoryDto } from '../../services/inventories';
import { gestoresService, GestorDto } from '../../services/gestores';
import { drugsService, Drug } from '../../services/drugs';
import { CustomDialog } from '../Common/CustomDialog';
import { PremiumTable, ColumnDef } from '../Common/PremiumTable';

const AdminInventoryTab: React.FC = () => {
  const [inventories, setInventories] = useState<InventoryDto[]>([]);
  const [gestores, setGestores] = useState<GestorDto[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loadingInventories, setLoadingInventories] = useState(false);
  const [invFilterSede, setInvFilterSede] = useState<number>(0);
  const [showCreateInvModal, setShowCreateInvModal] = useState(false);
  const [invForm, setInvForm] = useState({ drugId: 0, gestorFarmaceuticoId: 0, quantity: 0 });

  const [stockModal, setStockModal] = useState<{ open: boolean; type: 'add' | 'remove'; invId: number; drugName: string }>({
    open: false, type: 'add', invId: 0, drugName: '',
  });
  const [stockQty, setStockQty] = useState<string>('1');

  const [deleteInvModal, setDeleteInvModal] = useState<{ open: boolean; invId: number; drugName: string }>({
    open: false, invId: 0, drugName: '',
  });

  const loadDependencies = useCallback(async () => {
    try {
      const [gest, drg] = await Promise.all([gestoresService.getAll(), drugsService.getAll({ pageSize: 1000 })]);
      setGestores(gest);
      setDrugs(drg.items);
    } catch { 
      toast.error('Error cargando dependencias'); 
    }
  }, []);

  const loadInventories = useCallback(async () => {
    try {
      setLoadingInventories(true);
      const params = invFilterSede > 0 ? { gestorFarmaceuticoId: invFilterSede } : undefined;
      const data = await inventoriesService.getAll(params);
      setInventories(Array.isArray(data) ? data : ((data as any)?.items || (data as any)?.$values || (data as any)?.data || (data as any)?.results || []));
    } catch { 
      toast.error('Error cargando inventario'); 
    } finally { 
      setLoadingInventories(false); 
    }
  }, [invFilterSede]);

  useEffect(() => {
    loadDependencies();
  }, [loadDependencies]);

  useEffect(() => {
    loadInventories();
  }, [loadInventories]);

  const handleCreateInventory = async (e: React.BaseSyntheticEvent): Promise<void> => {
    e.preventDefault();
    if (invForm.drugId === 0 || invForm.gestorFarmaceuticoId === 0) {
      toast.warn('Selecciona una sede y un medicamento');
      return;
    }
    try {
      await inventoriesService.create(invForm);
      toast.success('Inventario creado exitosamente');
      setShowCreateInvModal(false);
      loadInventories();
      setInvForm({ drugId: 0, gestorFarmaceuticoId: 0, quantity: 0 });
    } catch { 
      toast.error('Error al crear inventario'); 
    }
  };

  const openStockModal = (type: 'add' | 'remove', inv: InventoryDto) => {
    setStockQty('1');
    setStockModal({ open: true, type, invId: inv.id, drugName: inv.drugName });
  };

  const confirmStock = async () => {
    const q = Number(stockQty);
    if (!stockQty || Number.isNaN(q) || q <= 0) { toast.warn('Ingresa una cantidad válida'); return; }
    try {
      if (stockModal.type === 'add') {
        await inventoriesService.addStock(stockModal.invId, q);
        toast.success('Stock agregado exitosamente');
      } else {
        await inventoriesService.removeStock(stockModal.invId, q);
        toast.success('Stock retirado exitosamente');
      }
      setStockModal(s => ({ ...s, open: false }));
      loadInventories();
    } catch { 
      toast.error(stockModal.type === 'add' ? 'Error al agregar stock' : 'Error al retirar stock'); 
    }
  };

  const confirmDeleteInventory = async () => {
    try {
      await inventoriesService.delete(deleteInvModal.invId);
      toast.success('Inventario eliminado');
      setDeleteInvModal(s => ({ ...s, open: false }));
      loadInventories();
    } catch { 
      toast.error('Error al eliminar inventario'); 
    }
  };

  const columns: ColumnDef<InventoryDto>[] = [
    {
      header: 'ID',
      render: (inv) => <span className="font-bold text-slate-400 dark:text-slate-500">#{inv.id}</span>,
      width: '60px',
    },
    {
      header: 'Sede',
      render: (inv) => (
        <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
          <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          {inv.sedeName}
        </span>
      ),
    },
    {
      header: 'Medicamento',
      render: (inv) => <span className="font-bold text-slate-800 dark:text-slate-100">{inv.drugName}</span>,
    },
    {
      header: 'Cantidad',
      render: (inv) => {
        let badgeClass = 'bg-rose-50 text-rose-600 border-rose-200';
        if (inv.quantity > 50) badgeClass = 'bg-emerald-50 text-emerald-600 border-emerald-200';
        else if (inv.quantity > 10) badgeClass = 'bg-blue-50 text-blue-600 border-blue-200';
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
            {inv.quantity} unid.
          </span>
        );
      },
    },
    {
      header: 'Ajuste de Stock',
      render: (inv) => (
        <div className="flex gap-2">
          <button onClick={() => openStockModal('add', inv)} className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            Agregar
          </button>
          <button onClick={() => openStockModal('remove', inv)} className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
            Retirar
          </button>
        </div>
      ),
    },
    {
      header: 'Acciones',
      render: (inv) => (
        <button onClick={() => setDeleteInvModal({ open: true, invId: inv.id, drugName: inv.drugName })} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      ),
      width: '80px',
    }
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Inventarios por Sede</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gestión de existencias de medicamentos en cada sucursal.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            </span>
            <select 
              value={invFilterSede} 
              onChange={e => setInvFilterSede(Number(e.target.value))} 
              className="w-full sm:w-56 pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm font-medium text-slate-700 dark:text-slate-200 appearance-none"
            >
              <option value={0}>Todas las sedes</option>
              {gestores.map(g => <option key={g.id} value={g.id}>{g.nombreSede}</option>)}
            </select>
          </div>
          
          <button 
            onClick={() => setShowCreateInvModal(true)} 
            className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nuevo Inventario
          </button>
        </div>
      </div>

      <PremiumTable
        columns={columns}
        data={inventories}
        loading={loadingInventories}
        keyExtractor={(inv) => inv.id}
        emptyMessage="No se encontraron registros de inventario."
      />

      {/* Modal de Creación */}
      {showCreateInvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Cerrar modal" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm w-full h-full cursor-default" onClick={() => setShowCreateInvModal(false)}></button>
          
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span aria-hidden="true" className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">📦</span>
                <span>Registrar Inventario</span>
              </h3>
              <button onClick={() => setShowCreateInvModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-700 rounded-full p-2 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateInventory} className="p-6 space-y-4">
              <div>
                <label htmlFor="inv-sede" className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">Sede Farmacéutica</label>
                <select
                  id="inv-sede"
                  value={invForm.gestorFarmaceuticoId}
                  onChange={e => setInvForm({...invForm, gestorFarmaceuticoId: Number(e.target.value)})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 p-3 text-sm font-medium"
                  required
                >
                  <option value={0}>-- Selecciona Sede --</option>
                  {gestores.map(g => <option key={g.id} value={g.id}>{g.nombreSede}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="inv-drug" className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">Medicamento</label>
                <select
                  id="inv-drug"
                  value={invForm.drugId}
                  onChange={e => setInvForm({...invForm, drugId: Number(e.target.value)})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 p-3 text-sm font-medium"
                  required
                >
                  <option value={0}>-- Selecciona Medicamento --</option>
                  {drugs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="inv-quantity" className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">Cantidad Inicial</label>
                <input
                  id="inv-quantity"
                  type="number"
                  value={invForm.quantity}
                  onChange={e => setInvForm({...invForm, quantity: Number(e.target.value)})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 p-3 text-sm font-bold text-blue-700"
                  required
                  min={0}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowCreateInvModal(false)} className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:bg-slate-800 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition-colors">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Dialogs */}
      <CustomDialog
        isOpen={stockModal.open}
        title={stockModal.type === 'add' ? 'Agregar Stock' : 'Retirar Stock'}
        message={`Medicamento: ${stockModal.drugName}`}
        icon={stockModal.type === 'add' ? '📦' : '📤'}
        iconBg={stockModal.type === 'add' ? '#dcfce7' : '#fee2e2'}
        confirmLabel={stockModal.type === 'add' ? 'Agregar' : 'Retirar'}
        confirmColor={stockModal.type === 'add' ? '#10b981' : '#f43f5e'}
        onConfirm={confirmStock}
        onCancel={() => setStockModal(s => ({ ...s, open: false }))}
      >
        <div className="mt-4">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
            {stockModal.type === 'add' ? 'Unidades a agregar' : 'Unidades a retirar'} <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            value={stockQty}
            onChange={e => setStockQty(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 p-3 text-lg font-bold text-slate-800 dark:text-slate-100 text-center"
            onKeyDown={e => e.key === 'Enter' && confirmStock()}
          />
        </div>
      </CustomDialog>

      <CustomDialog
        isOpen={deleteInvModal.open}
        title="Eliminar inventario"
        message={`¿Estás seguro de eliminar el registro de inventario de "${deleteInvModal.drugName}"? Esta acción eliminará permanentemente este stock.`}
        icon="🗑️"
        iconBg="#ffe4e6"
        confirmLabel="Sí, eliminar"
        confirmColor="#e11d48"
        onConfirm={confirmDeleteInventory}
        onCancel={() => setDeleteInvModal(s => ({ ...s, open: false }))}
      />
    </div>
  );
};

export default AdminInventoryTab;
