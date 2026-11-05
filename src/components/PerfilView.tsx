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

// Secundario con borde: sobre el fondo gris, sin tarjeta, el gris no se distingue.
const outlineButton =
  'w-full bg-transparent hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-full text-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5';

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
    <form onSubmit={handleSubmit} className="px-5 py-6 space-y-10 pb-28">
      {/* Sin tarjetas: todo sobre el fondo gris, 24 px entre cada título y su contenido */}
      {/* Foto, nombre e información básica */}
      <section className="space-y-6">
        <ProfilePhoto draft={draft} update={update} />
        <SectionTitle>Información básica</SectionTitle>
        <div className="space-y-5">
          <ProfileBasicFields
            draft={draft}
            update={update}
            nameError={nameError}
            onClearNameError={() => setNameError('')}
          />
        </div>
      </section>

      {/* Información médica */}
      <section className="space-y-6">
        <SectionTitle>Información médica</SectionTitle>
        <ProfileMedicalFields draft={draft} update={update} />
      </section>

      {/* Notificaciones: se aplica al instante, no espera a "Guardar cambios" */}
      <section className="space-y-6">
        <SectionTitle>Notificaciones</SectionTitle>
        <NotificationSettings {...notifications} />
      </section>

      {/* Cuenta: el correo con el que entró y "Cerrar sesión" */}
      <section className="space-y-6">
        <SectionTitle>Cuenta</SectionTitle>
        <div className="space-y-4">
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
            className={outlineButton}
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </section>

      {/* Guardar */}
      <div className="pt-2 space-y-2">
        <button
          type="submit"
          className="w-full bg-[linear-gradient(90deg,#0ee5ba,#19cdff)] hover:brightness-95 text-gray-900 font-bold py-2.5 px-5 rounded-full text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
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
          className={`${outlineButton} disabled:opacity-60`}
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
