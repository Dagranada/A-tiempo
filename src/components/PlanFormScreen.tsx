import React, { useState } from 'react';
import { ArrowLeft, Calendar, ChevronDown, Clock, Info, Pill, X } from 'lucide-react';
import { MedicationPlan } from '../types';

interface PlanFormScreenProps {
  initialData?: Omit<MedicationPlan, 'id' | 'createdAt'> | MedicationPlan | null;
  onSavePlan: (plan: MedicationPlan) => void;
  onCancel: () => void;
}

export const PlanFormScreen: React.FC<PlanFormScreenProps> = ({
  initialData,
  onSavePlan,
  onCancel,
}) => {
  const isFromAi = Boolean(initialData?.name);

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dose, setDose] = useState(initialData?.dose || '1 pastilla');
  const [initialTime, setInitialTime] = useState(initialData?.initialTime || '08:00');
  const [frequencyValue, setFrequencyValue] = useState<number>(
    initialData?.frequencyValue || 8
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = 'Ingresa el nombre del medicamento';
    if (!dose.trim()) newErrors.dose = 'Ingresa la dosis por toma';
    if (!initialTime) newErrors.initialTime = 'Selecciona la hora inicial';
    if (!frequencyValue || frequencyValue <= 0)
      newErrors.frequencyValue = 'Ingresa una frecuencia válida';

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
      dose: dose.trim(),
      initialTime,
      frequencyValue,
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
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900 font-heading">
            {isFromAi ? 'Revisar Plan de IA' : 'Nuevo Plan Manual'}
          </h1>
          <p className="text-xs text-gray-500">Configura la dosis de Alberto</p>
        </div>
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
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Nombre del medicamento *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="Ej.: Metformina, Amoxicilina, Aspirina"
            className={`w-full bg-white border ${
              errors.name ? 'border-red-500' : 'border-gray-200'
            } rounded-2xl px-4 py-3 h-12 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba] transition-all flex items-center`}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Campo 2: Descripción breve */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Descripción breve
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej.: Para la presión arterial, con el almuerzo"
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 h-12 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba] transition-all flex items-center"
          />
        </div>

        {/* Campo 3: Dosis por toma */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Dosis por toma *
          </label>
          <input
            type="text"
            value={dose}
            onChange={(e) => {
              setDose(e.target.value);
              setErrors((prev) => ({ ...prev, dose: '' }));
            }}
            placeholder="Ej.: 1 pastilla • 500mg, 10ml, 2 cápsulas"
            className={`w-full bg-white border ${
              errors.dose ? 'border-red-500' : 'border-gray-200'
            } rounded-2xl px-4 py-3 h-12 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba] transition-all flex items-center`}
          />
          {errors.dose && (
            <p className="text-xs text-red-500 mt-1 font-medium">{errors.dose}</p>
          )}
        </div>

        {/* Campo 4: Hora inicial */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Hora inicial *
          </label>
          <input
            type="time"
            value={initialTime}
            onChange={(e) => {
              setInitialTime(e.target.value);
              setErrors((prev) => ({ ...prev, initialTime: '' }));
            }}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 h-12 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba] transition-all flex items-center [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
          {errors.initialTime && (
            <p className="text-xs text-red-500 mt-1 font-medium">
              {errors.initialTime}
            </p>
          )}
        </div>

        {/* Campos 5 & 6: Selector de fechas (Desde / Hasta) en una sola línea debajo de Hora inicial */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Desde
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 h-12 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba] flex items-center [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Hasta
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 h-12 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba] flex items-center [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>
        </div>

        {/* Campo 7: Frecuencia (numérico + dropdown) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Frecuencia *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative flex items-center">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">
                Cada
              </span>
              <input
                type="number"
                min="1"
                max="99"
                value={frequencyValue}
                onChange={(e) => setFrequencyValue(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-gray-200 rounded-2xl pl-14 pr-3 py-3 h-12 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba] flex items-center"
              />
            </div>

            <select
              value={frequencyUnit}
              onChange={(e) => setFrequencyUnit(e.target.value as 'horas' | 'días')}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 h-12 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba] cursor-pointer flex items-center"
            >
              <option value="horas">horas</option>
              <option value="días">días</option>
            </select>
          </div>

          {/* Example cadence preview */}
          <p className="text-xs text-[#0bc4a0] font-semibold mt-1.5">
            Ejemplo: 1 toma cada {frequencyValue} {frequencyUnit}
          </p>
        </div>

        {/* Indicaciones especiales opcionales */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Indicaciones especiales
          </label>
          <textarea
            rows={2}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Ej.: Tomar con un vaso de agua antes de acostarse"
            className="w-full bg-white border border-gray-200 rounded-2xl p-3.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba]"
          />
        </div>

        {/* Botón Guardar Plan */}
        <button
          type="submit"
          className="w-full bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 rounded-full transition-all text-sm shadow-sm active:scale-[0.98] flex items-center justify-center mt-4"
        >
          <span>Guardar plan</span>
        </button>
      </form>
    </div>
  );
};
