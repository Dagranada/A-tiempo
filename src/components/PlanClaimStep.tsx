import React, { useState } from 'react';
import { ArrowLeft, Calendar, CheckCircle2 } from 'lucide-react';
import { MedicationPlan } from '../types';
import { toIsoDate } from '../lib/claims';
import { Stepper } from './Stepper';

interface PlanClaimStepProps {
  plan: MedicationPlan; // el plan del paso 1, aún sin guardar
  onSavePlan: (plan: MedicationPlan) => void;
  onBack: () => void;
  onCancel: () => void; // descarta el plan nuevo
}

const inputClass =
  'w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 h-12 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba] transition-all flex items-center';
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5';
const nativePickerClass =
  '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer';

/**
 * Paso 2 de un plan nuevo: la orden de la EPS. Quien crea el plan acaba de
 * reclamar la medicina y la tiene en la mano, así que la entrega 1 queda
 * reclamada en la fecha elegida (no puede ser futura). Por ahora todos los
 * medicamentos se reclaman en la EPS: "Cancelar" descarta el plan nuevo.
 */
export const PlanClaimStep: React.FC<PlanClaimStepProps> = ({ plan, onSavePlan, onBack, onCancel }) => {
  const todayIso = toIsoDate(new Date());
  const [firstDate, setFirstDate] = useState(todayIso);
  const [months, setMonths] = useState('6');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderMonths = parseInt(months, 10) || 0;
    if (!firstDate || firstDate > todayIso) return setError('Elige la fecha en que lo reclamaste');
    if (orderMonths < 1) return setError('Ingresa cuántos meses dura la orden');
    onSavePlan({ ...plan, claim: { firstDate, orderMonths, claimedDates: [firstDate] } });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto flex flex-col">
      <header className="bg-white px-5 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10 shrink-0">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Volver al plan"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900 font-heading">Reclamo en la EPS</h1>
          <p className="text-xs text-gray-500">Paso 2 de 2</p>
        </div>
        <div className="w-9" /> {/* Spacer */}
      </header>

      <form onSubmit={handleSubmit} className="p-5 pb-8 space-y-5 flex-1 flex flex-col">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-heading leading-tight">{plan.name}</h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            Así te recordamos cada mes cuándo reclamarlo.
          </p>
        </div>

        {/* items-end: a 320px "Meses de la orden" ocupa dos líneas; los campos
            quedan alineados por abajo. */}
        <div className="grid grid-cols-2 gap-3 items-end">
          <div>
            <label htmlFor="plan-claim-first" className={labelClass}>
              Lo reclamaste *
            </label>
            <div className="relative">
              <input
                id="plan-claim-first"
                type="date"
                value={firstDate}
                max={todayIso}
                onChange={(e) => {
                  setFirstDate(e.target.value);
                  setError('');
                }}
                className={`${inputClass} pr-10 relative ${nativePickerClass}`}
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label htmlFor="plan-claim-months" className={labelClass}>
              Meses de la orden *
            </label>
            <Stepper
              inputId="plan-claim-months"
              value={months}
              onChange={(v) => {
                setMonths(v.replace(/\D/g, ''));
                setError('');
              }}
              step={1}
              min={1}
              max={24}
              label="meses"
            />
          </div>
        </div>

        {error ? (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        ) : (
          <p className="text-xs text-[#0bc4a0] font-semibold">La entrega 1 quedará marcada como reclamada.</p>
        )}

        {/* Botones al final de la pantalla */}
        <div className="space-y-2.5 pt-2 mt-auto">
          <button
            type="submit"
            className="w-full bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 px-5 rounded-full text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Guardar plan</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-full text-sm transition-all active:scale-[0.98] flex items-center justify-center"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
