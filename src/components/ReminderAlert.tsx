import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { DoseItem, MedicationPlan } from '../types';
import {
  ALARM_PRIMARY_BUTTON,
  ALARM_TEXT,
  AlarmShell,
  AlarmVersion,
  SnoozeControl,
  alarmNameSize,
} from './AlarmShell';

// Posponer de 5 en 5 minutos: no menos de 5 (rompería el paso) y hasta 1 hora.
const SNOOZE_STEP_MIN = 5;
const SNOOZE_MAX_MIN = 60;

type ReminderAlertProps =
  | {
      isTest?: false;
      dose: DoseItem;
      plan?: MedicationPlan; // para las indicaciones, si existen
      onMarkAsTaken: (doseId: string) => void;
      onSnooze: (minutes: number) => void;
    }
  // Alarma de prueba: misma pantalla con los textos de la referencia de diseño.
  // Sus botones solo la cierran: no marca ninguna toma. Muestra Metformina por
  // decisión explícita (excepción al invariante 5, ver Context/decisions/0006).
  // El botón temporal "Alarma 4" la abre para verla sin esperar una toma.
  | { isTest: true; version?: AlarmVersion; onClose: () => void };

const TEST_MEDICATION = {
  name: 'Metformina',
  dose: '1 pastilla • 850mg',
  instructions: 'Tomar con el almuerzo para evitar molestias estomacales',
};

/** Aviso de toma. La versión 4 (sin píldora, texto al centro) es la alarma real. */
export const ReminderAlert: React.FC<ReminderAlertProps> = (props) => {
  const version: AlarmVersion = props.isTest ? props.version ?? 4 : 4;
  const [snoozeMinutes, setSnoozeMinutes] = useState(SNOOZE_STEP_MIN);
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
  const handleSnooze = props.isTest ? props.onClose : () => props.onSnooze(snoozeMinutes);

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
          <SnoozeControl
            value={snoozeMinutes}
            min={SNOOZE_STEP_MIN}
            max={SNOOZE_MAX_MIN}
            step={SNOOZE_STEP_MIN}
            label={`Recordar en ${snoozeMinutes} min`}
            decreaseLabel="5 minutos menos"
            increaseLabel="5 minutos más"
            onChange={setSnoozeMinutes}
            onSnooze={handleSnooze}
          />
        </>
      }
    >
      {/* Misma escala que el aviso de reclamo (ALARM_TEXT). Espacios: 4px entre
          "Toma:" y el nombre; 8px entre los demás */}
      <p className={ALARM_TEXT.label}>Toma:</p>
      <h2 id="reminder-title" className={`${alarmNameSize(name)} ${ALARM_TEXT.name} mt-1`}>
        {name}
      </h2>
      <p id="reminder-desc" className={`${ALARM_TEXT.strong} mt-2`}>
        {doseLine}
      </p>
      {instructions && <p className={`${ALARM_TEXT.note} mt-2`}>{instructions}</p>}
    </AlarmShell>
  );
};
