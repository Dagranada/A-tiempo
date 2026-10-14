import React, { useLayoutEffect, useRef, useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
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
  // Alarma de prueba: misma pantalla con un medicamento ficticio. Sus botones
  // solo la cierran: no marca ninguna toma. Nunca usa un medicamento real del
  // plan, para que nadie se tome una pastilla de más por una prueba.
  | { isTest: true; onClose: () => void };

const TEST_MEDICATION = {
  name: 'Medicamento de prueba',
  description: 'Así se verá el aviso de cada toma',
  dose: '1 pastilla • 850mg',
  instructions: 'Ejemplo de indicación: tomar con el almuerzo para evitar molestias estomacales',
};

const formatNow = () =>
  new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

export const ReminderAlert: React.FC<ReminderAlertProps> = (props) => {
  const time = props.isTest ? formatNow() : props.dose.timeFormatted;
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

  // Las ondas viven en una capa de fondo que cubre toda la pantalla, centradas en
  // el icono. Se mide dónde quedó el icono y hasta qué esquina deben llegar.
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
      const farX = Math.max(x, r.width - x);
      const farY = Math.max(y, r.height - y);
      setRipple({ x, y, size: 2 * Math.hypot(farX, farY) });
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
      className="fixed inset-0 z-50 left-1/2 -translate-x-1/2 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl text-white flex flex-col justify-between px-7 pt-12 pb-10 overflow-y-auto select-none"
    >
      {/* Ondas: de tamaño del disco hasta la esquina más lejana, cada vez más débiles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {ripple.size > 0 &&
          [0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="alarm-ripple absolute rounded-full"
              style={
                {
                  left: ripple.x,
                  top: ripple.y,
                  '--ripple-max': `${ripple.size}px`,
                  animationDelay: `${i * 1.25}s`,
                } as React.CSSProperties
              }
            />
          ))}
      </div>

      {/* Hora */}
      <header className="relative w-full flex justify-center pt-2">
        <span className="text-[1.35rem] font-bold tracking-wider drop-shadow-sm">{time}</span>
      </header>

      <main className="relative w-full flex flex-col items-center flex-1 justify-center -mt-4 py-6">
        {/* Píldora: las ondas salen de aquí (capa de fondo) */}
        <div
          ref={iconRef}
          className="relative w-[214px] h-[214px] mb-8 flex items-center justify-center"
          aria-hidden="true"
        >
          {/* Resplandor suave detrás del disco */}
          <span className="alarm-glow absolute w-[150px] h-[150px] rounded-full" />
          <div className="alarm-core relative w-[114px] h-[114px] rounded-full bg-white/[0.22] border-[1.5px] border-white/[0.55] flex items-center justify-center">
            <svg
              className="alarm-pill w-12 h-12"
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
          className="text-[2.25rem] leading-none font-extrabold tracking-tight mb-2 text-center drop-shadow-sm"
        >
          {name}
        </h2>

        <p id="reminder-desc" className="text-[1.05rem] font-medium text-white/85 mb-7 text-center">
          {description}
        </p>

        {/* Dosis: 1 pastilla | 850 mg */}
        <div
          className="w-full rounded-2xl py-3.5 px-3 flex items-center mb-5 bg-white/[0.16] backdrop-blur-xl border-[1.5px] border-white/[0.42]"
          style={{
            boxShadow:
              '0 8px 24px -6px rgba(0, 60, 54, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
          }}
        >
          {doseParts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="h-10 w-[1.5px] bg-white/40 rounded-full" />}
              <div className="flex-1 text-center font-bold text-[1.25rem] tracking-tight py-1.5">
                {part}
              </div>
            </React.Fragment>
          ))}
        </div>

        {instructions && (
          <p className="w-full text-left text-[1.05rem] leading-snug font-medium px-1">
            {instructions}
          </p>
        )}
      </main>

      {/* Acciones */}
      <footer className="relative w-full flex flex-col items-center gap-4 pb-1">
        <button
          type="button"
          onClick={handleConfirm}
          style={{
            boxShadow: '0 12px 32px -4px rgba(0, 70, 64, 0.28), 0 0 18px rgba(255, 255, 255, 0.4)',
          }}
          className="w-full bg-white active:bg-slate-50 rounded-full py-4 px-6 flex items-center justify-center gap-3 transition-all active:scale-[0.98] touch-manipulation focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
        >
          <CheckCircle2 className="w-6 h-6 text-[#009688]" strokeWidth={2.6} />
          <span className="text-[#009688] font-bold text-[1.14rem] tracking-tight">
            Marcar como tomada
          </span>
        </button>

        <button
          type="button"
          onClick={handleSnooze}
          className="w-full bg-[#00695e]/35 hover:bg-[#00695e]/45 text-white/95 rounded-full py-4 px-6 flex items-center justify-center gap-3 transition-all active:scale-[0.98] touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <Clock className="w-6 h-6" strokeWidth={2.6} />
          <span className="text-[1.14rem] font-bold tracking-tight">
            Recordar en {SNOOZE_MINUTES} min
          </span>
        </button>
      </footer>
    </div>
  );
};
