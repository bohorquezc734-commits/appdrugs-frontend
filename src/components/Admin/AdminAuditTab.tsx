import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService, AuditLog } from '../../services/audit';
import { ErrorBoundary } from '../../components/Common/ErrorBoundary';

const entityTranslations: Record<string, string> = {
  "Appointment": "Turno",
  "AppointmentDetail": "Detalle de Turno",
  "Inventory": "Inventario",
  "Notification": "Notificación",
  "User": "Usuario",
  "Drug": "Medicamento",
  "Location": "Sede"
};

const actionTranslations: Record<string, string> = {
  "Added": "Creación",
  "Modified": "Actualización",
  "Deleted": "Eliminación"
};

const translateEntity = (entity: string) => entityTranslations[entity] || entity;
const translateAction = (action: string) => actionTranslations[action] || action;

const AuditLogSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6 max-w-7xl mx-auto">
    <div className="h-10 bg-gray-200 rounded w-1/4"></div>
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="h-12 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"></div>
      {Array.from({ length: 5 }, () => crypto.randomUUID()).map((id) => (
        <div key={id} className="h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700"></div>
      ))}
    </div>
  </div>
);

const getActionClass = (action: string) => {
  switch (action) {
    case 'Added':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
    case 'Modified':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    case 'Deleted':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }
};

const formatValue = (value: any) => {
  if (value === null || value === undefined || value === "") return 'Vacío';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const ChangesTable = ({ title, jsonString, titleColorClass, bgClass }: { title: string, jsonString: string, titleColorClass: string, bgClass: string }) => {
  if (!jsonString) return null;
  let parsed: Record<string, any> = {};
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return (
      <div>
        <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${titleColorClass}`}>{title}</h4>
        <pre className={`${bgClass} p-3 rounded-lg text-xs overflow-x-auto font-mono whitespace-pre-wrap`}>
          {jsonString}
        </pre>
      </div>
    );
  }

  const entries = Object.entries(parsed);
  if (entries.length === 0) return null;

  return (
    <div>
      <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${titleColorClass}`}>{title}</h4>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-3 py-2 text-gray-600 dark:text-gray-300 font-medium border-r border-gray-200 dark:border-gray-700">Campo</th>
              <th className="px-3 py-2 text-gray-600 dark:text-gray-300 font-medium">Valor</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900">
            {entries.map(([key, value]) => (
              <tr key={key} className="hover:bg-gray-50 dark:bg-gray-800 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <td className="px-3 py-2 font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 w-1/3 border-r border-gray-200 dark:border-gray-700">{key}</td>
                <td className="px-3 py-2 text-gray-800 dark:text-gray-100 break-all">{formatValue(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AuditLogsContent: React.FC = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['auditLogs', currentPage, pageSize],
    queryFn: () => auditService.getAuditLogs(currentPage, pageSize),
    refetchInterval: 15000, // Auto-update every 15 seconds
    refetchOnWindowFocus: true
  });

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  if (isLoading) return <AuditLogSkeleton />;
  if (error) throw error; // Caught by ErrorBoundary

  // formatValue and ChangesTable have been moved up outside the component.


  const formatPrimaryKey = (pk: string) => {
    try {
      const parsed = JSON.parse(pk);
      if (parsed && typeof parsed === 'object') {
        const values = Object.values(parsed);
        if (values.length > 0) return String(values[0]);
      }
      return pk;
    } catch {
      return pk;
    }
  };

  // Pagination logic
  const totalRecords = data?.totalCount || 0;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLogs = Array.isArray((data as any)?.items) ? (data as any).items : ((data as any)?.items || (data as any)?.$values || (data as any)?.data || (data as any)?.results || []);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            Registros de Auditoría
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Historial inmutable de cambios en el sistema.
          </p>
        </div>
        
        <button 
          onClick={() => refetch()}
          disabled={isRefetching || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50"
        >
          <svg className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${isRefetching ? 'animate-spin text-emerald-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Actualizar
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Table Container with Data Grid Style */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">Fecha/Hora</th>
                <th className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">Usuario (ID)</th>
                <th className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">Acción</th>
                <th className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">Entidad</th>
                <th className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">ID Entidad</th>
                <th className="px-4 py-3 text-center">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    No hay registros de auditoría disponibles.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log: AuditLog) => (
                  <tr key={log.id} className="hover:bg-emerald-50/50 dark:hover:bg-slate-800/50 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap border-r border-gray-200 dark:border-gray-700">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                      {log.userName || 'Sistema'}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getActionClass(log.action)}`}>
                        {translateAction(log.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                      {translateEntity(log.entityName)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono border-r border-gray-200 dark:border-gray-700">
                      {formatPrimaryKey(log.primaryKey)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium text-xs bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 px-3 py-1.5 rounded transition-colors"
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-xl gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Mostrar</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 text-sm rounded-md py-1 px-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-300">registros</span>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-300">
            Mostrando {totalRecords === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + pageSize, totalRecords)} de {totalRecords} registros
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                Detalles del Cambio - {translateEntity(selectedLog.entityName)}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {selectedLog.oldValues && (
                <ChangesTable 
                  title="Valores Anteriores" 
                  jsonString={selectedLog.oldValues} 
                  titleColorClass="text-red-600"
                  bgClass="bg-red-50 text-red-900"
                />
              )}
              
              {selectedLog.newValues && (
                <ChangesTable 
                  title="Nuevos Valores" 
                  jsonString={selectedLog.newValues} 
                  titleColorClass="text-emerald-600"
                  bgClass="bg-emerald-50 text-emerald-900"
                />
              )}
              
              {!selectedLog.oldValues && !selectedLog.newValues && (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No hay detalles de valores para esta acción.
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AuditLogs: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuditLogsContent />
    </ErrorBoundary>
  );
};

export default AuditLogs;

