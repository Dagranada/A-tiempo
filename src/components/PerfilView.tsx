import React, { useState } from 'react';
import { Check, LogOut, Mail, Trash2 } from 'lucide-react';
import { SeniorProfile } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import {
  ProfileBasicFields,
  ProfileMedicalFields,
  ProfilePhoto,
  NotificationSettings,
  SectionTitle,
  ageFromBirthDate,
} from './ProfileFields';

interface PerfilViewProps {
  profile: SeniorProfile;
  onSaveProfile: (profile: SeniorProfile) => void;
  notifications: React.ComponentProps<typeof NotificationSettings>; // se aplica al instante
  accountEmail: string; // correo con el que entró
  onSignOut: () => void; // los datos quedan en la nube
  onDeleteAll: () => Promise<string | null>; // borra todo, también en la nube; devuelve un error o null
}

export const PerfilView: React.FC<PerfilViewProps> = ({
  profile,
  onSaveProfile,
  onDeleteAll,
  onSignOut,
  accountEmail,
  notifications,
}) => {
  // Borrador local: nada se aplica hasta "Guardar cambios"
  const [draft, setDraft] = useState<SeniorProfile>(profile);
  const [nameError, setNameError] = useState('');
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
        {/* Sin línea bajo el título: los ajustes van debajo, como en las otras tarjetas */}
        <div className="px-5 pt-5 pb-4">
          <SectionTitle>Notificaciones</SectionTitle>
        </div>
        <div className="px-5 pb-5">
          <NotificationSettings {...notifications} />
        </div>
      </section>

      {/* Cuenta: el correo con el que entró y "Cerrar sesión" */}
      <section className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-4">
        <SectionTitle>Cuenta</SectionTitle>
        <div className="flex items-center space-x-3">
          <Mail className="w-5 h-5 text-gray-400 shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold text-gray-900 break-all">{accountEmail}</p>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Tus planes se guardan en tu cuenta. Si cambias de celular, entra con este correo y los recuperas.
        </p>
        <button
          type="button"
          onClick={onSignOut}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-full text-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
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
          onClick={() => setConfirmDelete(true)}
          disabled={isDeleting}
          className="w-full disabled:opacity-60 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-full text-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>{isDeleting ? 'Borrando…' : 'Borrar todo y empezar de nuevo'}</span>
        </button>
        {deleteError && <p className="text-xs text-red-500 font-medium text-center">{deleteError}</p>}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="¿Borrar todo?"
          message="Se borrarán tu perfil, tus planes, las tomas marcadas y las órdenes de la EPS, también de tu cuenta en la nube, y se cerrará la sesión. No se puede deshacer."
          confirmLabel="Sí, borrar todo"
          onConfirm={async () => {
            setConfirmDelete(false);
            setIsDeleting(true);
            setDeleteError((await onDeleteAll()) ?? '');
            setIsDeleting(false);
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </form>
  );
};
