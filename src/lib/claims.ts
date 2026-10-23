import { EpsClaim } from '../types';

// Fechas como texto local YYYY-MM-DD: evita los corrimientos de zona horaria de
// `new Date('2026-10-14')` (que se interpreta en UTC).
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseIso(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d }; // m: 1-12
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

function isoOf(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Suma `n` meses a (año, mes) y devuelve el nuevo (año, mes).
function addMonths(y: number, m: number, n: number): { y: number; m: number } {
  const total = y * 12 + (m - 1) + n;
  return { y: Math.floor(total / 12), m: (total % 12) + 1 };
}

export type ClaimCycleStatus = 'claimed' | 'missed' | 'open' | 'upcoming';

export interface ClaimCycle {
  number: number; // 1..orderMonths
  dueDate: string; // primer día en que se puede reclamar
  lastDate: string; // último día del mes calendario
  status: ClaimCycleStatus;
  claimedOn?: string;
}

export interface ClaimSchedule {
  cycles: ClaimCycle[];
  current: ClaimCycle | null; // el mes en curso o el próximo; null si terminó
  claimedCount: number;
  missedCount: number;
  finished: boolean;
}

/**
 * Calcula todos los meses de la orden a partir del primer día y de los reclamos
 * hechos. "Su día" empieza siendo el del primer reclamo y pasa a ser el día del
 * mes en que se reclamó la última vez. En meses cortos se usa el último día del
 * mes sin perder "su día" (31 → 28 de feb → 31 de mar).
 */
export function getClaimSchedule(claim: EpsClaim, todayIso: string): ClaimSchedule {
  const first = parseIso(claim.firstDate);
  const claimed = [...claim.claimedDates].sort();
  let day = first.d;
  const cycles: ClaimCycle[] = [];

  for (let i = 0; i < claim.orderMonths; i++) {
    const { y, m } = addMonths(first.y, first.m, i);
    const dueDate = isoOf(y, m, Math.min(day, daysInMonth(y, m)));
    const lastDate = isoOf(y, m, daysInMonth(y, m));
    // Solo cuenta un reclamo hecho dentro de la ventana de ese mes.
    const claimedOn = claimed.find((c) => c >= dueDate && c <= lastDate);

    let status: ClaimCycleStatus;
    if (claimedOn) {
      status = 'claimed';
      // Reclamar en la fecha que tocaba no corre nada (y así un 31 ajustado a
      // 28 de febrero no se pierde); reclamar tarde corre "su día" a ese día.
      if (claimedOn !== dueDate) day = parseIso(claimedOn).d;
    } else if (todayIso > lastDate) {
      status = 'missed';
    } else if (todayIso >= dueDate) {
      status = 'open';
    } else {
      status = 'upcoming';
    }
    cycles.push({ number: i + 1, dueDate, lastDate, status, claimedOn });
  }

  return {
    cycles,
    current: cycles.find((c) => c.status === 'open' || c.status === 'upcoming') ?? null,
    claimedCount: cycles.filter((c) => c.status === 'claimed').length,
    missedCount: cycles.filter((c) => c.status === 'missed').length,
    finished: cycles.every((c) => c.status === 'claimed' || c.status === 'missed'),
  };
}

/** Días calendario entre dos fechas YYYY-MM-DD (b - a). */
export function daysBetween(aIso: string, bIso: string): number {
  const a = parseIso(aIso);
  const b = parseIso(bIso);
  return Math.round(
    (Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000
  );
}

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** "2026-10-17" → "17 de octubre" */
export function formatDayMonth(iso: string): string {
  const { m, d } = parseIso(iso);
  return `${d} de ${MONTHS[m - 1]}`;
}

/** "2026-07-21" → "21 de julio de 2026" */
export function formatFullDate(iso: string): string {
  return `${formatDayMonth(iso)} de ${parseIso(iso).y}`;
}

/** Texto corto del estado del mes en curso, para tarjetas y avisos. */
export function describeCycle(cycle: ClaimCycle, todayIso: string): string {
  if (cycle.status === 'open') {
    const left = daysBetween(todayIso, cycle.lastDate);
    if (cycle.dueDate === todayIso) return 'Hoy toca reclamar';
    if (left === 0) return 'Reclamo atrasado, hoy es el último día antes de que pierdas la oportunidad';
    return `Reclamo atrasado, quedan ${left + 1} días antes de que pierdas la oportunidad`;
  }
  const until = daysBetween(todayIso, cycle.dueDate);
  if (until === 1) return 'Mañana toca reclamar';
  return `Faltan ${until} días`;
}
