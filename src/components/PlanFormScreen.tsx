import React, { useState } from 'react';
import { ArrowLeft, Calendar, ChevronDown, Clock, Info, Minus, Plus, X } from 'lucide-react';
import { MedicationPlan } from '../types';

interface PlanFormScreenProps {
  initialData?: Omit<MedicationPlan, 'id' | 'createdAt'> | MedicationPlan | null;
  onSavePlan: (plan: MedicationPlan) => void;
  onCancel: () => void;
}

// Unidades que se cuentan por pieza. Cualquier otra dosis ("10ml", "5 gotas")
// no cabe en "N pastillas • X mg" y se edita como texto libre para no falsearla.
const COUNT_UNITS = ['pastilla', 'cápsula', 'capsula', 'tableta', 'comprimido'];

interface ParsedDose {
  count: number;
  unit: string;
  mg: string;
}

// "2 pastillas • 200mg" → { count: 2, unit: 'pastilla', mg: '200' }
const parseDose = (dose: string): ParsedDose | null => {
  const match = dose
    .trim()
    .match(/^(\d+)\s*([a-záéíóúñ]+)?\s*(?:•\s*)?(?:(\d+(?:[.,]\d+)?)\s*mg)?$/i);
  if (!match) return null;
  const word = (match[2] || 'pastilla').toLowerCase();
  const unit = COUNT_UNITS.find((u) => word === u || word === `${u}s`);
  if (!unit) return null;
  return { count: parseInt(match[1], 10), unit, mg: match[3] || '' };
};

const formatDose = ({ count, unit, mg }: ParsedDose) =>
  `${count} ${unit}${count === 1 ? '' : 's'}${mg ? ` • ${mg}mg` : ''}`;

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const inputBase =
  'w-full bg-white border rounded-2xl px-4 py-3 h-12 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba] transition-all flex items-center';
const inputClass = `${inputBase} border-gray-200`;
const fieldClass = (hasError?: boolean) =>
  `${inputBase} ${hasError ? 'border-red-500' : 'border-gray-200'}`;

// El indicador nativo se estira invisible sobre el campo: todo el campo abre el selector
const nativePickerClass =
  '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer';

