import React from 'react';
import { Clock, Inbox, Map, Pill, User, UserPlus } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isEmptyState: boolean;
  onToggleEmptyState: () => void; // botón temporal "Empty states"
  hasClaimToday: boolean; // punto en "Pastas" si hay que reclamar hoy o mañana
  onCreateProfile: () => void; // botón temporal "Crear perfil"
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  isEmptyState,
  onToggleEmptyState,
  hasClaimToday,
  onCreateProfile,
}) => {
  return (
    <nav className="bg-white border-t border-gray-200 px-2 py-2 flex justify-between items-center fixed bottom-0 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl left-1/2 -translate-x-1/2 z-30 shrink-0">
      {/* 1. Horario */}
      <button
        onClick={() => onSelectTab('horario')}
        className="flex flex-col items-center py-2 px-0.5 w-1/6 transition-colors"
      >
        <div
          className={`px-3 py-1 rounded-full mb-0.5 flex items-center justify-center transition-all ${
            activeTab === 'horario'
              ? 'bg-[#d0f8ed] text-[#0bc4a0]'
              : 'text-gray-400'
          }`}
        >
          <Clock className="w-5 h-5" />
        </div>
        <span
          className={`text-[11px] font-semibold text-center leading-tight ${
            activeTab === 'horario' ? 'text-[#0bc4a0]' : 'text-gray-500'
          }`}
        >
          Horario
        </span>
      </button>

      {/* 2. Mis planes */}
      <button
        onClick={() => onSelectTab('planes')}
        className="flex flex-col items-center py-2 px-0.5 w-1/6 transition-colors"
      >
        <div
          className={`px-3 py-1 rounded-full mb-0.5 flex items-center justify-center transition-all ${
            activeTab === 'planes'
              ? 'bg-[#d0f8ed] text-[#0bc4a0]'
              : 'text-gray-400'
          }`}
        >
          <Map className="w-5 h-5" />
        </div>
        <span
          className={`text-[11px] font-semibold text-center leading-tight ${
            activeTab === 'planes' ? 'text-[#0bc4a0]' : 'text-gray-500'
          }`}
        >
          Mis planes
        </span>
      </button>

      {/* 3. Pastas: medicamentos que se reclaman en la EPS */}
      <button
        onClick={() => onSelectTab('pastas')}
        aria-label={hasClaimToday ? 'Pastas: hay un reclamo pendiente' : 'Pastas'}
        className="flex flex-col items-center py-2 px-0.5 w-1/6 transition-colors"
      >
        <div
          className={`relative px-3 py-1 rounded-full mb-0.5 flex items-center justify-center transition-all ${
            activeTab === 'pastas' ? 'bg-[#d0f8ed] text-[#0bc4a0]' : 'text-gray-400'
          }`}
        >
          <Pill className="w-5 h-5" />
          {hasClaimToday && (
            <span className="absolute top-0.5 right-2.5 w-2.5 h-2.5 bg-[#ff5f56] rounded-full ring-2 ring-white motion-safe:animate-pulse" />
          )}
        </div>
        <span
          className={`text-[11px] font-semibold text-center leading-tight ${
            activeTab === 'pastas' ? 'text-[#0bc4a0]' : 'text-gray-500'
          }`}
        >
          Pastas
        </span>
      </button>

      {/* 4. Empty states (temporal): muestra Horario, Mis planes y Pastas como
          si no hubiera planes, sin borrar nada. Se apaga tocándolo otra vez. */}
      <button
        onClick={onToggleEmptyState}
        aria-pressed={isEmptyState}
        className="flex flex-col items-center py-2 px-0.5 w-1/6 transition-colors"
      >
        <div
          className={`px-3 py-1 rounded-full mb-0.5 flex items-center justify-center transition-all ${
            isEmptyState ? 'bg-[#d0f8ed] text-[#0bc4a0]' : 'text-gray-400'
          }`}
        >
          <Inbox className="w-5 h-5" />
        </div>
        <span
          className={`text-[11px] font-semibold text-center leading-tight ${
            isEmptyState ? 'text-[#0bc4a0]' : 'text-gray-500'
          }`}
        >
          {/* Con seis botones, las etiquetas largas bajan a dos líneas */}
          Empty states
        </span>
      </button>

      {/* 5. Crear perfil (temporal): abre el flujo "Nuevo perfil" para verlo */}
      <button
        onClick={onCreateProfile}
        className="flex flex-col items-center py-2 px-0.5 w-1/6 transition-colors"
      >
        <div className="px-3 py-1 rounded-full mb-0.5 flex items-center justify-center transition-all text-gray-400">
          <UserPlus className="w-5 h-5" />
        </div>
        <span className="text-[11px] font-semibold text-center leading-tight text-gray-500">
          Crear perfil
        </span>
      </button>

      {/* 6. Perfil */}
      <button
        onClick={() => onSelectTab('perfil')}
        className="flex flex-col items-center py-2 px-0.5 w-1/6 transition-colors"
      >
        <div
          className={`px-3 py-1 rounded-full mb-0.5 flex items-center justify-center transition-all ${
            activeTab === 'perfil'
              ? 'bg-[#d0f8ed] text-[#0bc4a0]'
              : 'text-gray-400'
          }`}
        >
          <User className="w-5 h-5" />
        </div>
        <span
          className={`text-[11px] font-semibold text-center leading-tight ${
            activeTab === 'perfil' ? 'text-[#0bc4a0]' : 'text-gray-500'
          }`}
        >
          Perfil
        </span>
      </button>
    </nav>
  );
};
