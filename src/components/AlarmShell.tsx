import React, { useLayoutEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';

// Ondas: cada una tarda WAVE_DURATION_S en cruzar; sale una nueva cada WAVE_GAP_S.
// Debe coincidir con la duración de `alarm-wave` / `alarm-wave-soft` en index.css.
const WAVE_DURATION_S = 8;
const WAVE_GAP_S = 0.8;
const WAVE_COUNT = Math.round(WAVE_DURATION_S / WAVE_GAP_S);
// Diámetro del disco de la píldora: las ondas nacen de este tamaño.
const WAVE_START_PX = 110;
// En la versión 4 no hay píldora: las ondas nacen alrededor del texto.
const TEXT_WAVE_START_PX = 300;

export type AlarmVersion = 2 | 3 | 4;

// Estilo de onda por versión: 2 = líneas (animan tamaño), 3 = bandas de luz,
// 4 = líneas animadas solo con escala y opacidad (la alarma real).
const WAVE_CLASS: Record<AlarmVersion, string> = {
  2: 'alarm-wave',
  3: 'alarm-wave-soft',
  4: 'alarm-wave-line',
};

/**
 * Tono de color: toma (verde, alarma de pastillas) o reclamo (rosado, avisos de
 * reclamo en la EPS) para distinguirlos a simple vista. Mismo diseño; solo
 * cambian el fondo y los colores de texto y botones, vía variables CSS.
 */
export type AlarmTone = 'toma' | 'reclamo';

const TONES: Record<AlarmTone, { background: string; vars: Record<string, string> }> = {
  toma: {
    background: 'radial-gradient(circle at 50% 35%, #2ee6cc 0%, #10d2b8 30%, #00bfa8 62%, #00a693 100%)',
    vars: {
      '--alarm-ink': '#0f5a4e', // textos oscuros (Toma:, nombre)
      '--alarm-action': '#009688', // texto e icono del botón blanco
      '--alarm-soft': 'rgba(0, 105, 94, 0.3)', // posponer y sus − / +
      '--alarm-soft-hover': 'rgba(0, 105, 94, 0.4)',
    },
  },
  reclamo: {
    // Rosado con la misma saturación y el mismo degradado que el verde de la toma:
    // centro claro e intenso hacia bordes más oscuros, en los mismos puntos.
    background: 'radial-gradient(circle at 50% 35%, #ff6b9d 0%, #f24d86 30%, #e03574 62%, #c8235f 100%)',
    vars: {
      '--alarm-ink': '#5a0d27',
      '--alarm-action': '#d12a63',
      '--alarm-soft': 'rgba(128, 14, 52, 0.4)',
      '--alarm-soft-hover': 'rgba(128, 14, 52, 0.5)',
    },
  },
};

interface AlarmShellProps {
  version: AlarmVersion; // 4 = la alarma real; 2 y 3 = alternativas de prueba
  tone?: AlarmTone; // por defecto, toma
  titleId: string;
  descriptionId: string;
  children: React.ReactNode; // textos bajo la píldora
  actions: React.ReactNode; // botones al pie
}

/**
 * Pantalla completa de alarma: fondo verde, píldora y ondas que salen de ella.
 * La comparten el aviso de toma (`ReminderAlert`) y el de reclamo en la EPS
 * (`ClaimAlert`); cada uno pone sus textos y botones.
 */
export const AlarmShell: React.FC<AlarmShellProps> = ({
  version,
  tone = 'toma',
  titleId,
  descriptionId,
  children,
  actions,
}) => {
  // Las ondas viven en una capa de fondo a pantalla completa, centradas en la
  // píldora. Se mide dónde quedó y hasta qué esquina deben llegar.
  const rootRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null); // origen de las ondas: píldora, o el texto en la v4
  const isTextCentered = version === 4;
  const waveStartPx = isTextCentered ? TEXT_WAVE_START_PX : WAVE_START_PX;
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
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      style={
        {
          ...TONES[tone].vars,
          background:
            version === 3 && tone === 'toma'
              ? 'radial-gradient(circle at 50% 32%, #0cdbc9 0%, #01bcae 42%, #009d90 100%)'
              : TONES[tone].background,
        } as React.CSSProperties
      }
      className="fixed inset-0 z-50 left-1/2 -translate-x-1/2 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl font-heading text-white flex flex-col justify-between px-6 pt-16 pb-10 overflow-y-auto select-none"
    >
      {version === 3 && (
        <>
          {/* Fondo v3: manchas cálidas difuminadas */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-[#f6d365]/25 blur-3xl" />
            <div className="absolute top-1/4 -right-24 w-72 h-72 rounded-full bg-[#ffd166]/20 blur-3xl" />
            <div className="absolute -bottom-28 -right-16 w-88 h-88 rounded-full bg-[#ffb703]/25 blur-3xl" />
            <div className="absolute bottom-1/3 -left-24 w-64 h-64 rounded-full bg-[#ffe49e]/15 blur-3xl" />
          </div>
          {/* Fondo v3: textura de grano */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 mix-blend-overlay"
            aria-hidden="true"
          >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <filter id="alarm-grain">
                <feTurbulence baseFrequency="0.8" numOctaves={4} stitchTiles="stitch" type="fractalNoise" />
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 2.2 -0.6" />
              </filter>
              <rect filter="url(#alarm-grain)" height="100%" width="100%" />
            </svg>
          </div>
        </>
      )}

      {/* Ondas: salen del centro y se debilitan a medida que se alejan. La 2 las
          dibuja como líneas; la 3, como bandas de luz difuminadas. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {ripple.size > 0 &&
          Array.from({ length: WAVE_COUNT }, (_, i) => (
            <span
              key={i}
              className={`absolute rounded-full ${WAVE_CLASS[version]}`}
              style={
                version === 2
                  ? ({
                      left: ripple.x,
                      top: ripple.y,
                      '--wave-max': `${ripple.size}px`,
                      '--wave-start-px': `${waveStartPx}px`,
                      animationDelay: `${i * WAVE_GAP_S}s`,
                    } as React.CSSProperties)
                  : // La 3 y la 4 ya nacen del tamaño final y solo se escalan:
                    // así el celular las anima sin repintar (no se traban ni
                    // parpadean).
                    ({
                      left: ripple.x,
                      top: ripple.y,
                      width: ripple.size,
                      height: ripple.size,
                      '--wave-start': waveStartPx / ripple.size,
                      animationDelay: `${i * WAVE_GAP_S}s`,
                    } as React.CSSProperties)
              }
            />
          ))}
      </div>

      <main className="relative w-full flex flex-col items-center flex-1 justify-center">
        {isTextCentered ? (
          // v4: sin píldora; el texto queda al centro y las ondas salen de su alrededor
          <div ref={iconRef} className="w-full flex flex-col items-center">
            {children}
          </div>
        ) : (
          <>
          {/* Píldora: de aquí salen las ondas (el contenedor reserva su espacio) */}
          <div
            ref={iconRef}
            className="w-[210px] h-[210px] flex items-center justify-center mb-10"
            aria-hidden="true"
          >
            <div className="w-[110px] h-[110px] rounded-full flex items-center justify-center bg-[#00e5cf] border border-white/50">
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

          {children}
          </>
        )}
      </main>

      <footer className="relative w-full flex flex-col gap-3 pt-8">{actions}</footer>
    </div>
  );
};