const labelClass = 'block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5';

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
const Stepper: React.FC<StepperProps> = ({
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

export const PlanFormScreen: React.FC<PlanFormScreenProps> = ({
  initialData,
  onSavePlan,
  onCancel,
}) => {
  const isFromAi = Boolean(initialData?.name);

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');

  // Dosis: steppers si encaja en "N pastillas • X mg"; si no, texto libre tal cual vino
  const initialDose = initialData?.dose || '1 pastilla';
  const parsedDose = parseDose(initialDose);
  const [isFreeDose] = useState(parsedDose === null);
  const [freeDose, setFreeDose] = useState(initialDose);
  const [doseUnit] = useState(parsedDose?.unit || 'pastilla');
  const [pillCount, setPillCount] = useState(String(parsedDose?.count ?? 1));
  const [mgPerPill, setMgPerPill] = useState(parsedDose?.mg ?? '');

  const [initialTime, setInitialTime] = useState(initialData?.initialTime || '08:00');
  const [frequencyValue, setFrequencyValue] = useState(
    String(initialData?.frequencyValue || 8)
  );
  const [frequencyUnit, setFrequencyUnit] = useState<'horas' | 'días'>(
    initialData?.frequencyUnit || 'horas'
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEndStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [startDate, setStartDate] = useState(initialData?.startDate || todayStr);
  const [endDate, setEndDate] = useState(initialData?.endDate || defaultEndStr);
  const [instructions, setInstructions] = useState(
    initialData?.instructions || 'Tomar según indicaciones del empaque'
  );

  const [showNotice, setShowNotice] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const clearError = (key: string) => setErrors((prev) => ({ ...prev, [key]: '' }));

  const unitPlural = `${capitalize(doseUnit)}s`;
  const frequencyNum = parseInt(frequencyValue, 10) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    const count = parseInt(pillCount, 10) || 0;
    const mg = mgPerPill.replace(',', '.');

    if (!name.trim()) newErrors.name = 'Ingresa el nombre del medicamento';
    if (isFreeDose) {
      if (!freeDose.trim()) newErrors.dose = 'Ingresa la dosis por toma';
    } else if (count <= 0) {
      newErrors.dose = `Ingresa cuántas ${doseUnit}s por toma`;
    } else if (mg && !(parseFloat(mg) > 0)) {
      newErrors.dose = 'Ingresa los mg por pastilla o déjalo vacío';
    }
    if (!initialTime) newErrors.initialTime = 'Selecciona la hora inicial';
    if (frequencyNum <= 0) newErrors.frequencyValue = 'Ingresa una frecuencia válida';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const planId = initialData && 'id' in initialData ? initialData.id : `plan-${Date.now()}`;
    const createdAt = initialData && 'createdAt' in initialData ? initialData.createdAt : new Date().toISOString();

    const newPlan: MedicationPlan = {
      id: planId,
      name: name.trim(),
      description: description.trim() || 'Plan de medicación',
      dose: isFreeDose
        ? freeDose.trim()
        : formatDose({ count, unit: doseUnit, mg: mg ? String(parseFloat(mg)) : '' }),
      initialTime,
      frequencyValue: frequencyNum,
      frequencyUnit,
      startDate,
      endDate,
      instructions: instructions.trim(),
      createdAt,
    };

    onSavePlan(newPlan);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto flex flex-col">
      {/* Top Bar Header */}
      <header className="bg-white px-5 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10 shrink-0">
        <button
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 font-heading text-center">
          {isFromAi ? 'Revisa el plan' : 'Nuevo plan'}
        </h1>
        <div className="w-9" /> {/* Spacer */}
      </header>

      <form onSubmit={handleSubmit} className="p-5 space-y-5 flex-1">
        {/* Medical suggestion notice */}
        {showNotice && (
          <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-2xl flex items-start justify-between space-x-3 text-xs text-amber-900">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="font-medium text-amber-800 leading-snug">
                Este plan es una sugerencia, revisa y edita antes de guardar. Pídele a tu médico las indicaciones precisas.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNotice(false)}
              className="p-1 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors shrink-0 -mr-1 -mt-1"
              aria-label="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Campo 1: Nombre del medicamento */}
        <div>
          <label htmlFor="med-name" className={labelClass}>
            Nombre del medicamento *
          </label>
          <input
            id="med-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError('name');
            }}
            placeholder="Ej.: Metformina, Amoxicilina, Aspirina"
            className={`${fieldClass(Boolean(errors.name))}`}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Campo 2: Descripción breve */}
        <div>
          <label htmlFor="med-desc" className={labelClass}>
            Descripción breve
          </label>
          <input
            id="med-desc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej.: Para la presión arterial, con el almuerzo"
            className={inputClass}
          />
        </div>

        {/* Campo 3: Dosis por toma — cantidad + mg por pastilla, con la misma etiqueta que el resto */}
        <div>
          {isFreeDose ? (
            <>
            <label htmlFor="med-dose" className={labelClass}>
              Dosis por toma *
            </label>
            <input
              id="med-dose"
              type="text"
              value={freeDose}
              onChange={(e) => {
                setFreeDose(e.target.value);
                clearError('dose');
              }}
              placeholder="Ej.: 10ml, 5 gotas"
              className={`${fieldClass(Boolean(errors.dose))}`}
            />
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className={labelClass}>{unitPlural} por toma *</span>
                <Stepper
                  value={pillCount}
                  onChange={(v) => {
                    setPillCount(v.replace(/\D/g, ''));
                    clearError('dose');
                  }}
                  step={1}
                  min={1}
                  max={20}
                  label={`${doseUnit}s`}
                  hasError={Boolean(errors.dose)}
                />
              </div>
              <div>
                <span className={labelClass}>Mg por {doseUnit}</span>
                <Stepper
                  value={mgPerPill}
                  onChange={(v) => {
                    setMgPerPill(v);
                    clearError('dose');
                  }}
                  step={50}
                  min={0}
                  max={5000}
                  label="miligramos"
                  suffix="mg"
                  hasError={Boolean(errors.dose)}
                />
              </div>
            </div>
          )}
          {errors.dose && (
            <p className="text-xs text-red-500 mt-1 font-medium">{errors.dose}</p>
          )}
        </div>

        {/* Campo 4: Hora de toma inicial */}
        <div>
          <label htmlFor="start-time" className={labelClass}>
            Hora de toma inicial *
          </label>
          <div className="relative">
            <input
              id="start-time"
              type="time"
              value={initialTime}
              onChange={(e) => {
                setInitialTime(e.target.value);
                clearError('initialTime');
              }}
              className={`${fieldClass(Boolean(errors.initialTime))} pr-10 relative ${nativePickerClass}`}
            />
            <Clock className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {errors.initialTime && (
            <p className="text-xs text-red-500 mt-1 font-medium">
              {errors.initialTime}
            </p>
          )}
        </div>

        {/* Campos 5 & 6: Desde / Hasta */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="date-from" className={labelClass}>
              Desde
            </label>
            <div className="relative">
              <input
                id="date-from"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`${inputClass} pr-10 relative ${nativePickerClass}`}
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="date-to" className={labelClass}>
              Hasta
            </label>
            <div className="relative">
              <input
                id="date-to"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`${inputClass} pr-10 relative ${nativePickerClass}`}
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Campo 7: Frecuencia (stepper + unidad) */}
        <div>
          <label htmlFor="frequency-input" className={labelClass}>
            Frecuencia *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Stepper
              inputId="frequency-input"
              value={frequencyValue}
              onChange={(v) => {
                setFrequencyValue(v.replace(/\D/g, ''));
                clearError('frequencyValue');
              }}
              step={1}
              min={1}
              max={99}
              label="frecuencia"
              prefix="Cada"
              hasError={Boolean(errors.frequencyValue)}
            />

            <div className="relative">
              <select
                value={frequencyUnit}
                onChange={(e) => setFrequencyUnit(e.target.value as 'horas' | 'días')}
                aria-label="Unidad de frecuencia"
                className={`${inputClass} appearance-none pr-10 cursor-pointer`}
              >
                <option value="horas">horas</option>
                <option value="días">días</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {errors.frequencyValue ? (
            <p className="text-xs text-red-500 mt-1 font-medium">{errors.frequencyValue}</p>
          ) : (
            <p className="text-xs text-[#0bc4a0] font-semibold mt-1.5">
              Ejemplo: 1 toma cada {frequencyNum || '—'} {frequencyUnit}
            </p>
          )}
        </div>

        {/* Indicaciones especiales opcionales */}
        <div>
          <label htmlFor="special-instructions" className={labelClass}>
            Indicaciones especiales
          </label>
          <textarea
            id="special-instructions"
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Ej.: Tomar con un vaso de agua antes de acostarse"
            className="w-full bg-white border border-gray-200 rounded-2xl p-3.5 text-sm font-medium text-gray-900 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#0ee5ba]"
          />
        </div>

        {/* Botón Guardar Plan */}
        <button
          type="submit"
          className="w-full bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 px-5 rounded-full text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2 mt-4"
        >
          <span>Guardar plan</span>
        </button>
      </form>
    </div>
  );
};
