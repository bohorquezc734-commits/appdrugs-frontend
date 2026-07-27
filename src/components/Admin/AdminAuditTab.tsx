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
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="h-12 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-14 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-gray-700"></div>
      ))}
    </div>
  </div>
);

const AuditLogsContent: React.FC = () => {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: auditService.getAuditLogs
  });

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  if (isLoading) return <AuditLogSkeleton />;
  if (error) throw error; // Caught by ErrorBoundary

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
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-3 py-2 text-gray-600 dark:text-gray-300 font-medium">Campo</th>
                <th className="px-3 py-2 text-gray-600 dark:text-gray-300 font-medium">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-slate-900">
              {entries.map(([key, value]) => (
                <tr key={key} className="hover:bg-gray-50 dark:bg-gray-800 transition-colors">
                  <td className="px-3 py-2 font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 w-1/3 border-r border-gray-100 dark:border-gray-700">{key}</td>
                  <td className="px-3 py-2 text-gray-800 dark:text-gray-100 break-all">{formatValue(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
          Registros de Auditoría
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Historial inmutable de cambios en el sistema.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3">Fecha/Hora</th>
                <th className="px-4 py-3">Usuario (ID)</th>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Entidad</th>
                <th className="px-4 py-3">ID Entidad</th>
                <th className="px-4 py-3 text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {logs?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No hay registros de auditoría disponibles.
                  </td>
                </tr>
              )}
              {logs?.map((log: AuditLog) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:bg-gray-800 transition-colors">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                    {log.userName || 'Sistema'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      log.action === 'Added' ? 'bg-green-100 text-green-700' :
                      log.action === 'Modified' ? 'bg-blue-100 text-blue-700' :
                      log.action === 'Deleted' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                    }`}>
                      {translateAction(log.action)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-100">{translateEntity(log.entityName)}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono">
                    {formatPrimaryKey(log.primaryKey)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors"
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
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
                  titleColorClass="text-green-600"
                  bgClass="bg-green-50 text-green-900"
                />
              )}
              
              {!selectedLog.oldValues && !selectedLog.newValues && (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No hay detalles de valores para esta acción.
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
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
