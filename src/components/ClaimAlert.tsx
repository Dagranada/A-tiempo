import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { DueClaim } from '../hooks/useClaimReminders';
import { formatDayMonth, toIsoDate } from '../lib/claims';
import { ALARM_PRIMARY_BUTTON, ALARM_TEXT, AlarmShell, SnoozeControl, alarmNameSize } from './AlarmShell';

/**
 * Aviso de reclamo de prueba (botones temporales del menú): "Reclamo" = hoy
 * debes reclamar; "Mañana" = el aviso del día anterior. Entrega 3 de 6, con el
 * mismo medicamento que la alarma de prueba (Metformina, ADR 0006). Sus
 * botones solo cierran la pantalla.
 */
export function buildTestClaim(kind: DueClaim['kind'] = 'today'): DueClaim {
  const today = new Date();
  const dueDay = new Date(today);
  if (kind === 'tomorrow') dueDay.setDate(dueDay.getDate() + 1);
  const lastDay = new Date(dueDay.getFullYear(), dueDay.getMonth() + 1, 0);
  return {
    key: `prueba-${kind}`,
    kind,
    orderMonths: 6,
    plan: {
      id: 'prueba',
      name: 'Metformina',
      description: 'Control de glucosa en sangre',
      dose: '1 pastilla • 850mg',
      initialTime: '14:00',
      frequencyValue: 24,
      frequencyUnit: 'horas',
      startDate: toIsoDate(today),
      endDate: toIsoDate(lastDay),
      createdAt: today.toISOString(),
    },
    cycle: {
      number: 3,
      dueDate: toIsoDate(dueDay),
      lastDate: toIsoDate(lastDay),
      status: kind === 'tomorrow' ? 'upcoming' : 'open',
    },
  };
}

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

  // "Hoy debes reclamar: / Metformina / 22 de octubre / Entrega 3 de 6"
  // "HOY" / "MAÑANA" destacado en su propia línea (blanco, mayúsculas) para que
  // no se confundan los dos avisos seguidos; debajo, "debes reclamar:".
  const when = kind === 'tomorrow' ? 'Mañana' : isLate ? 'Aún' : 'Hoy';
  // La fecha del día en que debe reclamar: mañana, o hoy (también si va atrasado).
  const detail = formatDayMonth(kind === 'tomorrow' ? cycle.dueDate : toIsoDate(new Date()));

  const hoursLabel = `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  return (
    <AlarmShell
      version={4}
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

          <SnoozeControl
            value={hours}
            min={MIN_SNOOZE_HOURS}
            max={MAX_SNOOZE_HOURS}
            step={1}
            label={`Recordar en ${hoursLabel}`}
            decreaseLabel="Menos horas"
            increaseLabel="Más horas"
            onChange={setHours}
            onSnooze={() => onSnooze(claim.key, hours)}
          />
        </>
      }
    >
      {/* Estructura de la referencia: [HOY + fecha] arriba, luego [debes reclamar:
          + nombre] y "Entrega N de M". Misma escala que la alarma de toma
          (ALARM_TEXT): etiqueta, nombre, línea blanca y nota. */}
      <p className={ALARM_TEXT.when}>{when}</p>
      <p id="claim-desc" className={`${ALARM_TEXT.strong} mt-2`}>
        {detail}
      </p>
      <p className={`${ALARM_TEXT.label} mt-2`}>debes reclamar:</p>
      <h2 id="claim-title" className={`${alarmNameSize(plan.name)} ${ALARM_TEXT.name} mt-1`}>
        {plan.name}
      </h2>
      <p className={`${ALARM_TEXT.note} mt-2`}>
        Entrega {cycle.number} de {orderMonths}
      </p>
    </AlarmShell>
  );
};
