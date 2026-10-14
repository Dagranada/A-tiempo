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
}

export interface DoseItem {
  id: string;
  planId: string;
  medicationName: string;
  dose: string;
  timeFormatted: string; // e.g. "02:00 PM"
  timeHour: number; // 0 - 23 for sorting
  timeMinute: number;
  status: 'pending' | 'taken' | 'upcoming';
  takenAt?: string; // timestamp when marked "Listo"
  nextTakeNotice?: string; // e.g. "Próxima toma en 7 horas"
}

export type ScreenView = 'home' | 'scan' | 'loading' | 'plan_form';
export type NavTab = 'horario' | 'planes' | 'escanear' | 'perfil';

export interface SeniorProfile {
  name: string; // nombre completo; el Header muestra solo el primero
  relationship: string;
  age: number; // se recalcula desde birthDate al guardar
  avatarUrl: string;
  caregiverName: string;
  birthDate: string; // YYYY-MM-DD
  sex: 'Masculino' | 'Femenino' | 'Otro' | '';
  phone: string;
  weightKg: string; // texto para permitir campo vacío
  heightM: string;
  bloodType: 'O' | 'A' | 'B' | 'AB' | '';
  rhFactor: 'Positivo (+)' | 'Negativo (−)' | '';
}
