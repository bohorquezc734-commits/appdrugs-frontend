import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { useDropzone } from 'react-dropzone';
import { gestoresService, GestorDto } from '../../services/gestores';
import { inventoriesService, InventoryDto } from '../../services/inventories';
import { appointmentsService, CreateAppointmentDetailRequest } from '../../services/appointments';
import { CartItem } from '../../pages/UserDashboard';
import Lottie from 'lottie-react';

interface CreateAppointmentTabProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  selectedGestor: number;
  setSelectedGestor: React.Dispatch<React.SetStateAction<number>>;
  onSuccess: () => void;
}

const CreateAppointmentTab: React.FC<CreateAppointmentTabProps> = ({ 
  cart, setCart, selectedGestor, setSelectedGestor, onSuccess 
}) => {
  const [gestores, setGestores] = useState<GestorDto[]>([]);
  const [sedeInventories, setSedeInventories] = useState<InventoryDto[]>([]);
  const [selectedInventory, setSelectedInventory] = useState<number>(0);
  const [qty, setQty] = useState<number>(1);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [emptyCartAnim, setEmptyCartAnim] = useState<any>(null);

  useEffect(() => {
    fetch('https://assets9.lottiefiles.com/packages/lf20_t9gkjjz4.json')
      .then(res => res.json())
      .then(data => setEmptyCartAnim(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    gestoresService.getAll()
      .then(data => setGestores(data))
      .catch(() => toast.error('Error cargando sedes farmacéuticas'));
  }, []);

  useEffect(() => {
    if (selectedGestor > 0) {
      setLoadingInventory(true);
      inventoriesService.getAll({ gestorFarmaceuticoId: selectedGestor, onlyActive: true })
        .then(data => {
          setSedeInventories(data);
          if (data.length === 0) {
            toast.warn('Esta sede no tiene medicamentos disponibles en inventario');
          }
        })
        .catch((err) => {
          console.error('Error cargando inventario:', err);
          toast.error('Error cargando inventario de la sede');
        })
        .finally(() => setLoadingInventory(false));
    } else {
      setSedeInventories([]);
    }
  }, [selectedGestor]);

  const gestorOptions = gestores.map(g => ({
    value: g.id,
    label: `${g.nombreSede} — ${g.direccion}`
  }));

  const handleGestorSelectChange = (selectedOption: any) => {
    const newGestor = selectedOption ? selectedOption.value : 0;
    
    if (cart.length > 0 && selectedGestor !== 0 && selectedGestor !== newGestor) {
      if (window.confirm("Cambiar de sede vaciará tu carrito actual porque el inventario es diferente. ¿Estás seguro?")) {
        setCart([]);
        setSelectedGestor(newGestor);
        setSelectedInventory(0);
      }
    } else {
      setSelectedGestor(newGestor);
      setSelectedInventory(0);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setArchivo(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    maxFiles: 1
  });

  const inventoryOptions = sedeInventories.map(inv => ({
    value: inv.id,
    label: `${inv.drugName} (Stock: ${inv.quantity})`
  }));

  const addToCart = () => {
    const inv = sedeInventories.find(i => i.id === selectedInventory);
    if (!inv) { toast.warn('Selecciona un medicamento'); return; }
    if (qty < 1)  { toast.warn('La cantidad debe ser al menos 1'); return; }
    if (qty > inv.quantity) { toast.warn(`Solo hay ${inv.quantity} en stock para esta sede`); return; }
    if (cart.find(c => c.drugId === inv.drugId)) {
      toast.warn('Ese medicamento ya está en el pedido');
      return;
    }
    setCart(prev => [...prev, { drugId: inv.drugId, drugName: inv.drugName, quantity: qty }]);
    setSelectedInventory(0);
    setQty(1);
  };

  const removeFromCart = (drugId: number) =>
    setCart(prev => prev.filter(c => c.drugId !== drugId));

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGestor) { toast.warn('Selecciona una sede'); return; }
    if (cart.length === 0) { toast.warn('Agrega al menos un medicamento al pedido'); return; }

    setSubmitting(true);
    try {
      const details: CreateAppointmentDetailRequest[] = [];
      for (const c of cart) {
        const inv = sedeInventories.find(i => i.drugId === c.drugId);
        if (!inv) {
          toast.error(`El medicamento ${c.drugName} no está disponible en la sede seleccionada.`);
          setSubmitting(false);
          return;
        }
        if (c.quantity > inv.quantity) {
          toast.error(`Solo hay ${inv.quantity} de ${c.drugName} en esta sede.`);
          setSubmitting(false);
          return;
        }
        details.push({
          inventoryId: inv.id,
          quantity: c.quantity,
        });
      }

      await appointmentsService.create(selectedGestor, details, archivo || undefined);
      toast.success('¡Turno creado exitosamente!');
      setCart([]);
      setSelectedGestor(0);
      setArchivo(null);
      onSuccess();
    } catch (err: any) {
      console.error('Error creating appointment:', err.response?.data || err);
      let msg = 'Error de conexión o validación al crear el turno.';
      
      if (err.response?.data) {
        if (err.response.data.error) {
          msg = err.response.data.error;
        } else if (err.response.data.errors) {
          const firstError = Object.values(err.response.data.errors)[0] as string[];
          msg = firstError[0];
        } else if (err.response.data.title) {
          msg = err.response.data.title;
        }
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Custom styles for React-Select matching the Emerald theme
  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderRadius: '0.75rem',
      borderColor: state.isFocused ? '#10b981' : '#e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : 'none',
      padding: '2px',
      fontSize: '0.875rem',
      '&:hover': {
        borderColor: '#94a3b8'
      }
    }),
    option: (base: any, state: any) => ({
      ...base,
      fontSize: '0.875rem',
      backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#ecfdf5' : 'white',
      color: state.isSelected ? 'white' : '#1e293b',
      cursor: 'pointer'
    })
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Agendar Nuevo Turno</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Configura tu pedido y selecciona la sede de retiro.</p>
      </div>

      <form onSubmit={handleCreateAppointment}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Setup */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Sede */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">1</div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Selecciona la Sede Farmacéutica</h3>
              </div>
              
              {gestores.length === 0 ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mr-2"></div>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Cargando sedes...</span>
                </div>
              ) : (
                <Select
                  value={gestorOptions.find(o => o.value === selectedGestor) || null}
                  onChange={handleGestorSelectChange}
                  options={gestorOptions}
                  placeholder="-- Selecciona una sede --"
                  isClearable
                  styles={selectStyles}
                />
              )}
            </div>

            {/* Step 2: Auth File */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">2</div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Archivo de Autorización</h3>
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs px-2 py-1 rounded-md font-medium ml-auto">Opcional</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 ml-13">Adjunta la autorización médica si algún medicamento la requiere.</p>
              
              <div 
                {...getRootProps()} 
                className={`ml-0 sm:ml-13 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:bg-slate-900/50 hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                <input {...getInputProps()} />
                <div className="mb-3 flex justify-center">
                  <svg className={`w-10 h-10 ${isDragActive ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className={`font-semibold ${isDragActive ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-300'}`}>
                  {isDragActive ? "Suelta el archivo aquí..." : "Arrastra y suelta tu archivo aquí"}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">o haz clic para explorar (PDF, JPG, PNG)</p>
              </div>

              {archivo && (
                <div className="ml-0 sm:ml-13 mt-4 flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium overflow-hidden">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span className="truncate">{archivo.name}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); setArchivo(null); }}
                    className="text-emerald-500 hover:text-emerald-700 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Cart */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">3</div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Resumen del Pedido</h3>
              </div>

              {loadingInventory && (
                <div className="flex items-center text-emerald-600 text-sm mb-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500 mr-2"></div>
                  Sincronizando inventario...
                </div>
              )}
              
              {!loadingInventory && selectedGestor > 0 && sedeInventories.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm font-medium mb-4 flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Esta sede no tiene medicamentos en stock.
                </div>
              )}

              {/* Add item input group */}
              <div className="flex flex-col sm:flex-row gap-2 mb-6 bg-slate-50 dark:bg-slate-800 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex-1">
                  <Select
                    value={inventoryOptions.find(o => o.value === selectedInventory) || null}
                    onChange={(opt: any) => setSelectedInventory(opt ? opt.value : 0)}
                    options={inventoryOptions}
                    isDisabled={selectedGestor === 0 || loadingInventory || sedeInventories.length === 0}
                    placeholder="Buscar..."
                    styles={{
                      ...selectStyles,
                      control: (base: any, state: any) => ({
                        ...selectStyles.control(base, state),
                        border: 'none',
                        boxShadow: 'none',
                        backgroundColor: 'transparent'
                      })
                    }}
                  />
                </div>
                <div className="flex gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-2 sm:pt-0 sm:pl-2">
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={e => setQty(Number(e.target.value))}
                    className="w-16 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-center text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <button 
                    type="button" 
                    onClick={addToCart}
                    className="bg-slate-900 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center text-sm font-semibold"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto min-h-[200px]">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                    {emptyCartAnim ? (
                      <Lottie animationData={emptyCartAnim} style={{ width: 100, height: 100, opacity: 0.6 }} />
                    ) : (
                      <div className="text-4xl mb-2 opacity-50">🛒</div>
                    )}
                    <p className="text-slate-500 dark:text-slate-400 font-medium">El carrito está vacío</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Busca medicamentos arriba para añadirlos.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.drugId} className="group flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-emerald-200 dark:hover:border-emerald-500 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
                            {item.quantity}x
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-tight">{item.drugName}</p>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeFromCart(item.drugId)}
                          className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="submit"
                  disabled={submitting || cart.length === 0}
                  className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Confirmar Turno
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateAppointmentTab;
