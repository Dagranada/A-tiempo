import React from 'react';
import { User } from 'lucide-react';
import { SeniorProfile } from '../types';

interface HeaderProps {
  profile: SeniorProfile;
  today: Date; // reloj de App: cambia solo al pasar la medianoche
}

// "lunes, 3 de noviembre" → "Lunes, 3 de noviembre"
const formatToday = (date: Date) => {
  const text = date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const Header: React.FC<HeaderProps> = ({
  profile,
  today,
}) => {
  return (
    <header className="bg-[#f8f9fa] px-5 py-4 flex justify-between items-center border-b border-gray-100 shrink-0 sticky top-0 z-10">
      <div className="flex items-center space-x-3.5">
        {/* Foto del perfil; sin foto, la silueta (igual que en Perfil) */}
        <div className="relative">
          {profile.avatarUrl ? (
            <img
              alt={`Foto de perfil de ${profile.name}`}
              className="w-[50px] h-[50px] rounded-full object-cover"
              src={profile.avatarUrl}
            />
          ) : (
            <div className="w-[50px] h-[50px] rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
              <User className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-[19px] font-bold text-[#1b1c1c] leading-tight">
            {profile.name.split(' ')[0]}
          </h1>
          <p className="text-[14px] text-[#0bc4a0] font-semibold leading-tight mt-0.5">
            {formatToday(today)}
          </p>
        </div>
      </div>
    </header>
  );
};
