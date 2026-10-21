import React, { useState } from 'react';
import { Calendar, CalendarCheck, CheckCircle2, ChevronDown, Pencil, Pill, Plus, Trash2 } from 'lucide-react';
import { EpsClaim, MedicationPlan } from '../types';
import {
  ClaimCycle,
  ClaimSchedule,
  daysBetween,
  describeCycle,
  formatDayMonth,
  formatFullDate,
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
  initialClaim?: EpsClaim; // editar una orden: conserva sus reclamos
  onSave: (planId: string, claim: EpsClaim) => void;
  onCancel: () => void;
}

/** Registrar (o renovar) la orden de un medicamento que se reclama en la EPS. */
const ClaimForm: React.FC<ClaimFormProps> = ({ plans, initialPlanId, initialClaim, onSave, onCancel }) => {
  const [planId, setPlanId] = useState(initialPlanId ?? plans[0]?.id ?? '');
  const [firstDate, setFirstDate] = useState(initialClaim?.firstDate ?? toIsoDate(new Date()));
  const [months, setMonths] = useState(String(initialClaim?.orderMonths ?? 6));
  const isEditing = Boolean(initialClaim);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderMonths = parseInt(months, 10) || 0;
    if (!planId) return setError('Elige el medicamento');
    if (!firstDate) return setError('Elige la fecha del primer reclamo');
    if (orderMonths < 1) return setError('Ingresa cuántos meses dura la orden');
    onSave(planId, { firstDate, orderMonths, claimedDates: initialClaim?.claimedDates ?? [] });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-5"
    >
      <h3 className="text-lg font-bold text-gray-900 font-heading">
        {isEditing ? 'Editar orden de la EPS' : 'Registrar orden de la EPS'}
      </h3>

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
            disabled={Boolean(initialPlanId)}
            className={`${inputClass} appearance-none pr-10 cursor-pointer disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-default`}
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
  onEdit: () => void;
  onRemove: () => void;
  onRenew: () => void;
}

const ClaimCard: React.FC<ClaimCardProps> = ({ plan, schedule, today, onMarkClaimed, onEdit, onRemove, onRenew }) => {
  const { current, finished, claimedCount, cycles } = schedule;
  const orderMonths = cycles.length;
  const history = cycles.filter((c) => c.status === 'claimed' || c.status === 'missed');
  // La píldora de estado solo aparece cuando ya se puede reclamar (hoy o con
  // atraso): es cuando hay que actuar y aparece el botón.
  const isUrgent = current?.status === 'open';

  return (
    <article className="bg-white rounded-3xl p-4 min-[380px]:p-5 border border-[#E2E8F0] shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">{plan.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{plan.dose.replace('•', '·')}</p>
        </div>
        <div className="flex items-center space-x-1 -mr-1.5 -mt-1 shrink-0">
          <button
            onClick={onEdit}
            aria-label={`Editar la orden de ${plan.name}`}
            className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={onRemove}
            aria-label={`Quitar el reclamo de ${plan.name}`}
            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {current && (
        <div className="space-y-3">
          {isUrgent && (
            <span
              className={`inline-flex items-center text-[13px] font-bold rounded-full px-3 py-1 border ${statusTone(current, today)}`}
            >
              {describeCycle(current, today)}
            </span>
          )}
          {/* Próxima entrega | entrega: siempre en dos columnas, la de la fecha más
              ancha. Por debajo de 380px se ajustan márgenes, proporción y tamaño
              de la fecha para que "30 de septiembre" quepa sin partirse. */}
          <div className="bg-gray-50 rounded-2xl border border-[#E2E8F0] px-3 min-[380px]:px-4 py-3 min-[380px]:py-3.5 flex items-stretch">
            <div className="flex-[2] min-[380px]:flex-[3] min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 whitespace-nowrap">
                {current.status === 'open' ? 'Reclamar hasta' : 'Próxima entrega'}
              </p>
              <p className="text-sm min-[380px]:text-[15px] font-bold text-gray-900 mt-1 whitespace-nowrap">
                {formatDayMonth(current.status === 'open' ? current.lastDate : current.dueDate)}
              </p>
            </div>
            <div className="w-px bg-[#E2E8F0] mx-3 min-[380px]:mx-4" />
            <div className="flex-1 min-[380px]:flex-[2] min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 whitespace-nowrap">Entrega</p>
              <p className="text-sm min-[380px]:text-[15px] font-bold text-gray-900 mt-1 whitespace-nowrap">
                {current.number} de {orderMonths}
              </p>
            </div>
          </div>
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
          <p className="bg-gray-50 px-4 py-3 rounded-2xl border border-[#E2E8F0] text-sm text-gray-600 leading-relaxed">
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
          <p className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Historial</p>
          <ul className="space-y-1.5">
            {history.map((c) => (
              <li key={c.number} className="text-sm">
                <span className="font-medium text-gray-800">Entrega {c.number}:</span>{' '}
                {c.status === 'claimed' && c.claimedOn ? (
                  <span className="text-gray-500">{formatFullDate(c.claimedOn)}</span>
                ) : (
                  <span className="font-semibold text-red-500">Perdida</span>
                )}
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
  // `new` = arriba de la lista; `edit`/`renew` = en el lugar de esa tarjeta.
  const [form, setForm] = useState<{ mode: 'new' | 'edit' | 'renew'; planId?: string } | null>(null);
  const isFormOpen = form !== null;
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
  const availablePlans = plans.filter((p) => !p.claim);
  const closeForm = () => setForm(null);

  return (
    <div className="px-5 py-6 space-y-6 pb-28">
      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-heading">Pastas</h2>
          <p className="text-xs text-gray-500 mt-0.5">Medicamentos para reclamar en la EPS</p>
        </div>
        {!isFormOpen && plans.length > 0 && availablePlans.length > 0 && (
          <button onClick={() => setForm({ mode: 'new' })} className={primaryButton}>
            <Plus className="w-4 h-4" />
            <span>Registrar orden de la EPS</span>
          </button>
        )}
      </div>

      {form?.mode === 'new' && (
        <ClaimForm
          plans={availablePlans}
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
          {claimPlans.map(({ plan, schedule }) =>
            form && form.mode !== 'new' && form.planId === plan.id ? (
              <ClaimForm
                key={plan.id}
                plans={[plan]}
                initialPlanId={plan.id}
                // Editar conserva los reclamos hechos; renovar empieza una orden nueva.
                initialClaim={form.mode === 'edit' ? plan.claim : undefined}
                onSave={(planId, claim) => {
                  onSaveClaim(planId, claim);
                  closeForm();
                }}
                onCancel={closeForm}
              />
            ) : (
              <ClaimCard
                key={plan.id}
                plan={plan}
                schedule={schedule}
                today={today}
                onMarkClaimed={() => onMarkClaimed(plan.id)}
                onEdit={() => setForm({ mode: 'edit', planId: plan.id })}
                onRemove={() => onRemoveClaim(plan.id)}
                onRenew={() => setForm({ mode: 'renew', planId: plan.id })}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};
