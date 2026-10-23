import React, { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { SeniorProfile } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import {
  ProfileBasicFields,
  ProfileMedicalFields,
  ProfilePhoto,
  RemindersToggle,
  SectionTitle,
  ageFromBirthDate,
} from './ProfileFields';

interface PerfilViewProps {
  profile: SeniorProfile;
  remindersEnabled: boolean;
  onToggleReminders: () => void;
  onSaveProfile: (profile: SeniorProfile) => void;
  onResetData: () => void; // vuelve a los planes y reclamos de ejemplo
}

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
        <ProfilePhoto draft={draft} update={update} />
        <SectionTitle>Información básica</SectionTitle>
        <ProfileBasicFields
          draft={draft}
          update={update}
          nameError={nameError}
          onClearNameError={() => setNameError('')}
        />
      </section>

      {/* Información médica */}
      <section className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-5">
        <SectionTitle>Información médica</SectionTitle>
        <ProfileMedicalFields draft={draft} update={update} />
      </section>

      {/* Notificaciones: se aplica al instante, no espera a "Guardar cambios" */}
      <section className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <SectionTitle>Notificaciones</SectionTitle>
        </div>
        <div className="p-5">
          <RemindersToggle remindersEnabled={remindersEnabled} onToggleReminders={onToggleReminders} />
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
