import React from 'react';

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
        {/* Pastilla del diseño (svg pill.svg), a su tamaño original de 38px */}
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <path
            d="M7.55877 7.55867C11.7306 3.38687 18.5045 3.38687 22.6763 7.55867L30.2351 15.1174C34.4069 19.2892 34.4069 26.0632 30.2351 30.235C26.0633 34.4068 19.2893 34.4068 15.1175 30.235L7.55877 22.6762C3.38697 18.5044 3.38697 11.7305 7.55877 7.55867Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M10.7515 25.3677C19.9517 17.3677 25.2515 12.3677 26.7515 10.8677" />
        </svg>
      </span>
      <span className="text-[2.4rem] leading-none font-light tracking-tight mt-6">A tiempo</span>
    </span>
  </button>
);
