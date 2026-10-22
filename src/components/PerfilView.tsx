import React, { useState } from 'react';
import { Bell, Calendar, Camera, Check, ChevronDown, Phone, RotateCcw, User } from 'lucide-react';
import { SeniorProfile } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface PerfilViewProps {
  profile: SeniorProfile;
  remindersEnabled: boolean;
  onToggleReminders: () => void;
  onSaveProfile: (profile: SeniorProfile) => void;
  onResetData: () => void; // vuelve a los planes y reclamos de ejemplo
}

const labelClass = 'block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5';

const inputBase =
  'w-full bg-white border rounded-2xl px-4 py-3 h-12 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba] transition-all flex items-center';
const inputClass = `${inputBase} border-gray-200`;

// El indicador nativo se estira invisible sobre el campo: todo el campo abre el selector
const nativePickerClass =
  '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer';

const fieldIconClass =
  'w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none';

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="flex items-center space-x-2 text-[13px] font-bold tracking-wider text-gray-900 uppercase">
    <span className="w-2 h-2 rounded-full bg-[#0ee5ba]" aria-hidden="true" />
    <span>{children}</span>
  </h2>
);

// "1948-05-14" → 78 (años cumplidos hoy)
const ageFromBirthDate = (iso: string, fallback: number) => {
  const birth = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return fallback;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;
  return age;
};

