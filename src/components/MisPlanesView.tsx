import React from 'react';
import { Calendar, Clock, Pencil, Pill, Plus, Scan, Trash2 } from 'lucide-react';
import { MedicationPlan } from '../types';

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

  return (
    <div className="px-5 py-6 space-y-6 pb-28">
      {/* Top Title & CTA */}
      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-heading">
            Mis Planes
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Planes activos para Alberto
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
              className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm relative space-y-3.5 hover:border-gray-200 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 font-heading leading-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-center space-x-1">
                  {onEditPlan && (
                    <button
                      onClick={() => onEditPlan(plan)}
                      title="Editar plan"
                      className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeletePlan(plan.id)}
                    title="Eliminar plan"
                    className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Plan Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 p-2.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">
                    Dosis
                  </span>
                  <span className="font-semibold text-gray-800">
                    {plan.dose}
                  </span>
                </div>

                <div className="bg-gray-50 p-2.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">
                    Frecuencia
                  </span>
                  <span className="font-semibold text-gray-800">
                    1 cada {plan.frequencyValue} {plan.frequencyUnit}
                  </span>
                </div>
              </div>

              {/* Date & Initial time stacked */}
              <div className="text-xs text-gray-500 pt-2 border-t border-[#E2E8F0] space-y-1.5">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>
                    Hora inicial:{' '}
                    <strong className="text-gray-800">
                      {plan.initialTime}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="whitespace-nowrap">
                    {plan.startDate} al {plan.endDate}
                  </span>
                </div>
              </div>

              {plan.instructions && (
                <div className="bg-[#fafafa] p-2.5 rounded-xl border border-gray-200 text-xs text-gray-600 italic">
                  {plan.instructions}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
