import { DoseItem, MedicationPlan } from '../types';
import { daysBetween, toIsoDate } from './claims';

// Las tomas no se guardan: se calculan para cada día desde los planes. Solo se
// guarda cuáles se marcaron "Listo" (`TakenDoses`), con una clave por plan, día
// y hora. Así cada día empieza con todas sus tomas pendientes, editar un plan
// recalcula su horario y las fechas Desde/Hasta del plan se respetan.

/** Clave de una toma → hora en que se marcó (p. ej. "08:05 PM"). */
export type TakenDoses = Record<string, string>;

const HOUR_MS = 60 * 60 * 1000;
// Cuántos días de tomas marcadas se conservan; las más viejas se borran.
const KEEP_TAKEN_DAYS = 31;
// Al crear un plan a media tarde con hora inicial 8:00 a. m., la toma de esa
// mañana no debe salir como atrasada. Se deja una hora de margen para quien
// crea el plan justo a la hora de la primera toma.
const BEFORE_CREATION_GRACE_MS = HOUR_MS;

/** "20:00", "8:00 PM" o "08:00 a. m." → { hour: 20, minute: 0 } */
export function parseTime(text: string): { hour: number; minute: number } {
  const match = text.trim().match(/^(\d{1,2}):(\d{2})\s*(.*)$/);
  if (!match) return { hour: 8, minute: 0 };
  let hour = Number(match[1]) % 24;
  const minute = Math.min(Number(match[2]), 59);
  const period = match[3].toLowerCase().replace(/[\s.]/g, '');
  if (period === 'pm' && hour < 12) hour += 12;
  if (period === 'am' && hour === 12) hour = 0;
  return { hour, minute };
}

/** (20, 0) → "08:00 PM", el formato de las tarjetas del Horario. */
export function formatDoseTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
}

export function doseKey(planId: string, dayIso: string, hour: number, minute: number): string {
  return `${planId}@${dayIso}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function atLocal(dayIso: string, hour: number, minute: number): Date {
  const [y, m, d] = dayIso.split('-').map(Number);
  return new Date(y, m - 1, d, hour, minute);
}

/**
 * Horas de las tomas de un plan en un día. "Cada N horas" cuenta desde la
 * fecha y hora de inicio del plan, así que también sirve si N no divide el día
 * (cada 5 o cada 36 horas); "cada N días" es una toma a la hora inicial cada N
 * días desde el inicio. Fuera de Desde/Hasta no hay tomas, ni antes de que el
 * plan existiera (con una hora de margen).
 */
export function getDoseTimes(plan: MedicationPlan, dayIso: string): { hour: number; minute: number }[] {
  const startIso = plan.startDate || toIsoDate(new Date(plan.createdAt));
  if (dayIso < startIso || (plan.endDate && dayIso > plan.endDate)) return [];

  const { hour, minute } = parseTime(plan.initialTime);
  const every = plan.frequencyValue > 0 ? plan.frequencyValue : 1;
  const notBefore = Date.parse(plan.createdAt) - BEFORE_CREATION_GRACE_MS || 0;

  if (plan.frequencyUnit === 'días') {
    const onDay = daysBetween(startIso, dayIso) % every === 0;
    return onDay && atLocal(dayIso, hour, minute).getTime() >= notBefore ? [{ hour, minute }] : [];
  }

  const stepMs = every * HOUR_MS;
  const first = atLocal(startIso, hour, minute).getTime();
  const dayStart = atLocal(dayIso, 0, 0).getTime();
  const dayEnd = atLocal(dayIso, 24, 0).getTime();
  const times: { hour: number; minute: number }[] = [];
  let t = first + Math.max(0, Math.ceil((dayStart - first) / stepMs)) * stepMs;
  for (; t < dayEnd; t += stepMs) {
    if (t < notBefore) continue;
    const date = new Date(t);
    times.push({ hour: date.getHours(), minute: date.getMinutes() });
  }
  return times;
}

// "En 2 horas" / "En 45 minutos" para las tomas que aún no llegan.
function timeUntil(minutes: number): string {
  if (minutes < 60) return `En ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  const hours = Math.round(minutes / 60);
  return `En ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
}

/**
 * Tomas de hoy de todos los planes, por hora. `pending` = ya llegó su hora y no
 * se marcó; `upcoming` = todavía no llega; `taken` = marcada "Listo".
 */
export function getDosesForDay(plans: MedicationPlan[], now: Date, taken: TakenDoses): DoseItem[] {
  const dayIso = toIsoDate(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return plans
    .flatMap((plan) =>
      getDoseTimes(plan, dayIso).map(({ hour, minute }): DoseItem => {
        const id = doseKey(plan.id, dayIso, hour, minute);
        const minutesLeft = hour * 60 + minute - nowMinutes;
        const status = taken[id] ? 'taken' : minutesLeft <= 0 ? 'pending' : 'upcoming';
        return {
          id,
          planId: plan.id,
          medicationName: plan.name,
          dose: plan.dose,
          timeFormatted: formatDoseTime(hour, minute),
          timeHour: hour,
          timeMinute: minute,
          status,
          takenAt: taken[id],
          nextTakeNotice: status === 'upcoming' ? timeUntil(minutesLeft) : undefined,
        };
      })
    )
    .sort((a, b) => a.timeHour * 60 + a.timeMinute - (b.timeHour * 60 + b.timeMinute));
}

/** Agrega una toma marcada y borra las de hace más de un mes. */
export function markTaken(taken: TakenDoses, id: string, takenAt: string, now: Date): TakenDoses {
  const oldest = toIsoDate(new Date(now.getTime() - KEEP_TAKEN_DAYS * 24 * HOUR_MS));
  const kept = Object.fromEntries(
    Object.entries(taken).filter(([key]) => (key.split('@')[1] ?? '').slice(0, 10) >= oldest)
  );
  return { ...kept, [id]: takenAt };
}

/**
 * Vista previa para el formulario: las horas de un día típico, empezando por
 * la hora inicial. `varies` = el horario no se repite igual cada día (cada 5 o
 * cada 36 horas, por ejemplo).
 */
export function previewDoseTimes(
  initialTime: string,
  frequencyValue: number,
  frequencyUnit: 'horas' | 'días'
): { times: string[]; varies: boolean } {
  if (!initialTime || frequencyValue <= 0) return { times: [], varies: false };
  const { hour, minute } = parseTime(initialTime);
  if (frequencyUnit === 'días') return { times: [formatDoseTime(hour, minute)], varies: false };

  const times: string[] = [];
  for (let offset = 0; offset < 24; offset += frequencyValue) {
    const total = hour * 60 + minute + offset * 60;
    times.push(formatDoseTime(Math.floor(total / 60) % 24, total % 60));
  }
  return { times, varies: 24 % frequencyValue !== 0 };
}
