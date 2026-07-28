import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QrScannerModalProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const QrScannerModal: React.FC<QrScannerModalProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Configuración del escáner
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      /* verbose= */ false
    );

    const onScan = (decodedText: string) => {
      // Limpiamos y detenemos el escáner al detectar
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
      onScanSuccess(decodedText);
    };

    const onError = (errorMessage: string) => {
      // html5-qrcode lanza errores continuamente cuando no detecta un QR
      // los ignoramos silenciosamente
    };

    scannerRef.current.render(onScan, onError);

    // Cleanup al cerrar el modal
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 p-6 rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 animate-fade-in-up">
        
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">Escanear QR de Turno</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-600 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full p-2 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="mb-4 text-sm text-slate-500 dark:text-slate-400 text-center">
          Otorga permisos a tu cámara y apunta al código generado por el paciente para marcar la entrega automáticamente.
        </div>

        {/* Contenedor principal del escáner */}
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-black">
          <div id="qr-reader" className="w-full"></div>
        </div>

      </div>
    </div>
  );
};

export default QrScannerModal;
