import { MedicationPlan, DoseItem, SeniorProfile } from '../types';
import { toIsoDate } from '../lib/claims';

// Fechas de reclamo de ejemplo calculadas desde hoy, para que la demo siempre
// muestre casos útiles: "dentro de N días" con N meses atrás y desplazamiento.
const demoDate = (monthsAgo: number, dayOffset = 0) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsAgo);
  const target = new Date();
  target.setDate(target.getDate() + dayOffset);
  const day = Math.min(target.getDate(), new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate());
  d.setDate(day);
  return toIsoDate(d);
};

// Días de atraso del ejemplo "vencido": 5, o menos si el mes acaba de empezar,
// para que su día caiga siempre dentro del mes en curso.
const LATE_DAYS = Math.min(5, new Date().getDate() - 1);

export const INITIAL_SENIOR_PROFILE: SeniorProfile = {
  name: 'Alberto Valdés',
  relationship: 'Padre',
  age: 78,
  avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=400',
  caregiverName: 'Hija (María)',
  birthDate: '1948-05-14',
  sex: 'Masculino',
  phone: '612 345 678',
  weightKg: '72',
  heightM: '1.70',
  bloodType: 'O',
  rhFactor: 'Positivo (+)',
};

export const INITIAL_PLANS: MedicationPlan[] = [
  {
    id: 'plan-1',
    name: 'Metformina',
    description: 'Control de glucosa en sangre',
    dose: '1 pastilla • 850mg',
    initialTime: '14:00',
    frequencyValue: 24,
    frequencyUnit: 'horas',
    startDate: '2026-02-01',
    endDate: '2026-08-01',
    instructions: 'Tomar con el almuerzo para evitar molestias estomacales',
    createdAt: '2026-02-01T08:00:00Z',
    // Orden de 6 meses: reclamó a tiempo el primero y 3 días tarde el segundo
    claim: {
      firstDate: demoDate(2),
      orderMonths: 6,
      claimedDates: [demoDate(2), demoDate(1, 3)],
    },
  },
  {
    id: 'plan-2',
    name: 'Soratadina',
    description: 'Para alergias nasales y congestión',
    dose: '2 pastilla • 200mg',
    initialTime: '17:00',
    frequencyValue: 12,
    frequencyUnit: 'horas',
    startDate: '2026-02-15',
    endDate: '2026-03-01',
    instructions: 'Tomar con abundante agua',
    createdAt: '2026-02-15T08:00:00Z'
  },
  {
    id: 'plan-3',
    name: 'Atorvastatina',
    description: 'Para control de colesterol',
    dose: '1 pastilla • 20mg',
    initialTime: '21:00',
    frequencyValue: 24,
    frequencyUnit: 'horas',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    instructions: 'Tomar por la noche antes de dormir',
    createdAt: '2026-01-01T08:00:00Z',
    // Orden de 6 meses con el reclamo de este mes atrasado (ejemplo "vencido")
    claim: {
      firstDate: demoDate(2, -LATE_DAYS),
      orderMonths: 6,
      claimedDates: [demoDate(2, -LATE_DAYS), demoDate(1, -LATE_DAYS)],
    },
  },
  {
    id: 'plan-4',
    name: 'Aspirina',
    description: 'Protección cardiovascular diaria',
    dose: '1 pastilla • 81mg',
    initialTime: '08:00',
    frequencyValue: 24,
    frequencyUnit: 'horas',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    instructions: 'Tomar en el desayuno',
    createdAt: '2026-01-01T08:00:00Z'
  },
  {
    id: 'plan-5',
    name: 'Losartán',
    description: 'Para controlar la presión arterial',
    dose: '1 pastilla • 50mg',
    initialTime: '09:00',
    frequencyValue: 24,
    frequencyUnit: 'horas',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    instructions: 'Tomar por la mañana',
    createdAt: '2026-01-01T08:00:00Z',
    // Orden de 4 meses: perdió el segundo mes y le toca reclamar mañana
    claim: {
      firstDate: demoDate(3, 1),
      orderMonths: 4,
      claimedDates: [demoDate(3, 1), demoDate(1, 1)],
    },
  }
];

export const INITIAL_TODAY_DOSES: DoseItem[] = [
  {
    id: 'dose-1',
    planId: 'plan-1',
    medicationName: 'Metformina',
    dose: '1 pastilla • 850mg',
    timeFormatted: '02:00 PM',
    timeHour: 14,
    timeMinute: 0,
    status: 'pending'
  },
  {
    id: 'dose-2',
    planId: 'plan-2',
    medicationName: 'Soratadina',
    dose: '2 pastilla • 200mg',
    timeFormatted: '05:00 PM',
    timeHour: 17,
    timeMinute: 0,
    status: 'upcoming',
    nextTakeNotice: 'Próxima toma en 7 horas'
  },
  {
    id: 'dose-3',
    planId: 'plan-3',
    medicationName: 'Atorvastatina',
    dose: '1 pastilla • 20mg',
    timeFormatted: '09:00 PM',
    timeHour: 21,
    timeMinute: 0,
    status: 'upcoming'
  },
  {
    id: 'dose-4',
    planId: 'plan-4',
    medicationName: 'Aspirina',
    dose: '1 pastilla • 81mg',
    timeFormatted: '08:00 AM',
    timeHour: 8,
    timeMinute: 0,
    status: 'taken',
    takenAt: '08:00 AM'
  },
  {
    id: 'dose-5',
    planId: 'plan-5',
    medicationName: 'Losartán',
    dose: '1 pastilla • 50mg',
    timeFormatted: '09:00 AM',
    timeHour: 9,
    timeMinute: 0,
    status: 'taken',
    takenAt: '09:00 AM'
  }
];

export interface ScanPreset {
  id: string;
  title: string;
  subtitle: string;
  imagePrompt: string;
  extractedPlan: Omit<MedicationPlan, 'id' | 'createdAt'>;
}

export const SCAN_PRESETS: ScanPreset[] = [
  {
    id: 'preset-amoxi',
    title: 'Receta de Amoxicilina 500mg',
    subtitle: 'Caja de comprimidos para infección',
    imagePrompt: 'Amoxicilina 500mg comprimidos',
    extractedPlan: {
      name: 'Amoxicilina',
      description: 'Antibiótico para infección bacteriana',
      dose: '1 cápsula • 500mg',
      initialTime: '08:00',
      frequencyValue: 8,
      frequencyUnit: 'horas',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      instructions: 'Tomar cada 8 horas con comida por 7 días completos'
    }
  },
  {
    id: 'preset-para',
    title: 'Caja de Paracetamol 1g',
    subtitle: 'Analgesia y control de fiebre',
    imagePrompt: 'Paracetamol 1000mg laboratorios',
    extractedPlan: {
      name: 'Paracetamol',
      description: 'Analgésico y antipirético para el dolor',
      dose: '1 tableta • 1000mg',
      initialTime: '12:00',
      frequencyValue: 12,
      frequencyUnit: 'horas',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      instructions: 'Tomar si presenta dolor leve a moderado'
    }
  },
  {
    id: 'preset-omep',
    title: 'Frasco de Omeprazol 20mg',
    subtitle: 'Protector gástrico en ayunas',
    imagePrompt: 'Omeprazol 20mg cápsulas',
    extractedPlan: {
      name: 'Omeprazol',
      description: 'Protector gástrico para la acidez',
      dose: '1 cápsula • 20mg',
      initialTime: '07:30',
      frequencyValue: 24,
      frequencyUnit: 'horas',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      instructions: 'Tomar en ayunas 30 minutos antes del desayuno'
    }
  }
];