// Clases compartidas por los botones de las alarmas (más grandes que §3 de
// design.md: tienen que leerse y tocarse de lejos).
export const ALARM_PRIMARY_BUTTON =
  'w-full bg-white hover:bg-white/95 text-[color:var(--alarm-action)] font-bold py-4 px-5 rounded-full text-[1.1rem] shadow-[0_10px_30px_-8px_rgba(0,70,64,0.35)] transition-all active:scale-[0.98] flex items-center justify-center space-x-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70';
export const ALARM_SECONDARY_BUTTON =
  'w-full bg-[color:var(--alarm-soft)] hover:bg-[color:var(--alarm-soft-hover)] text-white font-bold py-4 px-5 rounded-full text-[1.1rem] transition-all active:scale-[0.98] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70';

interface SnoozeControlProps {
  value: number;
  min: number;
  max: number;
  step: number;
  label: string; // texto del botón central, p. ej. "Recordar en 5 min"
  decreaseLabel: string; // aria-label del "−"
  increaseLabel: string; // aria-label del "+"
  onChange: (value: number) => void;
  onSnooze: () => void;
}

/**
 * Posponer: [ − ] Recordar en N [ + ]. El "−" se desactiva en el mínimo y el
 * "+" en el máximo; el botón central pospone con el valor elegido.
 */
export const SnoozeControl: React.FC<SnoozeControlProps> = ({
  value,
  min,
  max,
  step,
  label,
  decreaseLabel,
  increaseLabel,
  onChange,
  onSnooze,
}) => {
  const stepButton =
    'w-12 h-12 shrink-0 rounded-full bg-[color:var(--alarm-soft)] hover:bg-[color:var(--alarm-soft-hover)] text-white flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70';
  return (
    <div className="flex items-center gap-2.5 max-[379px]:gap-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label={decreaseLabel}
        className={stepButton}
      >
        <Minus className="w-6 h-6" />
      </button>
      <button type="button" onClick={onSnooze} className={`${ALARM_SECONDARY_BUTTON} px-2 whitespace-nowrap min-w-0 max-[379px]:text-base max-[379px]:px-1`}>
        {label}
      </button>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        aria-label={increaseLabel}
        className={stepButton}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

/**
 * Escala de texto común de las alarmas (toma y reclamo), para que se lean igual.
 * (2026-10-22: todo un 10 % más pequeño que la primera versión, mismas proporciones.)
 * Rol → misma clase en las dos pantallas.
 */
export const ALARM_TEXT = {
  // Solo en el reclamo: "HOY" / "MAÑANA" / "AÚN"
  when: 'text-[1.26rem] leading-none font-extrabold uppercase tracking-wide text-[color:var(--alarm-ink)] text-center',
  // "Toma:" / "debes reclamar:"
  label: 'text-[1.125rem] leading-tight font-medium text-[color:var(--alarm-ink)] text-center',
  // Nombre del medicamento
  name: 'leading-none font-extrabold text-[color:var(--alarm-ink)] text-center break-words max-w-full',
  // Dosis / fecha: la línea blanca destacada
  strong: 'text-[1.17rem] leading-tight font-bold text-white text-center',
  // Indicación / "Entrega 3 de 6"
  note: 'w-full max-w-[17rem] mx-auto text-center text-[0.9rem] leading-snug font-medium text-white',
};

/** Tamaño del nombre: los muy largos ("Hidroclorotiazida") bajan para no partirse. */
export const alarmNameSize = (name: string) => (name.length > 13 ? 'text-[1.8rem]' : 'text-[2.25rem]');

