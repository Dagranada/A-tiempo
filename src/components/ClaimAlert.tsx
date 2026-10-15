import React, { useState } from 'react';
import { CheckCircle2, Minus, Plus } from 'lucide-react';
import { DueClaim } from '../hooks/useClaimReminders';
import { formatDayMonth, toIsoDate } from '../lib/claims';
import { ALARM_PRIMARY_BUTTON, ALARM_SECONDARY_BUTTON, AlarmShell } from './AlarmShell';

const MIN_SNOOZE_HOURS = 1;
const MAX_SNOOZE_HOURS = 12;
const DEFAULT_SNOOZE_HOURS = 2;

interface ClaimAlertProps {
  claim: DueClaim;
  onClaimed: (planId: string) => void; // "Ya lo reclamé" (solo cuando ya se puede reclamar)
  onAcknowledge: (key: string) => void; // "Entendido" (aviso del día anterior)
  onSnooze: (key: string, hours: number) => void;
}

/**
 * Aviso de reclamo en la EPS: el día anterior ("Mañana toca reclamar") y el día
 * de reclamar en adelante ("Hoy toca reclamar"). Mismo diseño que la alarma de
 * toma; se puede posponer eligiendo en cuántas horas volver a avisar.
 */
export const ClaimAlert: React.FC<ClaimAlertProps> = ({ claim, onClaimed, onAcknowledge, onSnooze }) => {
  const [hours, setHours] = useState(DEFAULT_SNOOZE_HOURS);
  const { plan, cycle, kind, orderMonths } = claim;
  const isLate = kind === 'today' && toIsoDate(new Date()) > cycle.dueDate;

  const heading =
    kind === 'tomorrow' ? 'Mañana toca reclamar:' : isLate ? 'Sigue pendiente reclamar:' : 'Hoy toca reclamar:';
  const detail =
    kind === 'tomorrow'
      ? `En la EPS, el ${formatDayMonth(cycle.dueDate)}`
      : `En la EPS, hasta el ${formatDayMonth(cycle.lastDate)}`;

  const hoursLabel = `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  const stepButton =
    'w-14 h-14 shrink-0 rounded-full bg-[#00695e]/30 hover:bg-[#00695e]/40 text-white flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70';

  return (
    <AlarmShell
      version={2}
      titleId="claim-title"
      descriptionId="claim-desc"
      actions={
        <>
          {kind === 'today' ? (
            <button type="button" onClick={() => onClaimed(plan.id)} className={ALARM_PRIMARY_BUTTON}>
              <CheckCircle2 className="w-6 h-6" />
              <span>Ya lo reclamé</span>
            </button>
          ) : (
            <button type="button" onClick={() => onAcknowledge(claim.key)} className={ALARM_PRIMARY_BUTTON}>
              <CheckCircle2 className="w-6 h-6" />
              <span>Entendido</span>
            </button>
          )}

          {/* Posponer: [ − ] Recordarme en N horas [ + ] */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHours((h) => Math.max(MIN_SNOOZE_HOURS, h - 1))}
              disabled={hours <= MIN_SNOOZE_HOURS}
              aria-label="Menos horas"
              className={stepButton}
            >
              <Minus className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => onSnooze(claim.key, hours)}
              className={`${ALARM_SECONDARY_BUTTON} px-2`}
            >
              Recordarme en {hoursLabel}
            </button>
            <button
              type="button"
              onClick={() => setHours((h) => Math.min(MAX_SNOOZE_HOURS, h + 1))}
              disabled={hours >= MAX_SNOOZE_HOURS}
              aria-label="Más horas"
              className={stepButton}
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </>
      }
    >
      <p className="text-[1.05rem] font-medium text-[#087064]/80 text-center">{heading}</p>
      <h2 id="claim-title" className="text-[2.25rem] leading-tight font-extrabold text-[#087064] text-center">
        {plan.name}
      </h2>
      <p id="claim-desc" className="text-[1.25rem] font-bold text-white text-center mt-1">
        {detail}
      </p>
      <p className="w-full text-center text-[0.95rem] leading-snug font-medium text-white/90 mt-4 px-6">
        Entrega {cycle.number} de {orderMonths}. Si no la reclamas este mes, se pierde.
      </p>
    </AlarmShell>
  );
};
