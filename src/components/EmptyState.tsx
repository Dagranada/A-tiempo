import React from 'react';
import { PackageOpen, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  onCreate: () => void;
}

/**
 * Estado vacío común de Horario, Mis planes y Pastas cuando aún no hay ningún
 * plan: sin tarjeta, directo sobre el fondo y centrado en el alto que queda
 * (la vista es flex-col); ícono de caja vacía, título, bajada y un solo botón.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ title, onCreate }) => (
  <div className="flex-1 flex flex-col justify-center text-center space-y-5 py-6">
    <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
      <PackageOpen className="w-10 h-10" strokeWidth={1.75} />
    </div>
    <div>
      <h3 className="text-xl font-bold text-gray-900 font-heading">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
        Por favor créalo aquí para empezar.
      </p>
    </div>
    <button
      onClick={onCreate}
      className="w-full bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 px-5 rounded-full text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
    >
      <Plus className="w-4 h-4" />
      <span>Crear plan</span>
    </button>
  </div>
);
