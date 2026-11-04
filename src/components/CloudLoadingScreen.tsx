import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Mientras se traen los datos de la cuenta desde la nube, justo al entrar.
 * Suele durar un instante; sin internet no se queda aquí (sigue con la copia
 * del teléfono).
 */
export const CloudLoadingScreen: React.FC = () => (
  <div
    role="status"
    className="min-h-screen bg-[#f8f9fa] w-full flex flex-col items-center justify-center text-center p-6 space-y-4"
  >
    <Loader2 className="w-8 h-8 text-[#0bc4a0] animate-spin" aria-hidden="true" />
    <p className="text-base font-semibold text-gray-700">Cargando tus datos…</p>
  </div>
);
