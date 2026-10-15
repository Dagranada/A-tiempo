import React, { useState } from 'react';
import { Calendar, CalendarCheck, CheckCircle2, ChevronDown, Pill, Plus, Trash2, XCircle } from 'lucide-react';
import { EpsClaim, MedicationPlan } from '../types';
import {
  ClaimCycle,
  ClaimSchedule,
  daysBetween,
  describeCycle,
  formatDayMonth,
  getClaimSchedule,
  toIsoDate,
} from '../lib/claims';
import { Stepper } from './Stepper';

interface PastasViewProps {
  plans: MedicationPlan[];
  onSaveClaim: (planId: string, claim: EpsClaim) => void;
  onMarkClaimed: (planId: string) => void;
  onRemoveClaim: (planId: string) => void;
  onNavigateToPlans: () => void;
}

const inputClass =
  'w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 h-12 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba] transition-all flex items-center';
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5';
const primaryButton =
  'w-full bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 px-5 rounded-full text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2';
const secondaryButton =
  'w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-full text-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5';
const nativePickerClass =
  '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer';

// Color de la píldora de estado según qué tan urgente es reclamar.
function statusTone(cycle: ClaimCycle, today: string): string {
  if (cycle.status === 'open') {
    return cycle.dueDate === today
      ? 'bg-[#d0f8ed] text-[#0b8f75] border-[#0ee5ba]/40'
      : 'bg-amber-50 text-amber-800 border-amber-200';
  }
  return daysBetween(today, cycle.dueDate) === 1
    ? 'bg-[#d0f8ed] text-[#0b8f75] border-[#0ee5ba]/40'
    : 'bg-gray-50 text-gray-600 border-[#E2E8F0]';
}

interface ClaimFormProps {
  plans: MedicationPlan[]; // planes que se pueden elegir
  initialPlanId?: string;
  onSave: (planId: string, claim: EpsClaim) => void;
  onCancel: () => void;
}

