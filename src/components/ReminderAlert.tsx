import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { DoseItem, MedicationPlan } from '../types';
import { REMINDER_INTERVAL_MS } from '../hooks/useDoseReminders';
import { ALARM_PRIMARY_BUTTON, ALARM_SECONDARY_BUTTON, AlarmShell, AlarmVersion } from './AlarmShell';

// El texto del botón sale de la misma constante que usa el snooze:
// nunca promete un tiempo distinto al real.
const SNOOZE_MINUTES = Math.round(REMINDER_INTERVAL_MS / 60000);

type ReminderAlertProps =
  | {
      isTest?: false;
      dose: DoseItem;
      plan?: MedicationPlan; // para las indicaciones, si existen
      onMarkAsTaken: (doseId: string) => void;
      onSnooze: () => void;
    }
  // Alarma de prueba: misma pantalla con los textos de la referencia de diseño.
  // Sus botones solo la cierran: no marca ninguna toma. Muestra Metformina por
  // decisión explícita (excepción al invariante 5, ver Context/decisions/0006).
  // La versión 3 es una alternativa solo para comparar (botón "Alarma 3").
  | { isTest: true; version?: AlarmVersion; onClose: () => void };

const TEST_MEDICATION = {
  name: 'Metformina',
  dose: '1 pastilla • 850mg',
  instructions: 'Tomar con el almuerzo para evitar molestias estomacales',
};

/** Aviso de toma. La versión 2 es el diseño de la alarma real. */
export const ReminderAlert: React.FC<ReminderAlertProps> = (props) => {
  const version: AlarmVersion = props.isTest ? props.version ?? 2 : 2;
  const name = props.isTest ? TEST_MEDICATION.name : props.dose.medicationName;
  const dose = props.isTest ? TEST_MEDICATION.dose : props.dose.dose;
  const instructions = props.isTest ? TEST_MEDICATION.instructions : props.plan?.instructions;
  // "1 pastilla • 850mg" → "1 pastilla - 850 mg"
  const doseLine = dose
    .split('•')
    .map((part) => part.trim().replace(/(\d)\s*mg$/i, '$1 mg'))
    .filter(Boolean)
    .join(' - ');

  const handleConfirm = props.isTest ? props.onClose : () => props.onMarkAsTaken(props.dose.id);
  const handleSnooze = props.isTest ? props.onClose : props.onSnooze;

  return (
    <AlarmShell
      version={version}
      titleId="reminder-title"
      descriptionId="reminder-desc"
      actions={
        <>
          <button type="button" onClick={handleConfirm} className={ALARM_PRIMARY_BUTTON}>
            <CheckCircle2 className="w-6 h-6" />
            <span>Marcar como tomada</span>
          </button>
          <button type="button" onClick={handleSnooze} className={ALARM_SECONDARY_BUTTON}>
            Recordar en {SNOOZE_MINUTES} min
          </button>
        </>
      }
    >
      <p className="text-[1.05rem] font-medium text-[#087064]/80 text-center">Toma:</p>
      <h2 id="reminder-title" className="text-[2.25rem] leading-tight font-extrabold text-[#087064] text-center">
        {name}
      </h2>
      <p id="reminder-desc" className="text-[1.25rem] font-bold text-white text-center mt-1">
        {doseLine}
      </p>
      {instructions && (
        <p className="w-full text-center text-[0.95rem] leading-snug font-medium text-white/90 mt-4 px-6">
          {instructions}
        </p>
      )}
    </AlarmShell>
  );
};
