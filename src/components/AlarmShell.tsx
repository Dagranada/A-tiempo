import React, { useLayoutEffect, useRef, useState } from 'react';

// Ondas: cada una tarda WAVE_DURATION_S en cruzar; sale una nueva cada WAVE_GAP_S.
// Debe coincidir con la duración de `alarm-wave` / `alarm-wave-soft` en index.css.
const WAVE_DURATION_S = 8;
const WAVE_GAP_S = 0.8;
const WAVE_COUNT = Math.round(WAVE_DURATION_S / WAVE_GAP_S);
// Diámetro del disco de la píldora: las ondas nacen de este tamaño.
const WAVE_START_PX = 110;

export type AlarmVersion = 2 | 3;

interface AlarmShellProps {
  version: AlarmVersion; // 2 = la alarma real; 3 = alternativa de prueba
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
  titleId,
  descriptionId,
  children,
  actions,
}) => {
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
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      style={{
        background:
          version === 3
            ? 'radial-gradient(circle at 50% 32%, #0cdbc9 0%, #01bcae 42%, #009d90 100%)'
            : 'radial-gradient(circle at 50% 35%, #2ee6cc 0%, #10d2b8 30%, #00bfa8 62%, #00a693 100%)',
      }}
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
              className={`absolute rounded-full ${version === 3 ? 'alarm-wave-soft' : 'alarm-wave'}`}
              style={
                version === 3
                  ? // La 3 ya nace del tamaño final y solo se escala: así el
                    // celular la anima sin repintar (no se traba).
                    ({
                      left: ripple.x,
                      top: ripple.y,
                      width: ripple.size,
                      height: ripple.size,
                      '--wave-start': WAVE_START_PX / ripple.size,
                      animationDelay: `${i * WAVE_GAP_S}s`,
                    } as React.CSSProperties)
                  : ({
                      left: ripple.x,
                      top: ripple.y,
                      '--wave-max': `${ripple.size}px`,
                      animationDelay: `${i * WAVE_GAP_S}s`,
                    } as React.CSSProperties)
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
      </main>

      <footer className="relative w-full flex flex-col gap-3 pt-8">{actions}</footer>
    </div>
  );
};

// Clases compartidas por los botones de las alarmas (más grandes que §3 de
// design.md: tienen que leerse y tocarse de lejos).
export const ALARM_PRIMARY_BUTTON =
  'w-full bg-white hover:bg-white/95 text-[#009688] font-bold py-4 px-5 rounded-full text-[1.1rem] shadow-[0_10px_30px_-8px_rgba(0,70,64,0.35)] transition-all active:scale-[0.98] flex items-center justify-center space-x-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70';
export const ALARM_SECONDARY_BUTTON =
  'w-full bg-[#00695e]/30 hover:bg-[#00695e]/40 text-white font-bold py-4 px-5 rounded-full text-[1.1rem] transition-all active:scale-[0.98] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70';
