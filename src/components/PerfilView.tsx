import React from 'react';
import {
  Asterisk,
  Bell,
  CheckCircle2,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { SeniorProfile } from '../types';

interface PerfilViewProps {
  profile: SeniorProfile;
}

export const PerfilView: React.FC<PerfilViewProps> = ({
  profile,
}) => {
  return (
    <div className="px-5 py-6 space-y-6 pb-28">
      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center pt-2 pb-2">
        <div className="relative">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-28 h-28 rounded-full object-cover shadow-sm"
          />
        </div>
        <h1 className="text-2xl font-bold text-[#1b1c1c] mt-4 font-heading">
          {profile.name}
        </h1>
        <div className="flex items-center space-x-1.5 mt-1 text-sm text-gray-600 font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#27c93f] fill-[#27c93f] stroke-white" />
          <span>Perfil activo</span>
        </div>
      </div>

      {/* Profile Options Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {/* Contactos de emergencia */}
        <button
          type="button"
          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors border-b border-[#E2E8F0]"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
              <Asterisk className="w-6 h-6 text-gray-900 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-gray-900">
                Contactos de emergencia
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Hija (María), Dr. Ruiz
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 ml-2" />
        </button>

        {/* Información médica */}
        <button
          type="button"
          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors border-b border-[#E2E8F0]"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-gray-900">
                Información médica
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Alergias, Condiciones, Peso
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 ml-2" />
        </button>

        {/* Notificaciones */}
        <button
          type="button"
          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-gray-900">
                Notificaciones
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Sonido, Vibración, Alertas familiares
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 ml-2" />
        </button>
      </div>
    </div>
  );
};