/** Registrar (o renovar) la orden de un medicamento que se reclama en la EPS. */
const ClaimForm: React.FC<ClaimFormProps> = ({ plans, initialPlanId, onSave, onCancel }) => {
  const [planId, setPlanId] = useState(initialPlanId ?? plans[0]?.id ?? '');
  const [firstDate, setFirstDate] = useState(toIsoDate(new Date()));
  const [months, setMonths] = useState('6');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderMonths = parseInt(months, 10) || 0;
    if (!planId) return setError('Elige el medicamento');
    if (!firstDate) return setError('Elige la fecha del primer reclamo');
    if (orderMonths < 1) return setError('Ingresa cuántos meses dura la orden');
    onSave(planId, { firstDate, orderMonths, claimedDates: [] });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-5"
    >
      <h3 className="text-lg font-bold text-gray-900 font-heading">Registrar orden de la EPS</h3>

      <div>
        <label htmlFor="claim-plan" className={labelClass}>
          Medicamento *
        </label>
        <div className="relative">
          <select
            id="claim-plan"
            value={planId}
            onChange={(e) => {
              setPlanId(e.target.value);
              setError('');
            }}
            className={`${inputClass} appearance-none pr-10 cursor-pointer`}
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="claim-first" className={labelClass}>
            Primer reclamo *
          </label>
          <div className="relative">
            <input
              id="claim-first"
              type="date"
              value={firstDate}
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
          <label htmlFor="claim-months" className={labelClass}>
            Meses de la orden *
          </label>
          <Stepper
            inputId="claim-months"
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

      <p className="text-xs text-[#0bc4a0] font-semibold">
        Se reclama una vez al mes, desde su día hasta fin de mes. Si un mes no se reclama, se pierde.
      </p>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      <div className="space-y-2.5">
        <button type="submit" className={primaryButton}>
          <CalendarCheck className="w-5 h-5" />
          <span>Guardar orden</span>
        </button>
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

interface ClaimCardProps {
  plan: MedicationPlan;
  schedule: ClaimSchedule;
  today: string;
  onMarkClaimed: () => void;
  onRemove: () => void;
  onRenew: () => void;
}

const ClaimCard: React.FC<ClaimCardProps> = ({ plan, schedule, today, onMarkClaimed, onRemove, onRenew }) => {
  const { current, finished, claimedCount, missedCount, cycles } = schedule;
  const orderMonths = cycles.length;
  const history = cycles.filter((c) => c.status === 'claimed' || c.status === 'missed');

  return (
    <article className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-4">
      <div className="flex justify-between items-start -mx-5 px-5 pb-4 border-b border-[#E2E8F0]">
        <div className="min-w-0">
          <h3 className="text-[18px] font-bold text-gray-900 leading-tight">{plan.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{plan.dose.replace('•', '·')}</p>
        </div>
        <button
          onClick={onRemove}
          aria-label={`Quitar el reclamo de ${plan.name}`}
          className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors -mr-1.5 -mt-1 shrink-0"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {current && (
        <div className="space-y-3">
          <span
            className={`inline-flex items-center text-[13px] font-bold rounded-full px-3 py-1 border ${statusTone(current, today)}`}
          >
            {describeCycle(current, today)}
          </span>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between items-baseline gap-4">
              <dt className="text-gray-500">{current.status === 'open' ? 'Puede reclamar hasta' : 'Le toca reclamar'}</dt>
              <dd className="font-bold text-gray-900 text-right">
                {formatDayMonth(current.status === 'open' ? current.lastDate : current.dueDate)}
              </dd>
            </div>
            <div className="flex justify-between items-baseline gap-4">
              <dt className="text-gray-500">Entrega</dt>
              <dd className="font-bold text-gray-900 text-right">
                {current.number} de {orderMonths}
              </dd>
            </div>
          </dl>
          {current.status === 'open' && (
            <button onClick={onMarkClaimed} className={primaryButton}>
              <CheckCircle2 className="w-5 h-5" />
              <span>Marcar como reclamada</span>
            </button>
          )}
        </div>
      )}

      {finished && (
        <div className="space-y-3">
          <p className="bg-gray-50 px-4 py-3 rounded-2xl text-sm text-gray-600 leading-relaxed">
            La orden terminó ({claimedCount} de {orderMonths} entregas reclamadas). Pide una orden nueva al médico y
            regístrala aquí.
          </p>
          <button onClick={onRenew} className={primaryButton}>
            <Plus className="w-5 h-5" />
            <span>Registrar orden nueva</span>
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div className="pt-1">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Historial{missedCount > 0 ? ` · ${missedCount} ${missedCount === 1 ? 'mes perdido' : 'meses perdidos'}` : ''}
          </p>
          <ul className="space-y-2">
            {history.map((c) => (
              <li key={c.number} className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-2 text-gray-700">
                  {c.status === 'claimed' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#0bc4a0]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>Entrega {c.number}</span>
                </span>
                <span className={c.status === 'claimed' ? 'font-medium text-gray-600' : 'font-bold text-red-500'}>
                  {c.status === 'claimed' && c.claimedOn ? `Reclamada el ${formatDayMonth(c.claimedOn)}` : 'Perdida'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
};

/** Pestaña "Pastas": medicamentos que se reclaman cada mes en la EPS. */
export const PastasView: React.FC<PastasViewProps> = ({
  plans,
  onSaveClaim,
  onMarkClaimed,
  onRemoveClaim,
  onNavigateToPlans,
}) => {
  // Solo estado visual: qué formulario está abierto.
  const [formPlanId, setFormPlanId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const today = toIsoDate(new Date());

  const claimPlans = plans
    .filter((p) => p.claim)
    .map((plan) => ({ plan, schedule: getClaimSchedule(plan.claim!, today) }))
    // Primero lo más urgente; las órdenes terminadas al final.
    .sort((a, b) => {
      const ka = a.schedule.current?.dueDate ?? '9999';
      const kb = b.schedule.current?.dueDate ?? '9999';
      return ka.localeCompare(kb);
    });
  const availablePlans = plans.filter((p) => !p.claim || p.id === formPlanId);

  const openForm = (planId?: string) => {
    setFormPlanId(planId ?? null);
    setIsFormOpen(true);
  };
  const closeForm = () => {
    setIsFormOpen(false);
    setFormPlanId(null);
  };

  return (
    <div className="px-5 py-6 space-y-6 pb-28">
      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-heading">Pastas</h2>
          <p className="text-xs text-gray-500 mt-0.5">Medicamentos que Alberto reclama en la EPS</p>
        </div>
        {!isFormOpen && plans.length > 0 && availablePlans.length > 0 && (
          <button onClick={() => openForm()} className={primaryButton}>
            <Plus className="w-4 h-4" />
            <span>Registrar orden de la EPS</span>
          </button>
        )}
      </div>

      {isFormOpen && (
        <ClaimForm
          plans={availablePlans}
          initialPlanId={formPlanId ?? undefined}
          onSave={(planId, claim) => {
            onSaveClaim(planId, claim);
            closeForm();
          }}
          onCancel={closeForm}
        />
      )}

      {/* Estado vacío: sin planes no hay qué reclamar; con planes, invitar a registrar */}
      {claimPlans.length === 0 && !isFormOpen && (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <Pill className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-heading">Ninguna pasta por reclamar</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
              {plans.length === 0
                ? 'Primero crea el plan del medicamento de Alberto y luego registra aquí su orden de la EPS.'
                : 'Registra la orden de la EPS de un medicamento de Alberto para recordarle cada mes cuándo reclamarlo.'}
            </p>
          </div>
          {plans.length === 0 && (
            <button onClick={onNavigateToPlans} className={secondaryButton}>
              Ir a Mis planes
            </button>
          )}
        </div>
      )}

      {claimPlans.length > 0 && (
        <div className="space-y-4">
          {claimPlans.map(({ plan, schedule }) => (
            <ClaimCard
              key={plan.id}
              plan={plan}
              schedule={schedule}
              today={today}
              onMarkClaimed={() => onMarkClaimed(plan.id)}
              onRemove={() => onRemoveClaim(plan.id)}
              onRenew={() => openForm(plan.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
