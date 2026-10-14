import React, { useLayoutEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { DoseItem, MedicationPlan } from '../types';
import { REMINDER_INTERVAL_MS } from '../hooks/useDoseReminders';

// El texto del botón sale de la misma constante que usa el snooze:
// nunca promete un tiempo distinto al real.
const SNOOZE_MINUTES = Math.round(REMINDER_INTERVAL_MS / 60000);

type ReminderAlertProps =
  | {
      isTest?: false;
      dose: DoseItem;
      plan?: MedicationPlan; // para descripción e indicaciones, si existen
      onMarkAsTaken: (doseId: string) => void;
      onSnooze: () => void;
    }
  // Alarma de prueba: misma pantalla con los textos de la referencia de diseño.
  // Sus botones solo la cierran: no marca ninguna toma. Muestra Metformina por
  // decisión explícita (excepción al invariante 5, ver Context/decisions/0006).
  | { isTest: true; onClose: () => void };

// Ondas: cada una tarda WAVE_DURATION_S en cruzar; sale una nueva cada WAVE_GAP_S.
// Debe coincidir con la duración de la animación `alarm-wave` en index.css.
const WAVE_DURATION_S = 8;
const WAVE_GAP_S = 0.8;
const WAVE_COUNT = Math.round(WAVE_DURATION_S / WAVE_GAP_S);

const TEST_MEDICATION = {
  name: 'Metformina',
  description: 'Control de glucosa en sangre',
  dose: '1 pastilla • 850mg',
  instructions: 'Tomar con el almuerzo para evitar molestias estomacales',
};

export const ReminderAlert: React.FC<ReminderAlertProps> = (props) => {
  const name = props.isTest ? TEST_MEDICATION.name : props.dose.medicationName;
  const description = props.isTest
    ? TEST_MEDICATION.description
    : props.plan?.description || `Es hora de tomar ${props.dose.dose}`;
  const dose = props.isTest ? TEST_MEDICATION.dose : props.dose.dose;
  const instructions = props.isTest ? TEST_MEDICATION.instructions : props.plan?.instructions;
  // "1 pastilla • 850mg" → ["1 pastilla", "850 mg"]
  const doseParts = dose
    .split('•')
    .map((part) => part.trim().replace(/(\d)\s*mg$/i, '$1 mg'))
    .filter(Boolean);

  const handleConfirm = props.isTest ? props.onClose : () => props.onMarkAsTaken(props.dose.id);
  const handleSnooze = props.isTest ? props.onClose : props.onSnooze;

  // Las ondas viven en una capa de fondo a pantalla completa, centradas en la
  // píldora. Se mide dónde quedó y hasta qué esquina deben llegar.
  const rootRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const [ripple, setRipple] = useState({ x: 0, y: 0, size: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      const root = rootRef.current;
      const icon = iconRef.current;
      if (!root || !icon) return;
      const r = root.getBoundingClientRect();
      const i = icon.getBoundingClientRect();
      const x = i.left + i.width / 2 - r.left;
      const y = i.top + i.height / 2 - r.top + root.scrollTop;
      setRipple({ x, y, size: 2 * Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y)) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (rootRef.current) observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="reminder-title"
      aria-describedby="reminder-desc"
      style={{
        background:
          'radial-gradient(circle at 50% 32%, #22e3c8 0%, #00c7af 38%, #00a492 72%, #02897a 100%)',
      }}
      className="fixed inset-0 z-50 left-1/2 -translate-x-1/2 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl font-heading text-white flex flex-col justify-between px-6 pt-16 pb-10 overflow-y-auto select-none"
    >
      {/* Ondas: salen del centro y se debilitan a medida que se alejan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {ripple.size > 0 &&
          Array.from({ length: WAVE_COUNT }, (_, i) => (
            <span
              key={i}
              className="alarm-wave absolute rounded-full"
              style={
                {
                  left: ripple.x,
                  top: ripple.y,
                  '--wave-max': `${ripple.size}px`,
                  animationDelay: `${i * WAVE_GAP_S}s`,
                } as React.CSSProperties
              }
            />
          ))}
      </div>

      <main className="relative w-full flex flex-col items-center flex-1 justify-center">
        {/* Píldora: de aquí salen las ondas (el contenedor reserva su espacio) */}
        <div
          ref={iconRef}
          className="w-[210px] h-[210px] flex items-center justify-center mb-10"
          aria-hidden="true"
        >
          <div className="w-[110px] h-[110px] rounded-full bg-white/20 border border-white/40 flex items-center justify-center">
            <svg
              className="w-12 h-12 -rotate-45"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.6"
              viewBox="0 0 24 24"
            >
              <rect height="10" rx="5" width="18" x="3" y="7" />
              <line strokeWidth="2.4" x1="12" x2="12" y1="7" y2="17" />
            </svg>
          </div>
        </div>

        <h2
          id="reminder-title"
          className="text-[1.85rem] leading-tight font-extrabold text-white text-center"
        >
          {name}
        </h2>

        <p id="reminder-desc" className="text-[0.95rem] font-medium text-white/85 mt-1.5 mb-6 text-center">
          {description}
        </p>

        {/* Dosis: 1 pastilla | 850 mg */}
        <div className="w-full rounded-2xl py-4 px-3 flex items-center bg-white/10 border border-white/30">
          {doseParts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="h-8 w-px bg-white/30" />}
              <div className="flex-1 text-center font-bold text-[1.1rem] text-white">{part}</div>
            </React.Fragment>
          ))}
        </div>

        {instructions && (
          <p className="w-full text-center text-[0.95rem] leading-snug font-medium text-white/90 mt-4 px-4">
            {instructions}
          </p>
        )}
      </main>

      {/* Acciones: mismo tamaño; el blanco manda, el posponer acompaña */}
      <footer className="relative w-full flex flex-col gap-3 pt-8">
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full bg-white hover:bg-white/95 text-[#009688] font-bold py-4 px-5 rounded-full text-[1.1rem] shadow-[0_10px_30px_-8px_rgba(0,70,64,0.35)] transition-all active:scale-[0.98] flex items-center justify-center space-x-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <CheckCircle2 className="w-6 h-6" />
          <span>Marcar como tomada</span>
        </button>

        <button
          type="button"
          onClick={handleSnooze}
          className="w-full bg-[#00695e]/30 hover:bg-[#00695e]/40 text-white font-bold py-4 px-5 rounded-full text-[1.1rem] transition-all active:scale-[0.98] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          Recordar en {SNOOZE_MINUTES} min
        </button>
      </footer>
    </div>
  );
};
