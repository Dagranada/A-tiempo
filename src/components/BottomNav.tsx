import React from 'react';
import { BellRing, Camera, Clock, Map, User } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onTapScan: () => void;
  onTapTestAlarm: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onTapScan,
  onTapTestAlarm,
}) => {
  return (
    <nav className="bg-white border-t border-gray-200 px-2 py-2 flex justify-between items-center fixed bottom-0 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl left-1/2 -translate-x-1/2 z-30 shrink-0">
      {/* 1. Horario */}
      <button
        onClick={() => onSelectTab('horario')}
        className="flex flex-col items-center p-2 w-1/5 transition-colors"
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
          className={`text-[11px] font-semibold ${
            activeTab === 'horario' ? 'text-[#0bc4a0]' : 'text-gray-500'
          }`}
        >
          Horario
        </span>
      </button>

      {/* 2. Mis planes */}
      <button
        onClick={() => onSelectTab('planes')}
        className="flex flex-col items-center p-2 w-1/5 transition-colors"
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
          className={`text-[11px] font-semibold ${
            activeTab === 'planes' ? 'text-[#0bc4a0]' : 'text-gray-500'
          }`}
        >
          Mis planes
        </span>
      </button>

      {/* 3. Escanear (Required trigger to camera screen) */}
      <button
        onClick={onTapScan}
        className="flex flex-col items-center p-2 w-1/5 group transition-colors"
      >
        <div
          className={`px-4 py-1 rounded-full mb-0.5 flex items-center justify-center transition-all ${
            activeTab === 'escanear'
              ? 'bg-[#0ee5ba] text-gray-950 scale-105'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Camera className="w-5 h-5" />
        </div>
        <span
          className={`text-[11px] font-semibold ${
            activeTab === 'escanear' ? 'text-[#0bc4a0]' : 'text-gray-500'
          }`}
        >
          Escanear
        </span>
      </button>

      {/* 4. Alarma de prueba (temporal): no es una pestaña, dispara la alerta */}
      <button
        onClick={onTapTestAlarm}
        aria-label="Probar alarma"
        className="flex flex-col items-center p-2 w-1/5 transition-colors"
      >
        <div className="px-4 py-1 rounded-full mb-0.5 flex items-center justify-center transition-all text-gray-400">
          <BellRing className="w-5 h-5" />
        </div>
        <span className="text-[11px] font-semibold text-gray-500">Alarma</span>
      </button>

      {/* 5. Perfil */}
      <button
        onClick={() => onSelectTab('perfil')}
        className="flex flex-col items-center p-2 w-1/5 transition-colors"
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
          className={`text-[11px] font-semibold ${
            activeTab === 'perfil' ? 'text-[#0bc4a0]' : 'text-gray-500'
          }`}
        >
          Perfil
        </span>
      </button>
    </nav>
  );
};
