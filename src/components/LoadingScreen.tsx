import React, { useEffect, useState } from 'react';
import { Check, Loader2, Pill } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
  // true cuando Gemini ya respondió (o falló) y hay datos para mostrar en el formulario.
  isReady: boolean;
}

const STEPS = [
  'Procesando imagen del medicamento...',
  'Identificando nombre y concentración...',
  'Calculando dosis y frecuencia diaria...',
  'Generando horario sugerido para Alberto...'
];

const MAX_WAIT_MS = 15000; // Por si el análisis tarda demasiado o se cuelga.

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, isReady }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Avanza la animación de pasos hasta el último, y se queda ahí esperando.
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 750);

    return () => clearInterval(interval);
  }, []);

  // Solo avanza a la siguiente pantalla cuando la animación terminó Y el
  // análisis real ya está listo (o se agotó el tiempo máximo de espera).
  useEffect(() => {
    if (isReady && currentStep >= STEPS.length - 1) {
      const timeout = setTimeout(onComplete, 500);
      return () => clearTimeout(timeout);
    }
  }, [isReady, currentStep, onComplete]);

  useEffect(() => {
    const maxWaitTimeout = setTimeout(onComplete, MAX_WAIT_MS);
    return () => clearTimeout(maxWaitTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#f8f9fa] z-50 flex flex-col items-center justify-center p-6 text-center w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
      {/* Main Title Required: Creando plan… */}
      <h2 className="text-2xl font-extrabold text-gray-900 font-heading mb-2">
        Creando plan…
      </h2>
      <p className="text-sm text-gray-500 max-w-xs mb-8">
        Nuestra IA está extrayendo las indicaciones para armar el horario automático.
      </p>

      {/* Steps List */}
      <div className="w-full max-w-xs bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3 text-left">
        {STEPS.map((stepText, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={idx} className="flex items-center space-x-3 text-xs">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isDone
                    ? 'bg-[#69E1BC] text-white'
                    : isCurrent
                    ? 'bg-[#69E1BC]/20 text-[#0bc4a0] font-bold'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <span
                className={`transition-colors font-medium ${
                  isDone
                    ? 'text-gray-700 line-through opacity-80'
                    : isCurrent
                    ? 'text-gray-900 font-bold'
                    : 'text-gray-400'
                }`}
              >
                {stepText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
