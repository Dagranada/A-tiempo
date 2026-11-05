import React from 'react';
import { Loader2, RotateCcw, WifiOff } from 'lucide-react';

interface CloudLoadingScreenProps {
  failed?: boolean; // no se pudieron traer los datos y el teléfono no tiene copia
  onRetry?: () => void;
  onSignOut?: () => void;
}

/**
 * Mientras se traen los datos de la cuenta desde la nube, justo al entrar.
 * Suele durar un instante. Si no se pueden traer y el teléfono no tiene copia,
 * ofrece reintentar (o salir) en vez de quedarse cargando para siempre.
 */
export const CloudLoadingScreen: React.FC<CloudLoadingScreenProps> = ({ failed, onRetry, onSignOut }) => (
  <div
    role={failed ? 'alert' : 'status'}
    className="min-h-screen bg-[#f8f9fa] w-full flex flex-col items-center justify-center text-center p-6 space-y-4"
  >
    {failed ? (
      <>
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center">
          <WifiOff className="w-8 h-8" aria-hidden="true" />
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 font-heading">No pudimos traer tus datos</p>
          <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Revisa tu conexión a internet e intenta de nuevo.
          </p>
        </div>
        <div className="w-full max-w-xs space-y-2.5">
          <button
            onClick={onRetry}
            className="w-full bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 px-5 rounded-full text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Intentar de nuevo</span>
          </button>
          <button
            onClick={onSignOut}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-full text-sm transition-all active:scale-[0.98] flex items-center justify-center"
          >
            Entrar con otro correo
          </button>
        </div>
      </>
    ) : (
      <>
        <Loader2 className="w-8 h-8 text-[#0bc4a0] animate-spin" aria-hidden="true" />
        <p className="text-base font-semibold text-gray-700">Cargando tus datos…</p>
      </>
    )}
  </div>
);
