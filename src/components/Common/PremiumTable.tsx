import React, { ReactNode } from 'react';

export interface ColumnDef<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => ReactNode;
  width?: string;
}

interface PremiumTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function PremiumTable<T>({ 
  columns, 
  data, 
  keyExtractor, 
  loading, 
  emptyMessage = 'No se encontraron registros',
  onRowClick
}: PremiumTableProps<T>) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in-up">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs border-b border-slate-100 dark:border-slate-700">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-5" style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-emerald-600 gap-3">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="font-medium text-slate-500 dark:text-slate-400">Cargando registros...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="text-4xl mb-3 opacity-30 dark:opacity-20">📁</div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr 
                  key={keyExtractor(item)} 
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/80'}`}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      {col.render 
                        ? col.render(item) 
                        : col.accessor 
                          ? <span className="font-medium text-slate-700 dark:text-slate-200">{String(item[col.accessor] ?? '')}</span> 
                          : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
