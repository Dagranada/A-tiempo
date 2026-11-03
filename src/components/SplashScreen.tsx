import React from 'react';
import { Pill } from 'lucide-react';

interface SplashScreenProps {
  onClose: () => void;
}

// Diámetros de los anillos, en % del ancho de la pantalla (de la referencia).
const RING_SIZES = [74, 121, 169, 216, 264];

/**
 * Pantalla de bienvenida: degradado del verde de la toma (arriba) al azul de
 * los reclamos (abajo), anillos concéntricos finos y, al centro, la pastilla
 * en un círculo y "A tiempo". Por ahora se ve con el botón temporal "Splash" y se cierra al tocarla.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ onClose }) => (
  <button
    type="button"
    onClick={onClose}
    aria-label="A tiempo. Toca para continuar"
    className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl z-50 overflow-hidden flex items-center justify-center cursor-pointer focus:outline-none"
    style={{ background: 'linear-gradient(172deg, #00c4a7 0%, #0bc9cf 45%, #19cdff 85%)' }}
  >
    {RING_SIZES.map((size) => (
      <span
        key={size}
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square rounded-full border border-white/20 pointer-events-none"
        style={{ width: `${size}%` }}
      />
    ))}

    <span className="relative flex flex-col items-center text-white font-heading select-none">
      <span className="w-[90px] h-[90px] rounded-full bg-white/15 flex items-center justify-center">
        <Pill className="w-11 h-11 rotate-90" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="text-[3.6rem] leading-none font-light tracking-tight mt-6">A tiempo</span>
    </span>
  </button>
);
