import React from 'react';
import { BellRing, Clock, Map, Pill, User } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onTapTestAlarm2: () => void;
  onTapTestAlarm3: () => void;
  onTapTestAlarm4: () => void;
  hasClaimToday: boolean; // punto en "Pastas" si hay que reclamar hoy o mañana
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onTapTestAlarm2,
  onTapTestAlarm3,
  onTapTestAlarm4,
  hasClaimToday,
}) => {
  return (
    <nav className="bg-white border-t border-gray-200 px-2 py-2 flex justify-between items-center fixed bottom-0 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl left-1/2 -translate-x-1/2 z-30 shrink-0">
      {/* 1. Horario */}
      <button
        onClick={() => onSelectTab('horario')}
        className="flex flex-col items-center py-2 px-0.5 w-1/7 transition-colors"
      >
        <div
          className={`px-4 py-1 rounded-full mb-0.5 flex items-center justify-center transition-all ${
            activeTab === 'horario'
              ? 'bg-[#d0f8ed] text-[#0bc4a0]'
              : 'text-gray-400'
          }`}
        >
          <Clock className="w-5 h-5" />
        </div>
        <span
          className={`text-[11px] font-semibold whitespace-nowrap ${
            activeTab === 'horario' ? 'text-[#0bc4a0]' : 'text-gray-500'
          }`}
        >
          Horario
        </span>
      </button>

      {/* 2. Mis planes */}
      <button
        onClick={() => onSelectTab('planes')}
        className="flex flex-col items-center py-2 px-0.5 w-1/7 transition-colors"
      >
        <div
          className={`px-4 py-1 rounded-full mb-0.5 flex items-center justify-center transition-all ${
            activeTab === 'planes'
              ? 'bg-[#d0f8ed] text-[#0bc4a0]'
              : 'text-gray-400'
          }`}
        >
          <Map className="w-5 h-5" />
        </div>
        <span
          className={`text-[11px] font-semibold whitespace-nowrap ${
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
        className="flex flex-col items-center py-2 px-0.5 w-1/7 transition-colors"
      >
        <div
          className={`relative px-4 py-1 rounded-full mb-0.5 flex items-center justify-center transition-all ${
            activeTab === 'pastas' ? 'bg-[#d0f8ed] text-[#0bc4a0]' : 'text-gray-400'
          }`}
        >
          <Pill className="w-5 h-5" />
          {hasClaimToday && (
            <span className="absolute top-0.5 right-2.5 w-2.5 h-2.5 bg-[#ff5f56] rounded-full ring-2 ring-white motion-safe:animate-pulse" />
          )}
        </div>
        <span
          className={`text-[11px] font-semibold whitespace-nowrap ${
            activeTab === 'pastas' ? 'text-[#0bc4a0]' : 'text-gray-500'
          }`}
        >
          Pastas
        </span>
      </button>

      {/* 4. Alarma, versión 2 (temporal): diseño alternativo para comparar */}
      <button
        onClick={onTapTestAlarm2}
        aria-label="Probar alarma, versión 2"
        className="flex flex-col items-center py-2 px-0.5 w-1/7 transition-colors"
      >
        <div className="px-4 py-1 rounded-full mb-0.5 flex items-center justify-center transition-all text-gray-400">
          <BellRing className="w-5 h-5" />
        </div>
        <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">Alarma 2</span>
      </button>

      {/* 5. Alarma, versión 3 (temporal): la 2 con otro fondo */}
      <button
        onClick={onTapTestAlarm3}
        aria-label="Probar alarma, versión 3"
        className="flex flex-col items-center py-2 px-0.5 w-1/7 transition-colors"
      >
        <div className="px-4 py-1 rounded-full mb-0.5 flex items-center justify-center transition-all text-gray-400">
          <BellRing className="w-5 h-5" />
        </div>
        <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">Alarma 3</span>
      </button>

      {/* 6. Alarma, versión 4 (temporal): sin píldora, texto al centro */}
      <button
        onClick={onTapTestAlarm4}
        aria-label="Probar alarma, versión 4"
        className="flex flex-col items-center py-2 px-0.5 w-1/7 transition-colors"
      >
        <div className="px-4 py-1 rounded-full mb-0.5 flex items-center justify-center transition-all text-gray-400">
          <BellRing className="w-5 h-5" />
        </div>
        <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">Alarma 4</span>
      </button>

      {/* 7. Perfil */}
      <button
        onClick={() => onSelectTab('perfil')}
        className="flex flex-col items-center py-2 px-0.5 w-1/7 transition-colors"
      >
        <div
          className={`px-4 py-1 rounded-full mb-0.5 flex items-center justify-center transition-all ${
            activeTab === 'perfil'
              ? 'bg-[#d0f8ed] text-[#0bc4a0]'
              : 'text-gray-400'
          }`}
        >
          <User className="w-5 h-5" />
        </div>
        <span
          className={`text-[11px] font-semibold whitespace-nowrap ${
            activeTab === 'perfil' ? 'text-[#0bc4a0]' : 'text-gray-500'
          }`}
        >
          Perfil
        </span>
      </button>
    </nav>
  );
};
