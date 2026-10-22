import { useEffect, useRef, useState } from 'react';
import { MedicationPlan } from '../types';
import { ClaimCycle, daysBetween, getClaimSchedule, toIsoDate } from '../lib/claims';
import { playReminderSound, showClaimNotification } from '../services/notificationService';

// Horas fijas de los avisos de reclamo (no tienen hora propia como las tomas).
export const CLAIM_EVE_HOUR = 12; // el día anterior, al mediodía
export const CLAIM_DAY_HOUR = 8; // el día de reclamar (y cada día de atraso), 8 a. m.

const CHECK_INTERVAL_MS = 30 * 1000;

/** Lo que el cuidador ya respondió a cada aviso; se guarda en el teléfono. */
export interface ClaimAlertState {
  dismissed: string[]; // avisos "Entendido" o ya resueltos
  snoozedUntil: Record<string, number>; // aviso → hasta cuándo está pospuesto (ms)
}

export const EMPTY_CLAIM_ALERTS: ClaimAlertState = { dismissed: [], snoozedUntil: {} };

export interface DueClaim {
  key: string; // identifica este aviso: plan + mes + día
  kind: 'tomorrow' | 'today';
  plan: MedicationPlan;
  cycle: ClaimCycle;
  orderMonths: number;
}

/**
 * Aviso de reclamo que toca mostrar ahora, si hay. Reglas:
 * - El día anterior a "su día", desde las 12 m.
 * - Desde "su día" hasta fin de mes, cada día desde las 8 a. m., hasta que se
 *   marque como reclamado (un mes sin reclamar se pierde).
 */
export function findDueClaim(
  plans: MedicationPlan[],
  alerts: ClaimAlertState,
  now: Date
): DueClaim | null {
  const today = toIsoDate(now);
  const hour = now.getHours();

  for (const plan of plans) {
    if (!plan.claim) continue;
    const cycle = getClaimSchedule(plan.claim, today).current;
    if (!cycle) continue;

    let due: DueClaim | null = null;
    if (cycle.status === 'upcoming' && daysBetween(today, cycle.dueDate) === 1 && hour >= CLAIM_EVE_HOUR) {
      due = { key: `${plan.id}:${cycle.dueDate}:eve`, kind: 'tomorrow', plan, cycle, orderMonths: plan.claim.orderMonths };
    } else if (cycle.status === 'open' && hour >= CLAIM_DAY_HOUR) {
      // Una clave por día: si se atrasa, vuelve a avisar al día siguiente.
      due = { key: `${plan.id}:${cycle.dueDate}:${today}`, kind: 'today', plan, cycle, orderMonths: plan.claim.orderMonths };
    }

    if (!due) continue;
    if (alerts.dismissed.includes(due.key)) continue;
    if ((alerts.snoozedUntil[due.key] ?? 0) > now.getTime()) continue;
    return due;
  }
  return null;
}

/** Vigila el reloj y devuelve el aviso de reclamo que debe mostrarse (o null). */
export function useClaimReminders(
  plans: MedicationPlan[],
  alerts: ClaimAlertState,
  enabled: boolean
): DueClaim | null {
  const [dueClaim, setDueClaim] = useState<DueClaim | null>(null);
  const soundedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) {
      setDueClaim(null);
      return;
    }

    function check() {
      const next = findDueClaim(plans, alerts, new Date());
      setDueClaim(next);
      if (!next) return;

      // Suena una vez por aparición; si se pospone, vuelve a sonar al reaparecer.
      const soundKey = `${next.key}:${alerts.snoozedUntil[next.key] ?? 0}`;
      if (soundedRef.current.has(soundKey)) return;
      soundedRef.current.add(soundKey);
      playReminderSound();
      // Mismo texto que el recuadro del Horario ("Mañana toca reclamar Losartán").
      const when = next.kind === 'tomorrow' ? 'Mañana' : 'Hoy';
      showClaimNotification(`${when} toca reclamar ${next.plan.name}`, next.key);
    }

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [plans, alerts, enabled]);

  return dueClaim;
}
