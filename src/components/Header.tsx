import React from 'react';
import { Bell } from 'lucide-react';
import { SeniorProfile } from '../types';

interface HeaderProps {
  profile: SeniorProfile;
  isEmptyState: boolean;
  onToggleEmptyState: () => void;
  todayCountPending: number;
  remindersEnabled: boolean;
  onEnableReminders: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  isEmptyState,
  onToggleEmptyState,
  todayCountPending,
  remindersEnabled,
  onEnableReminders
}) => {
  return (
    <header className="bg-white px-5 py-4 flex justify-between items-center border-b border-gray-100 shrink-0 sticky top-0 z-10">
      <div className="flex items-center space-x-3.5">
        {/* User Avatar */}
        <div className="relative">
          <img
            alt={`Foto de perfil de ${profile.name}`}
            className="w-[50px] h-[50px] rounded-full object-cover border-2 border-[#0ee5ba]/20"
            src={profile.avatarUrl}
          />
        </div>
        <div>
          <h1 className="text-[19px] font-bold text-[#1b1c1c] leading-tight">
            {profile.name.split(' ')[0]}
          </h1>
          <p className="text-[14px] text-[#0bc4a0] font-semibold leading-tight mt-0.5">
            Lunes, 24 de febrero
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        {/* Notification Bell */}
        <button
          onClick={onEnableReminders}
          aria-label={
            remindersEnabled
              ? 'Recordatorios activos'
              : 'Activar recordatorios de dosis'
          }
          className={`p-2 relative transition-colors rounded-full ${
            remindersEnabled
              ? 'text-[#0bc4a0] bg-[#d0f8ed] hover:bg-[#0ee5ba]/30'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Bell className="w-6 h-6" />
          {todayCountPending > 0 && !isEmptyState && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ff5f56] rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>
      </div>
    </header>
  );
};
