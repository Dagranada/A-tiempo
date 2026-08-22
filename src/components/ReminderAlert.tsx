import React from 'react';
import { CheckCircle2, Clock, Pill } from 'lucide-react';
import { DoseItem } from '../types';

interface ReminderAlertProps {
  dose: DoseItem;
  onMarkAsTaken: (doseId: string) => void;
  onSnooze: () => void;
}

export const ReminderAlert: React.FC<ReminderAlertProps> = ({
  dose,
  onMarkAsTaken,
  onSnooze,
}) => {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="reminder-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-sm text-center space-y-5 w-full">
        {/* Icono con punto de atención */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="w-20 h-20 bg-[#d0f8ed] text-[#0bc4a0] rounded-full flex items-center justify-center shadow-inner">
            <Pill className="w-10 h-10" />
          </div>
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#ff5f56] rounded-full ring-2 ring-white motion-safe:animate-pulse" />
        </div>

        <div>
          <h2
            id="reminder-title"
            className="text-2xl font-extrabold text-gray-900 font-heading"
          >
            Es hora de la pastilla
          </h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Es hora de tomar{' '}
            <span className="font-bold text-gray-900">{dose.dose}</span> de{' '}
            <span className="font-bold text-gray-900">{dose.medicationName}</span>
          </p>
        </div>

        {/* Hora programada de la toma */}
        <div className="bg-gray-50 text-gray-600 text-[13px] font-medium rounded-full flex items-center justify-center space-x-2 border border-[#E2E8F0] py-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>Programada para las {dose.timeFormatted}</span>
        </div>

        <div className="space-y-3 pt-1">
          <button
            onClick={() => onMarkAsTaken(dose.id)}
            className="w-full bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 px-5 rounded-full text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-5 h-5 text-gray-900" />
            <span>Listo, ya la tomó</span>
          </button>

          <button
            onClick={onSnooze}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-full text-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5"
          >
            <Clock className="w-4 h-4" />
            <span>Recordar en 5 minutos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
