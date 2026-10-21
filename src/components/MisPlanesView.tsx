import React, { useState } from 'react';
import { Pencil, Pill, Plus, Scan, Trash2 } from 'lucide-react';
import { MedicationPlan } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// "2026-02-01" → "1 Feb 2026". Si no es una fecha válida, se muestra tal cual.
const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d || m > 12) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

// "14:00" → "02:00 PM". Si ya trae AM/PM o no se entiende, se muestra tal cual.
const formatTime12h = (time: string) => {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time;
  const hour = parseInt(match[1], 10);
  const hour12 = hour % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${match[2]} ${hour >= 12 ? 'PM' : 'AM'}`;
};

interface MisPlanesViewProps {
  plans: MedicationPlan[];
  isEmptyState: boolean;
  onNavigateToScan: () => void;
  onNavigateToForm: () => void;
  onEditPlan?: (plan: MedicationPlan) => void;
  onDeletePlan: (planId: string) => void;
}

export const MisPlanesView: React.FC<MisPlanesViewProps> = ({
  plans,
  isEmptyState,
  onNavigateToScan,
  onNavigateToForm,
  onEditPlan,
  onDeletePlan
}) => {
  const activePlans = isEmptyState ? [] : plans;
  // Solo estado visual: qué plan está esperando confirmación para eliminarse.
  const [planToDelete, setPlanToDelete] = useState<MedicationPlan | null>(null);

  return (
    <div className="px-5 py-6 space-y-6 pb-28">
      {/* Top Title & CTA */}
      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-heading">
            Mis Planes
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Planes de medicación activos
          </p>
        </div>
        <button
          onClick={onNavigateToScan}
          className="w-full bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 px-4 rounded-full text-sm flex items-center justify-center space-x-2 shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo plan</span>
        </button>
      </div>

      {/* Empty State */}
      {activePlans.length === 0 && (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center shadow-sm space-y-4 my-4">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <Pill className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-heading">
              No tienes ningún plan creado
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Escanea una foto de la caja o receta médica, o agrega las dosis manualmente.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={onNavigateToScan}
              className="bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold px-5 py-2.5 rounded-full text-sm shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <Scan className="w-4 h-4" />
              <span>Escanear medicamento</span>
            </button>
            <button
              onClick={onNavigateToForm}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-full text-sm flex items-center justify-center space-x-1 transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Omitir y llenar a mano</span>
            </button>
          </div>
        </div>
      )}

      {/* Plan List */}
      {activePlans.length > 0 && (
        <div className="space-y-4">
          {activePlans.map((plan) => (
            <article
              key={plan.id}
              className="bg-white rounded-3xl p-4 min-[380px]:p-5 border border-[#E2E8F0] shadow-sm space-y-4 hover:border-gray-200 transition-colors"
            >
              <div className="flex justify-between items-start pb-4 border-b border-[#E2E8F0]">
                <div className="min-w-0">
                  <h3 className="text-[18px] font-bold text-gray-900 leading-tight">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                </div>

                <div className="flex items-center space-x-1 -mr-1.5 -mt-1 shrink-0">
                  {onEditPlan && (
                    <button
                      onClick={() => onEditPlan(plan)}
                      aria-label={`Editar plan de ${plan.name}`}
                      className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => setPlanToDelete(plan)}
                    aria-label={`Eliminar plan de ${plan.name}`}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Detalles: etiqueta a la izquierda, valor a la derecha */}
              {/* Etiquetas en una columna fija y valores alineados a la izquierda
                  en la segunda, como en la referencia de diseño */}
              <dl className="grid grid-cols-[5.5rem_1fr] min-[380px]:grid-cols-[6.5rem_1fr] gap-x-2 min-[380px]:gap-x-3 gap-y-2.5 text-sm items-baseline">
                <dt className="text-gray-500">Dosis</dt>
                <dd className="font-bold text-gray-900">
                  {plan.dose.split('•').map((part, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="text-gray-400 font-normal mx-1.5">·</span>}
                      <span className="whitespace-nowrap">{part.trim()}</span>
                    </React.Fragment>
                  ))}
                </dd>
                <dt className="text-gray-500">Frecuencia</dt>
                <dd className="font-bold text-gray-900">
                  1 cada {plan.frequencyValue} {plan.frequencyUnit}
                </dd>
                <dt className="text-gray-500">Hora inicial</dt>
                <dd className="font-bold text-gray-900">{formatTime12h(plan.initialTime)}</dd>
                <dt className="text-gray-500">Vigencia</dt>
                <dd className="font-bold text-gray-900">
                  {/* Si no cabe, corta solo después del guion, nunca dentro de una fecha */}
                  <span className="whitespace-nowrap">{formatDate(plan.startDate)} –</span>{' '}
                  <span className="whitespace-nowrap">{formatDate(plan.endDate)}</span>
                </dd>
              </dl>

              {plan.instructions && (
                <div className="bg-gray-50 border border-[#E2E8F0] px-4 py-3 rounded-2xl text-sm text-gray-600 leading-relaxed">
                  {plan.instructions}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {planToDelete && (
        <ConfirmDialog
          title={`¿Eliminar ${planToDelete.name}?`}
          message={
            planToDelete.claim
              ? 'Se borrarán su plan, sus tomas y su orden de la EPS con el historial de reclamos. No se puede deshacer.'
              : 'Se borrarán su plan y sus tomas. No se puede deshacer.'
          }
          confirmLabel="Sí, eliminar"
          onConfirm={() => {
            onDeletePlan(planToDelete.id);
            setPlanToDelete(null);
          }}
          onCancel={() => setPlanToDelete(null)}
        />
      )}
    </div>
  );
};
