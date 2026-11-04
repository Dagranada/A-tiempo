export interface MedicationPlan {
  id: string;
  name: string;
  description: string;
  dose: string; // e.g. "1 pastilla", "850mg"
  initialTime: string; // e.g. "08:00 AM" or "14:00"
  frequencyValue: number; // e.g. 1
  frequencyUnit: 'horas' | 'días'; // e.g. "horas" or "días"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  instructions?: string;
  createdAt: string;
  claim?: EpsClaim; // solo si el medicamento se reclama en la EPS
}

/**
 * Reclamo mensual en la EPS de un medicamento con orden médica de varios meses.
 * Reglas (ver Context/decisions/0008): se reclama una vez por mes calendario,
 * desde "su día" hasta el último día del mes; su día pasa a ser el día del
 * último reclamo; un mes sin reclamar se pierde y cuenta dentro de la orden.
 */
export interface EpsClaim {
  firstDate: string; // YYYY-MM-DD, primer día para reclamar
  orderMonths: number; // duración de la orden médica, en meses (= entregas)
  claimedDates: string[]; // YYYY-MM-DD de cada reclamo hecho
}

/**
 * Una toma de hoy. No se guarda: se calcula desde los planes cada minuto
 * (src/lib/doses.ts); solo se guarda cuáles se marcaron "Listo".
 */
export interface DoseItem {
  id: string; // planId@YYYY-MM-DDTHH:MM, la misma clave con que se guarda si se marcó
  planId: string;
  medicationName: string;
  dose: string;
  timeFormatted: string; // e.g. "02:00 PM"
  timeHour: number; // 0 - 23 for sorting
  timeMinute: number;
  status: 'pending' | 'taken' | 'upcoming'; // pending = ya llegó su hora; upcoming = aún no
  takenAt?: string; // hora en que se marcó "Listo", p. ej. "08:05 PM"
  nextTakeNotice?: string; // solo upcoming: "En 2 horas"
}

export type ScreenView = 'home' | 'scan' | 'loading' | 'plan_form';
export type NavTab = 'horario' | 'planes' | 'pastas' | 'perfil';

/** Perfil de quien toma los medicamentos: es quien usa la app (no hay cuidador). */
export interface SeniorProfile {
  name: string; // nombre completo; el Header muestra solo el primero
  age: number; // se recalcula desde birthDate al guardar
  avatarUrl: string;
  birthDate: string; // YYYY-MM-DD
  sex: 'Masculino' | 'Femenino' | 'Otro' | '';
  phone: string;
  weightKg: string; // texto para permitir campo vacío
  heightM: string;
  bloodType: 'O' | 'A' | 'B' | 'AB' | '';
  rhFactor: 'Positivo (+)' | 'Negativo (−)' | '';
}
