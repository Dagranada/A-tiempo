import React from 'react';
import { CalendarCheck, CheckCircle2, Clock, Pill, X } from 'lucide-react';
import { DoseItem } from '../types';
import { EmptyState } from './EmptyState';

interface HorarioViewProps {
  doses: DoseItem[]; // tomas de hoy, calculadas desde los planes
  hasPlans: boolean; // hay planes aunque hoy no tengan tomas (cada 2 días, aún no empieza…)
  onMarkAsTaken: (doseId: string) => void;
  onUndoTaken: (doseId: string) => void; // "Deshacer" en Ya tomadas, si se marcó por error
  onNavigateToScan: () => void; // "Crear plan" abre el escáner
  claimNotices: { key: string; planName: string; text: string }[]; // p. ej. "Mañana toca reclamar Losartán"
  onOpenPastas: () => void;
  onDismissNotice: (key: string) => void; // ocultar ese aviso por hoy
}

export const HorarioView: React.FC<HorarioViewProps> = ({
  doses,
  hasPlans,
  onMarkAsTaken,
  onUndoTaken,
  onNavigateToScan,
  claimNotices,
  onOpenPastas,
  onDismissNotice,
}) => {
  const pendingDoses = doses.filter((d) => d.status === 'pending');
  const upcomingDoses = doses.filter((d) => d.status === 'upcoming');
  const takenDoses = doses.filter((d) => d.status === 'taken');

  return (
    <div className="px-5 py-6 space-y-7 pb-28 flex-1 flex flex-col">
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

      {/* Estado vacío: aún no hay plan, así que no hay horario */}
      {!hasPlans && <EmptyState title="No tienes un horario" onCreate={onNavigateToScan} />}

      {/* Hay planes, pero ninguno tiene tomas hoy: no es un estado vacío */}
      {hasPlans && doses.length === 0 && (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-heading">Hoy no hay tomas</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Ningún plan tiene tomas para hoy. Puedes revisarlos en Mis planes.
            </p>
          </div>
        </div>
      )}

      {/* PENDIENTES DE HOY */}
      {(pendingDoses.length > 0 || upcomingDoses.length > 0) && (
        <section>
          <h2 className="text-[13px] font-bold tracking-wider text-gray-500 uppercase mb-3.5 flex items-center justify-between font-inter">
            <span>Pendientes de hoy</span>
            <span className="text-xs font-normal text-gray-400 font-sans">
              {pendingDoses.length + upcomingDoses.length}{' '}
              {pendingDoses.length + upcomingDoses.length === 1 ? 'toma restante' : 'tomas restantes'}
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
                  className="w-full mt-3 bg-[linear-gradient(90deg,#0ee5ba,#19cdff)] hover:brightness-95 text-gray-900 font-bold py-2.5 rounded-full transition-all text-sm shadow-sm active:scale-[0.98] flex items-center justify-center space-x-2"
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
      {takenDoses.length > 0 && (
        <section className="pt-2">
          <h2 className="text-[13px] font-bold tracking-wider text-gray-500 uppercase mb-3 flex items-center justify-between font-inter">
            <span>Ya Tomadas</span>
            <span className="text-xs text-emerald-600 font-medium font-sans">
              {takenDoses.length} {takenDoses.length === 1 ? 'completada' : 'completadas'}
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
                {/* Hora en que se marcó y, debajo, "Deshacer" por si fue un error */}
                <div className="flex flex-col items-end shrink-0 ml-3">
                  <span className="text-[13px] font-semibold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                    {dose.takenAt || dose.timeFormatted}
                  </span>
                  <button
                    onClick={() => onUndoTaken(dose.id)}
                    aria-label={`Deshacer: ${dose.medicationName} de las ${dose.timeFormatted} vuelve a pendiente`}
                    className="mt-1 text-sm font-semibold text-gray-500 hover:text-gray-900 px-2 py-0.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0ee5ba]"
                  >
                    Deshacer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
