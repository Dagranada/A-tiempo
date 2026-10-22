import React from 'react';
import { CheckCircle2, Clock, Pill, Plus, Sparkles, X } from 'lucide-react';
import { DoseItem } from '../types';

interface HorarioViewProps {
  doses: DoseItem[];
  isEmptyState: boolean;
  onMarkAsTaken: (doseId: string) => void;
  onNavigateToScan: () => void;
  onNavigateToForm: () => void;
  claimNotices: { key: string; planName: string; text: string }[]; // p. ej. "Mañana toca reclamar Losartán"
  onOpenPastas: () => void;
  onDismissNotice: (key: string) => void; // ocultar ese aviso por hoy
}

export const HorarioView: React.FC<HorarioViewProps> = ({
  doses,
  isEmptyState,
  onMarkAsTaken,
  onNavigateToScan,
  onNavigateToForm,
  claimNotices,
  onOpenPastas,
  onDismissNotice,
}) => {
  const pendingDoses = isEmptyState ? [] : doses.filter((d) => d.status === 'pending');
  const upcomingDoses = isEmptyState ? [] : doses.filter((d) => d.status === 'upcoming');
  const takenDoses = isEmptyState ? [] : doses.filter((d) => d.status === 'taken');

  return (
    <div className="px-5 py-6 space-y-7 pb-28">
      {/* Reclamos en la EPS de hoy o mañana: se ven al abrir la app aunque los
          recordatorios estén apagados (solo suenan con la app abierta). */}
      {claimNotices.length > 0 && (
        <div className="space-y-3">
          {claimNotices.map((notice) => (
            <div
              key={notice.key}
              className="bg-[#d0f8ed]/80 rounded-3xl shadow-sm flex items-center pr-2"
            >
              <button
                onClick={onOpenPastas}
                className="flex-1 min-w-0 flex items-center space-x-4 p-4 text-left rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0ee5ba]"
              >
                <span className="w-12 h-12 rounded-full bg-[#0ee5ba]/25 text-[#087064] flex items-center justify-center shrink-0">
                  <Pill className="w-6 h-6" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-base font-semibold text-[#087064] leading-snug">{notice.text}</span>
                  <span className="block text-sm text-[#087064]/75 mt-0.5">Toca para ver tus pastas</span>
                </span>
              </button>
              <button
                onClick={() => onDismissNotice(notice.key)}
                aria-label={`Ocultar el aviso de ${notice.planName} por hoy`}
                className="p-2.5 rounded-full text-[#087064]/70 hover:text-[#087064] hover:bg-[#0ee5ba]/15 transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0ee5ba]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {(isEmptyState || doses.length === 0) && (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center shadow-sm space-y-5 my-4">
          <div className="w-20 h-20 bg-[#d0f8ed] text-[#0bc4a0] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 font-heading">
              Sin medicamentos programados
            </h3>
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
              No tienes tomas pendientes. Escanea la foto de una receta o caja para armar el horario de Alberto en segundos.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onNavigateToScan}
              className="bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold px-5 py-2.5 rounded-full transition-all text-sm shadow-sm flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <span>Escanear medicamento</span>
            </button>
            <button
              onClick={onNavigateToForm}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-full transition-all flex items-center justify-center space-x-1.5 text-sm active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Crear a mano</span>
            </button>
          </div>
        </div>
      )}

      {/* PENDIENTES DE HOY */}
      {!isEmptyState && (pendingDoses.length > 0 || upcomingDoses.length > 0) && (
        <section>
          <h2 className="text-[13px] font-bold tracking-wider text-gray-500 uppercase mb-3.5 flex items-center justify-between font-inter">
            <span>Pendientes de hoy</span>
            <span className="text-xs font-normal text-gray-400 font-sans">
              {pendingDoses.length + upcomingDoses.length} tomas restantes
            </span>
          </h2>

          <div className="space-y-4">
            {/* Active Pending Cards */}
            {pendingDoses.map((dose) => (
              <article
                key={dose.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-[#E2E8F0] relative transition-all hover:shadow-md"
              >
                <div className="flex items-center">
                  {/* Time Column */}
                  <div className="w-20 shrink-0 border-r border-[#E2E8F0] pr-4 flex flex-col justify-center items-center">
                    <span className="text-[22px] font-bold leading-none text-gray-900">
                      {dose.timeFormatted.split(' ')[0]}
                    </span>
                    <span className="text-[13px] text-gray-500 font-semibold mt-1">
                      {dose.timeFormatted.split(' ')[1]}
                    </span>
                  </div>

                  {/* Details Column */}
                  <div className="pl-4 flex-1">
                    <h3 className="text-[18px] font-bold text-gray-900">
                      {dose.medicationName}
                    </h3>
                    <p className="text-[14px] text-gray-500 mt-0.5 font-medium">
                      {dose.dose}
                    </p>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={() => onMarkAsTaken(dose.id)}
                  className="w-full mt-3 bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 rounded-full transition-all text-sm shadow-sm active:scale-[0.98] flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-gray-900" />
                  <span>Listo</span>
                </button>
              </article>
            ))}

            {/* Upcoming Cards */}
            {upcomingDoses.map((dose) => (
              <article
                key={dose.id}
                className="bg-white rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-[#E2E8F0] opacity-90"
              >
                <div className="flex items-center">
                  {/* Time Column */}
                  <div className="w-20 shrink-0 border-r border-[#E2E8F0] pr-4 flex flex-col justify-center items-center opacity-70">
                    <span className="text-[22px] font-medium leading-none text-gray-600">
                      {dose.timeFormatted.split(' ')[0]}
                    </span>
                    <span className="text-[13px] text-gray-500 font-medium mt-1">
                      {dose.timeFormatted.split(' ')[1]}
                    </span>
                  </div>

                  {/* Details Column */}
                  <div className="pl-4 flex-1">
                    <h3 className="text-[18px] font-bold text-gray-900">
                      {dose.medicationName}
                    </h3>
                    <p className="text-[14px] text-gray-500 mt-0.5">
                      {dose.dose}
                    </p>
                  </div>
                </div>

                {dose.nextTakeNotice && (
                  <div className="mt-4 bg-gray-50 text-gray-600 text-[13px] font-medium rounded-full flex items-center justify-center space-x-2 border border-[#E2E8F0] py-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{dose.nextTakeNotice}</span>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* YA TOMADAS SECTION */}
      {!isEmptyState && takenDoses.length > 0 && (
        <section className="pt-2">
          <h2 className="text-[13px] font-bold tracking-wider text-gray-500 uppercase mb-3 flex items-center justify-between font-inter">
            <span>Ya Tomadas</span>
            <span className="text-xs text-emerald-600 font-medium font-sans">
              {takenDoses.length} completadas
            </span>
          </h2>

          <div className="bg-transparent space-y-1">
            {takenDoses.map((dose, idx) => (
              <div
                key={dose.id}
                className={`flex items-center justify-between py-3 ${
                  idx !== takenDoses.length - 1 ? 'border-b border-[#E2E8F0]' : ''
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="text-[#0bc4a0] bg-[#d0f8ed] p-1.5 rounded-full shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-gray-800">
                      {dose.medicationName}
                    </h3>
                    <p className="text-[13px] text-gray-500">{dose.dose}</p>
                  </div>
                </div>
                <span className="text-[13px] font-semibold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                  {dose.takenAt || dose.timeFormatted}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
