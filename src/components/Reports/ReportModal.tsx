import React from 'react';
import ReportButtons from './ReportButtons';
import ReportFilters from './ReportFilters';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'appointments' | 'inventory';
  loading: boolean;
  onExcel: () => void;
  onPdf: () => void;
  onApplyFilters: (filters: any) => void;
  onResetFilters: () => void;
  sedes?: Array<{ id: number; nombreSede: string }>;
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  title,
  type,
  loading,
  onExcel,
  onPdf,
  onApplyFilters,
  onResetFilters,
  sedes,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <ReportFilters
              type={type}
              onApply={onApplyFilters}
              onReset={onResetFilters}
              sedes={sedes}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
              <ReportButtons
                onExcel={onExcel}
                onPdf={onPdf}
                loading={loading}
                variant={type === 'appointments' ? 'appointments' : 'inventory'}
              />
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
