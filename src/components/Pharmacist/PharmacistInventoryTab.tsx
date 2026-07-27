import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { inventoriesService, InventoryDto } from '../../services/inventories';
import { gestoresService, GestorDto } from '../../services/gestores';
import { CustomDialog } from '../Common/CustomDialog';
import Select from 'react-select';

const PharmacistInventoryTab: React.FC = () => {
  const [inventories, setInventories] = useState<InventoryDto[]>([]);
  const [gestores, setGestores] = useState<GestorDto[]>([]);
  const [loadingInventories, setLoadingInventories] = useState(false);
  const [invFilterSede, setInvFilterSede] = useState<number>(0);
  
  // Modal: stock
  const [stockModal, setStockModal] = useState<{ open: boolean; type: 'add' | 'remove'; invId: number; drugName: string }>({
    open: false, type: 'add', invId: 0, drugName: '',
  });
  const [stockQty, setStockQty] = useState<string>('1');
  const [stockFocus, setStockFocus] = useState(false);

  const loadGestores = useCallback(async () => {
    try {
      const data = await gestoresService.getAll();
      setGestores(data);
    } catch { toast.error('Error cargando sedes'); }
  }, []);

  const loadInventories = useCallback(async () => {
    try {
      setLoadingInventories(true);
      const params = invFilterSede > 0 ? { gestorFarmaceuticoId: invFilterSede } : undefined;
      const data = await inventoriesService.getAll(params);
      setInventories(data);
    } catch { toast.error('Error cargando inventario'); }
    finally { setLoadingInventories(false); }
  }, [invFilterSede]);

  useEffect(() => {
    loadGestores();
  }, [loadGestores]);

  useEffect(() => {
    loadInventories();
  }, [loadInventories]);

  const openStockModal = (type: 'add' | 'remove', inv: InventoryDto) => {
    setStockQty('1');
    setStockModal({ open: true, type, invId: inv.id, drugName: inv.drugName });
  };

  const confirmStock = async () => {
    const q = Number(stockQty);
    if (!stockQty || isNaN(q) || q <= 0) { toast.warn('Ingresa una cantidad válida'); return; }
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
    } catch { toast.error(stockModal.type === 'add' ? 'Error al agregar stock' : 'Error al retirar stock'); }
  };

  const gestorOptions = [
    { value: 0, label: 'Todas las sedes' },
    ...gestores.map(g => ({ value: g.id, label: g.nombreSede }))
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 m-0">Gestión de Inventario</h2>
        <div className="w-[250px]">
          <Select
            value={gestorOptions.find(o => o.value === invFilterSede) || gestorOptions[0]}
            onChange={(opt: any) => setInvFilterSede(opt ? opt.value : 0)}
            options={gestorOptions}
            placeholder="Filtrar por sede..."
            styles={{
              control: (base, state) => ({
                ...base,
                borderRadius: '8px',
                borderColor: state.isFocused ? '#2563eb' : '#cbd5e1',
                boxShadow: state.isFocused ? '0 0 0 1px #2563eb' : 'none',
                fontSize: '14px',
                backgroundColor: 'var(--select-bg, white)',
              }),
              option: (base, state) => ({
                ...base,
                fontSize: '14px',
                backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? 'var(--select-hover, #eff6ff)' : 'var(--select-bg, white)',
                color: state.isSelected ? 'white' : 'var(--select-text, #1e293b)',
              }),
              singleValue: (base) => ({
                ...base,
                color: 'var(--select-text, #1e293b)',
              })
            }}
            className="my-react-select-container"
            classNamePrefix="my-react-select"
          />
        </div>
      </div>

      {loadingInventories ? (
        <p className="text-slate-500 dark:text-slate-400">Cargando inventario...</p>
      ) : inventories.length === 0 ? (
        <div className="text-center p-10 bg-white dark:bg-slate-900 rounded-xl text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-base">No hay medicamentos en el inventario para esta sede.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Sede</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Medicamento</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Cantidad</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Acciones de Stock</th>
              </tr>
            </thead>
            <tbody>
              {inventories.map(inv => (
                <tr key={inv.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-sm text-slate-800 dark:text-slate-200">{inv.sedeName}</td>
                  <td className="p-4 text-sm font-semibold text-slate-800 dark:text-slate-200">{inv.drugName}</td>
                  <td className="p-4 text-base font-bold text-blue-600 dark:text-blue-400">{inv.quantity}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => openStockModal('add', inv)} className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-none rounded-md px-3 py-1.5 text-sm font-semibold cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">+ Agregar</button>
                    <button onClick={() => openStockModal('remove', inv)} className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-none rounded-md px-3 py-1.5 text-sm font-semibold cursor-pointer hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">- Retirar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: Stock (agregar / retirar) */}
      <CustomDialog
        isOpen={stockModal.open}
        title={stockModal.type === 'add' ? 'Agregar Stock' : 'Retirar Stock'}
        message={`Medicamento: ${stockModal.drugName}`}
        icon={stockModal.type === 'add' ? '📦' : '📤'}
        iconBg={stockModal.type === 'add' ? '#dcfce7' : '#fee2e2'}
        confirmLabel={stockModal.type === 'add' ? 'Agregar' : 'Retirar'}
        confirmColor={stockModal.type === 'add' ? '#16a34a' : '#dc2626'}
        onConfirm={confirmStock}
        onCancel={() => setStockModal(s => ({ ...s, open: false }))}
      >
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            {stockModal.type === 'add' ? 'Unidades a agregar' : 'Unidades a retirar'} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            value={stockQty}
            onChange={e => setStockQty(e.target.value)}
            onFocus={() => setStockFocus(true)}
            onBlur={() => setStockFocus(false)}
            autoFocus
            className={`w-full p-2.5 rounded-lg text-base outline-none transition-all box-border bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 ${stockFocus ? 'border-2 border-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]' : 'border border-slate-200 dark:border-slate-700'}`}
            onKeyDown={e => e.key === 'Enter' && confirmStock()}
          />
        </div>
      </CustomDialog>
    </div>
  );
};

export default PharmacistInventoryTab;
