import React from 'react';
import { Minus, Plus } from 'lucide-react';

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

interface StepperProps {
  value: string;
  onChange: (value: string) => void;
  step: number;
  min: number;
  max: number;
  label: string; // para los aria-label de los botones
  prefix?: string;
  suffix?: string;
  hasError?: boolean;
  inputId?: string;
}

// Campo numérico con [ − ] valor [ + ]. Se puede escribir o tocar los botones.
export const Stepper: React.FC<StepperProps> = ({
  value,
  onChange,
  step,
  min,
  max,
  label,
  prefix,
  suffix,
  hasError,
  inputId,
}) => {
  const current = parseFloat(value.replace(',', '.')) || 0;
  const bump = (delta: number) => {
    const next = Math.min(max, Math.max(min, Math.round((current + delta) / step) * step));
    onChange(String(next));
  };

  return (
    <div
      className={`flex items-center justify-between bg-white border ${
        hasError ? 'border-red-500' : 'border-gray-200'
      } rounded-2xl px-1.5 h-12 focus-within:ring-2 focus-within:ring-[#0ee5ba] transition-all`}
    >
      <button
        type="button"
        onClick={() => bump(-step)}
        disabled={current <= min}
        className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-colors shrink-0 active:scale-[0.98] disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0ee5ba]"
        aria-label={`Disminuir ${label}`}
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="flex-1 flex items-baseline justify-center space-x-1 overflow-hidden px-1">
        {prefix && (
          <span className="text-sm text-gray-400 font-medium pointer-events-none">{prefix}</span>
        )}
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ''))}
          placeholder="—"
          aria-label={capitalize(label)}
          className={`${
            suffix ? 'w-12 text-right' : prefix ? 'w-8 text-center' : 'w-full text-center'
          } text-sm font-medium text-gray-900 bg-transparent border-0 p-0 focus:outline-none`}
        />
        {suffix && (
          <span className="text-sm text-gray-400 font-medium pointer-events-none">{suffix}</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => bump(step)}
        disabled={current >= max}
        className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-colors shrink-0 active:scale-[0.98] disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0ee5ba]"
        aria-label={`Aumentar ${label}`}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
