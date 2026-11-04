import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { SeniorProfile } from '../types';
import {
  ProfileBasicFields,
  ProfileMedicalFields,
  ProfilePhoto,
  NotificationSettings,
  SectionTitle,
  ageFromBirthDate,
} from './ProfileFields';

interface ProfileCreateScreenProps {
  onCreateProfile: (profile: SeniorProfile) => void;
  notifications: React.ComponentProps<typeof NotificationSettings>; // paso 3
}

const EMPTY_PROFILE: SeniorProfile = {
  name: '',
  age: 0,
  avatarUrl: '',
  birthDate: '',
  sex: '',
  phone: '',
  weightKg: '',
  heightM: '',
  bloodType: '',
  rhFactor: '',
};

// Los tres pasos son las tres secciones de la pestaña Perfil, en el mismo orden.
const STEPS = ['Información básica', 'Información médica', 'Notificaciones'];

/**
 * Nuevo perfil en tres pasos: información básica (solo el nombre es
 * obligatorio), información médica y notificaciones. Es lo primero que se ve
 * después del splash si aún no hay perfil, así que no hay a dónde cancelar: la
 * flecha solo aparece desde el paso 2 y vuelve al anterior sin perder lo escrito.
 */
export const ProfileCreateScreen: React.FC<ProfileCreateScreenProps> = ({
  onCreateProfile,
  notifications,
}) => {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<SeniorProfile>(EMPTY_PROFILE);
  const [nameError, setNameError] = useState('');
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const update = <K extends keyof SeniorProfile>(key: K, value: SeniorProfile[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 0 && !draft.name.trim()) {
      setNameError('Ingresa el nombre completo');
      return;
    }
    if (!isLast) {
      setStep(step + 1);
      return;
    }
    onCreateProfile({
      ...draft,
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      age: ageFromBirthDate(draft.birthDate, draft.age),
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto flex flex-col">
      <header className="bg-white px-5 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10 shrink-0">
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Volver al paso anterior"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900 font-heading">Nuevo perfil</h1>
          <p className="text-xs text-gray-500">
            Paso {step + 1} de {STEPS.length}
          </p>
        </div>
        <div className="w-9" /> {/* Spacer */}
      </header>

      <form onSubmit={handleSubmit} className="p-5 pb-8 space-y-5 flex-1 flex flex-col">
        {/* Sin tarjeta ni título de pantalla: los campos van sobre el fondo */}
        <div className="space-y-5">
          {step === 0 && <ProfilePhoto draft={draft} update={update} />}
          <SectionTitle>{current}</SectionTitle>
          {step === 0 && (
            <ProfileBasicFields
              draft={draft}
              update={update}
              nameError={nameError}
              onClearNameError={() => setNameError('')}
            />
          )}
          {step === 1 && <ProfileMedicalFields draft={draft} update={update} />}
          {step === 2 && (
            <NotificationSettings {...notifications} />
          )}
        </div>

        {/* Botones al final de la pantalla */}
        <div className="space-y-2.5 pt-2 mt-auto">
          <button
            type="submit"
            className="w-full bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 px-5 rounded-full text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            {isLast && <Check className="w-5 h-5" />}
            <span>{isLast ? 'Crear perfil' : 'Siguiente'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