export const PerfilView: React.FC<PerfilViewProps> = ({
  profile,
  remindersEnabled,
  onToggleReminders,
  onSaveProfile,
  onResetData,
}) => {
  // Borrador local: nada se aplica hasta "Guardar cambios"
  const [draft, setDraft] = useState<SeniorProfile>(profile);
  const [nameError, setNameError] = useState('');
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const update = <K extends keyof SeniorProfile>(key: K, value: SeniorProfile[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update('avatarUrl', String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) {
      setNameError('Ingresa el nombre completo');
      return;
    }
    onSaveProfile({
      ...draft,
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      age: ageFromBirthDate(draft.birthDate, draft.age),
    });
    setSaved(true);
  };

  return (
    <form onSubmit={handleSubmit} className="px-5 py-6 space-y-4 pb-28">
      {/* Foto, nombre e información básica */}
      <section className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-5">
        <div className="flex flex-col items-center pt-1">
          <div className="relative">
            <img
              src={draft.avatarUrl}
              alt={`Foto de perfil de ${draft.name || 'la persona'}`}
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-sm ring-1 ring-[#E2E8F0]"
            />
            <label
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#0ee5ba]"
              title="Cambiar foto de perfil"
            >
              <Camera className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                aria-label="Cambiar foto de perfil"
                className="sr-only"
              />
            </label>
          </div>
          <p className="text-xl font-bold text-gray-900 font-heading mt-3 text-center">
            {draft.name || 'Sin nombre'}
          </p>
        </div>

        <SectionTitle>Información básica</SectionTitle>

        <div>
          <label htmlFor="profile-name" className={labelClass}>
            Nombre completo *
          </label>
          <div className="relative">
            <input
              id="profile-name"
              type="text"
              value={draft.name}
              onChange={(e) => {
                update('name', e.target.value);
                setNameError('');
              }}
              placeholder="Ej.: Alberto Valdés"
              className={`${inputBase} ${nameError ? 'border-red-500' : 'border-gray-200'} pr-10`}
            />
            <User className={fieldIconClass} />
          </div>
          {nameError && <p className="text-xs text-red-500 mt-1 font-medium">{nameError}</p>}
        </div>

        <div>
          <label htmlFor="profile-birth" className={labelClass}>
            Fecha de nacimiento
          </label>
          <div className="relative">
            <input
              id="profile-birth"
              type="date"
              value={draft.birthDate}
              onChange={(e) => update('birthDate', e.target.value)}
              className={`${inputClass} pr-10 relative ${nativePickerClass}`}
            />
            <Calendar className={fieldIconClass} />
          </div>
        </div>

        <div>
          <label htmlFor="profile-sex" className={labelClass}>
            Sexo
          </label>
          <div className="relative">
            <select
              id="profile-sex"
              value={draft.sex}
              onChange={(e) => update('sex', e.target.value as SeniorProfile['sex'])}
              className={`${inputClass} appearance-none pr-10 cursor-pointer`}
            >
              <option value="">Sin especificar</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
            <ChevronDown className={fieldIconClass} />
          </div>
        </div>

        <div>
          <label htmlFor="profile-phone" className={labelClass}>
            Teléfono de contacto
          </label>
          <div className="relative">
            <input
              id="profile-phone"
              type="tel"
              inputMode="tel"
              value={draft.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="Ej.: 612 345 678"
              className={`${inputClass} pr-10`}
            />
            <Phone className={fieldIconClass} />
          </div>
        </div>
      </section>

      {/* Información médica */}
      <section className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-5">
        <SectionTitle>Información médica</SectionTitle>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="profile-weight" className={labelClass}>
              Peso
            </label>
            <div className="relative">
              <input
                id="profile-weight"
                type="text"
                inputMode="decimal"
                value={draft.weightKg}
                onChange={(e) => update('weightKg', e.target.value.replace(/[^\d.,]/g, ''))}
                placeholder="—"
                className={`${inputClass} pr-10`}
              />
              <span className="text-sm text-gray-400 font-medium absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                kg
              </span>
            </div>
          </div>
          <div>
            <label htmlFor="profile-height" className={labelClass}>
              Estatura
            </label>
            <div className="relative">
              <input
                id="profile-height"
                type="text"
                inputMode="decimal"
                value={draft.heightM}
                onChange={(e) => update('heightM', e.target.value.replace(/[^\d.,]/g, ''))}
                placeholder="—"
                className={`${inputClass} pr-10`}
              />
              <span className="text-sm text-gray-400 font-medium absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                m
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="profile-blood" className={labelClass}>
              Grupo sanguíneo
            </label>
            <div className="relative">
              <select
                id="profile-blood"
                value={draft.bloodType}
                onChange={(e) => update('bloodType', e.target.value as SeniorProfile['bloodType'])}
                className={`${inputClass} appearance-none pr-10 cursor-pointer`}
              >
                <option value="">—</option>
                <option value="O">O</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
              </select>
              <ChevronDown className={fieldIconClass} />
            </div>
          </div>
          <div>
            <label htmlFor="profile-rh" className={labelClass}>
              Factor RH
            </label>
            <div className="relative">
              <select
                id="profile-rh"
                value={draft.rhFactor}
                onChange={(e) => update('rhFactor', e.target.value as SeniorProfile['rhFactor'])}
                className={`${inputClass} appearance-none pr-10 cursor-pointer`}
              >
                <option value="">—</option>
                <option value="Positivo (+)">Positivo (+)</option>
                <option value="Negativo (−)">Negativo (−)</option>
              </select>
              <ChevronDown className={fieldIconClass} />
            </div>
          </div>
        </div>
      </section>

      {/* Notificaciones: se aplica al instante, no espera a "Guardar cambios" */}
      <section className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <SectionTitle>Notificaciones</SectionTitle>
        </div>
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#d0f8ed] text-[#0bc4a0] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p id="reminders-label" className="text-sm font-bold text-gray-900">
                Recordatorios con sonido
              </p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Avisan a la hora de cada toma, con la app abierta
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={remindersEnabled}
            aria-labelledby="reminders-label"
            onClick={onToggleReminders}
            className={`relative w-14 h-8 rounded-full shrink-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0ee5ba] focus-visible:ring-offset-2 ${
              remindersEnabled ? 'bg-[#0ee5ba]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                remindersEnabled ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>
      </section>

      {/* Guardar */}
      <div className="pt-2 space-y-2">
        <button
          type="submit"
          className="w-full bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 px-5 rounded-full text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
        >
          <Check className="w-5 h-5" />
          <span>Guardar cambios</span>
        </button>
        {saved && (
          <p role="status" className="text-xs text-[#0bc4a0] font-semibold text-center">
            Cambios guardados
          </p>
        )}
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-full text-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restablecer datos de ejemplo</span>
        </button>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="¿Restablecer los datos de ejemplo?"
          message="Se reemplazarán los planes, las tomas y las órdenes de la EPS por los de ejemplo. No se puede deshacer."
          confirmLabel="Sí, restablecer"
          onConfirm={() => {
            onResetData();
            setConfirmReset(false);
          }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </form>
  );
};
