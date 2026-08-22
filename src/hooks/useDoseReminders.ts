import { useEffect, useRef, useState } from 'react';
import { DoseItem } from '../types';
import { playReminderSound, showDoseNotification } from '../services/notificationService';

// Cada cuánto se vuelve a insistir con una toma que sigue sin marcarse.
export const REMINDER_INTERVAL_MS = 5 * 60 * 1000;

// Con qué frecuencia se revisa el reloj. Los navegadores estrangulan los
// temporizadores en segundo plano a ~1 por minuto, tolerable para un ciclo de 5 min.
const CHECK_INTERVAL_MS = 30 * 1000;

function minutesOfDay(hour: number, minute: number): number {
  return hour * 60 + minute;
}

/**
 * Tomas sin marcar cuya hora ya pasó, de la más antigua a la más reciente.
 * Se incluyen tanto 'pending' como 'upcoming': ambas significan "todavía no se
 * tomó", y nada en la app convierte 'upcoming' en 'pending' al llegar la hora.
 */
function findOverdueDoses(doses: DoseItem[], now: Date): DoseItem[] {
  const nowMinutes = minutesOfDay(now.getHours(), now.getMinutes());

  return doses
    .filter(
      (dose) =>
        dose.status !== 'taken' &&
        minutesOfDay(dose.timeHour, dose.timeMinute) <= nowMinutes
    )
    .sort(
      (a, b) =>
        minutesOfDay(a.timeHour, a.timeMinute) - minutesOfDay(b.timeHour, b.timeMinute)
    );
}

/**
 * Vigila el reloj y devuelve la toma que debe estar alarmando (o null).
 * Avisa de a una para no abrumar, y repite cada REMINDER_INTERVAL_MS hasta
 * que la toma se marque como tomada.
 *
 * `snoozedUntil` permite posponer sin marcarla como tomada.
 */
export function useDoseReminders(doses: DoseItem[], enabled: boolean): {
  dueDose: DoseItem | null;
  snooze: () => void;
} {
  const [dueDose, setDueDose] = useState<DoseItem | null>(null);
  const lastNotifiedRef = useRef<Map<string, number>>(new Map());
  const snoozedUntilRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setDueDose(null);
      lastNotifiedRef.current.clear();
      snoozedUntilRef.current = 0;
      return;
    }

    function check() {
      const now = Date.now();
      const overdue = findOverdueDoses(doses, new Date(now));

      // Se limpian las tomas que ya no están pendientes para no dejar basura
      // en el mapa (y para que vuelvan a avisar si reaparecen).
      const overdueIds = new Set(overdue.map((dose) => dose.id));
      lastNotifiedRef.current.forEach((_, id) => {
        if (!overdueIds.has(id)) {
          lastNotifiedRef.current.delete(id);
        }
      });

      const next = overdue[0] ?? null;

      // Mientras esté pospuesta, la alerta permanece oculta y muda.
      if (now < snoozedUntilRef.current) {
        setDueDose(null);
        return;
      }

      setDueDose(next);
      if (!next) return;

      const lastNotified = lastNotifiedRef.current.get(next.id);
      const shouldNotify =
        lastNotified === undefined || now - lastNotified >= REMINDER_INTERVAL_MS;

      if (shouldNotify) {
        lastNotifiedRef.current.set(next.id, now);
        showDoseNotification(next.medicationName, next.dose, next.planId);
        playReminderSound();
      }
    }

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [doses, enabled]);

  function snooze() {
    snoozedUntilRef.current = Date.now() + REMINDER_INTERVAL_MS;
    if (dueDose) {
      // Se marca como recién avisada para que el próximo aviso también espere.
      lastNotifiedRef.current.set(dueDose.id, Date.now());
    }
    setDueDose(null);
  }

  return { dueDose, snooze };
}
