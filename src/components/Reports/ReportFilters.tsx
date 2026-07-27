import React, { useState, useEffect } from 'react';
import { AppointmentReportFilters, InventoryReportFilters } from '../../services/reports';

interface ReportFiltersProps {
  type: 'appointments' | 'inventory';
  onApply: (filters: any) => void;
  onReset: () => void;
  sedes?: Array<{ id: number; nombreSede: string }>;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  type,
  onApply,
  onReset,
  sedes = [],
}) => {
  const [filters, setFilters] = useState<AppointmentReportFilters & InventoryReportFilters>({
    dateFrom: '',
    dateTo: '',
    status: '',
    gestorId: undefined,
    onlyActive: true,
  });

  useEffect(() => {
    onApply(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(filters);
  };

  const handleReset = () => {
    const resetValues = {
      dateFrom: '',
      dateTo: '',
      status: '',
      gestorId: undefined,
      onlyActive: true,
    };
    setFilters(resetValues);
    onReset();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {type === 'appointments' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Fecha Desde</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Todos</option>
                <option value="Recibido">Recibido</option>
                <option value="EnProceso">En Proceso</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </>
        )}

        {type === 'inventory' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Sede</label>
              <select
                value={filters.gestorId ?? ''}
                onChange={(e) => setFilters({ ...filters, gestorId: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="">Todas</option>
                {sedes.map((sede) => (
                  <option key={sede.id} value={sede.id}>{sede.nombreSede}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center text-sm text-gray-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.onlyActive !== false}
                  onChange={(e) => setFilters({ ...filters, onlyActive: e.target.checked })}
                  className="mr-2 w-4 h-4 text-green-600 focus:ring-green-500 rounded border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                />
                Solo activos
              </label>
            </div>
          </>
        )}

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-300 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-600 transition"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </form>
  );
};

export default ReportFilters;
