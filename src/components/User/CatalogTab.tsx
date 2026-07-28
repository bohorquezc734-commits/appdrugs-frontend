import React, { useState, useEffect, useCallback } from 'react';
import { drugsService, Drug } from '../../services/drugs';
import { toast } from 'react-toastify';
import { CartItem } from '../../pages/UserDashboard';

interface CatalogTabProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const CatalogTab: React.FC<CatalogTabProps> = ({ cart, setCart }) => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loadingDrugs, setLoadingDrugs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const loadDrugs = useCallback(async (page = 1) => {
    try {
      setLoadingDrugs(true);
      const data = await drugsService.getAll({ searchTerm: searchTerm || undefined, page, pageSize });
      setDrugs(data.items);
      setCurrentPage(data.pageNumber);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Error cargando medicamentos');
    } finally {
      setLoadingDrugs(false);
    }
  }, [searchTerm]);

  useEffect(() => { loadDrugs(1); }, [loadDrugs]);

  const handleAddToCart = (drug: Drug) => {
    if (cart.find(c => c.drugId === drug.id)) {
      toast.info('El medicamento ya está en el carrito.');
      return;
    }
    setCart(prev => [...prev, { drugId: drug.id, drugName: drug.name, quantity: 1 }]);
    toast.success('Medicamento agregado. Ve a "Crear Turno" para continuar.');
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Catálogo de Medicamentos</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Explora y añade productos a tu próximo turno.</p>
        </div>
        
        <form 
          onSubmit={e => { e.preventDefault(); loadDrugs(1); }} 
          className="flex w-full md:w-auto gap-3"
        >
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar medicamento..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm placeholder:text-slate-400 dark:text-slate-500 text-slate-700 dark:text-slate-200"
            />
          </div>
          <button 
            type="submit" 
            className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl shadow-md hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Info Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-4 mb-8 flex items-start gap-4">
        <div className="bg-emerald-100 dark:bg-emerald-800/50 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="text-emerald-800 dark:text-emerald-300 font-semibold">Rol: Afiliado</h4>
          <p className="text-emerald-600/80 dark:text-emerald-400/80 text-sm mt-0.5">Puedes explorar todo el inventario disponible y armar tu carrito para programar un retiro en sede.</p>
        </div>
      </div>

      {/* Content */}
      {loadingDrugs ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
          <p className="font-medium">Cargando catálogo...</p>
        </div>
      ) : drugs.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm">
          <div className="text-6xl mb-4">💊</div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No encontramos medicamentos</h3>
          <p className="text-slate-500 dark:text-slate-400">Intenta buscar con otro término o revisa más tarde.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {drugs.map((drug, index) => (
              <div 
                key={drug.id} 
                className="group relative bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-emerald-100 dark:hover:border-emerald-500/50 transition-all duration-300 flex flex-col"
                style={{ animationFillMode: 'both', animationDelay: `${index * 50}ms` }}
              >
                {/* Image Placeholder (Optional) */}
                <div className="w-full h-32 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-700 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <span className="text-4xl filter drop-shadow-sm">💊</span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg tracking-wide uppercase">
                    {drug.category}
                  </span>
                  {drug.requiresPrescription && (
                    <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-lg tracking-wide uppercase flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Receta
                    </span>
                  )}
                </div>

                {/* Content */}
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight mb-1 group-hover:text-emerald-600 transition-colors">{drug.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{drug.genericName}</p>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-400 mb-4 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  {drug.laboratory}
                </p>
                
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-400 font-medium mb-1">Precio Unitario</p>
                    <p className="text-2xl font-black text-emerald-600 leading-none">${drug.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 dark:text-slate-400 font-medium mb-1">Stock</p>
                    <p className={`text-sm font-bold ${drug.stock > 10 ? 'text-slate-700 dark:text-slate-300' : 'text-rose-500'}`}>
                      {drug.stock} un.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5">
                  <button 
                    onClick={() => handleAddToCart(drug)}
                    className="w-full py-3 bg-slate-900 text-white font-semibold rounded-xl shadow-md hover:bg-emerald-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Añadir al Turno
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-12 mb-8">
            <button 
              onClick={() => loadDrugs(currentPage - 1)} 
              disabled={currentPage === 1}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-white dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              ← Anterior
            </button>
            <span className="font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg">
              {currentPage} de {totalPages}
            </span>
            <button 
              onClick={() => loadDrugs(currentPage + 1)} 
              disabled={currentPage >= totalPages}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-white dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CatalogTab;
