import React, { useState, useEffect, useCallback } from 'react';
import { drugsService, Drug } from '../../services/drugs';
import { toast } from 'react-toastify';

const PharmacistCatalogTab: React.FC = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loadingDrugs, setLoadingDrugs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [drugCurrentPage, setDrugCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const loadDrugs = useCallback(async (page = 1) => {
    try {
      setLoadingDrugs(true);
      const data = await drugsService.getAll({ searchTerm: searchTerm || undefined, page, pageSize });
      setDrugs(data.items);
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

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Catálogo (Solo Lectura)</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <input 
            type="text" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            placeholder="Buscar medicamento..." 
            className="w-full sm:w-64 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-shadow shadow-sm text-slate-700 dark:text-slate-200"
            onKeyDown={e => e.key === 'Enter' && loadDrugs(1)}
          />
          <button 
            onClick={() => loadDrugs(1)} 
            className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 justify-center"
          >
            🔍 Buscar
          </button>
        </div>
      </div>

      {loadingDrugs ? (
        <p className="text-slate-500 dark:text-slate-400">Cargando catálogo...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {drugs.map(drug => (
              <div key={drug.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 dark:border-slate-800 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{drug.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{drug.genericName} - {drug.laboratory}</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-400 font-medium">Precio</p>
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">${drug.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 dark:text-slate-400 font-medium">Stock Global</p>
                    <p className="text-base font-bold text-blue-600 dark:text-blue-400">{drug.stock}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center gap-3 mt-8">
            <button 
              onClick={() => loadDrugs(drugCurrentPage - 1)} 
              disabled={drugCurrentPage === 1} 
              className="px-5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="px-4 py-2 font-bold text-slate-700 dark:text-slate-200">
              Página {drugCurrentPage} de {totalPages}
            </span>
            <button 
              onClick={() => loadDrugs(drugCurrentPage + 1)} 
              disabled={drugCurrentPage >= totalPages} 
              className="px-5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PharmacistCatalogTab;
