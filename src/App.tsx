import React, { useState } from 'react';
import {
  INITIAL_PLANS,
  INITIAL_SENIOR_PROFILE,
  INITIAL_TODAY_DOSES,
  SCAN_PRESETS,
} from './data/mockData';
import { analyzeMedicationImage } from './services/geminiService';
import {
  requestNotificationPermission,
  unlockAudio,
  playReminderSound,
  showTestNotification,
} from './services/notificationService';
import { useDoseReminders } from './hooks/useDoseReminders';
import { DoseItem, MedicationPlan, NavTab, ScreenView, SeniorProfile } from './types';

import { Header } from './components/Header';
import { ReminderAlert } from './components/ReminderAlert';
import { HorarioView } from './components/HorarioView';
import { MisPlanesView } from './components/MisPlanesView';
import { CameraScanScreen } from './components/CameraScanScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { PlanFormScreen } from './components/PlanFormScreen';
import { PerfilView } from './components/PerfilView';
import { BottomNav } from './components/BottomNav';

export default function App() {
  const [profile, setProfile] = useState(INITIAL_SENIOR_PROFILE);
  const [plans, setPlans] = useState<MedicationPlan[]>(INITIAL_PLANS);
  const [doses, setDoses] = useState<DoseItem[]>(INITIAL_TODAY_DOSES);

  // App Navigation & Screen State
  const [screen, setScreen] = useState<ScreenView>('home');
  const [activeTab, setActiveTab] = useState<NavTab>('horario');
  const [isEmptyState, setIsEmptyState] = useState<boolean>(false);

  // Draft plan passed from scan -> loading -> form
  const [pendingScannedPlan, setPendingScannedPlan] = useState<
    Omit<MedicationPlan, 'id' | 'createdAt'> | null
  >(null);
  // true cuando el análisis de la imagen (real o de ejemplo) ya terminó
  const [isPlanReady, setIsPlanReady] = useState(false);

  // Recordatorios de toma: se activan explícitamente desde la campana para no
  // sorprender con alarmas apenas se abre la app.
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const { dueDose, snooze } = useDoseReminders(doses, remindersEnabled);

  const handleEnableReminders = () => {
    if (remindersEnabled) return;

    // El mismo toque que activa los recordatorios habilita el audio, porque
    // los navegadores bloquean el sonido sin una interacción previa.
    unlockAudio();

    requestNotificationPermission()
      .catch((err) => {
        console.error('No se pudo pedir permiso de notificaciones:', err);
        return false;
      })
      .finally(() => {
        // Aunque el navegador niegue las notificaciones del sistema, la alerta
        // en pantalla y el sonido siguen funcionando.
        setRemindersEnabled(true);
      });
  };

  // Handlers for marking a dose as completed ("Listo ✓")
  const handleMarkAsTaken = (doseId: string) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    setDoses((prevDoses) =>
      prevDoses.map((d) => {
        if (d.id === doseId) {
          return {
            ...d,
            status: 'taken',
            takenAt: timeFormatted,
          };
        }
        return d;
      })
    );
  };

  // Handlers for scanning workflow
  const handleTapScan = () => {
    setScreen('scan');
  };

  const handleTakePhoto = (base64Image: string | null) => {
    setIsPlanReady(false);
    setScreen('loading');

    if (!base64Image) {
      // No hay cámara real disponible: se usa un ejemplo de muestra.
      setPendingScannedPlan(SCAN_PRESETS[0]?.extractedPlan ?? null);
      setIsPlanReady(true);
      return;
    }

    analyzeMedicationImage(base64Image)
      .then((extractedPlan) => {
        setPendingScannedPlan(extractedPlan);
      })
      .catch((err) => {
        console.error('No se pudo analizar la imagen con Gemini:', err);
        // El cuidador completa el formulario a mano si el análisis falla.
        setPendingScannedPlan(null);
      })
      .finally(() => {
        setIsPlanReady(true);
      });
  };

  const handleSkipToManualForm = () => {
    setPendingScannedPlan(null); // Empty form
    setScreen('plan_form');
  };

  const handleLoadingComplete = () => {
    setScreen('plan_form');
  };

  // Saving a plan (create or update)
  const handleSavePlan = (newPlan: MedicationPlan) => {
    // 1. Add or update plan in list
    setPlans((prev) => {
      const exists = prev.some((p) => p.id === newPlan.id);
      if (exists) {
        return prev.map((p) => (p.id === newPlan.id ? newPlan : p));
      }
      return [newPlan, ...prev];
    });

    // 2. Generate or update daily dose item for this plan
    const hourNum = parseInt(newPlan.initialTime.split(':')[0]) || 8;
    const minNum = parseInt(newPlan.initialTime.split(':')[1]) || 0;
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    const timeFormatted = `${hour12 < 10 ? '0' + hour12 : hour12}:${
      minNum < 10 ? '0' + minNum : minNum
    } ${period}`;

    setDoses((prev) => {
      const existingDoseIndex = prev.findIndex((d) => d.planId === newPlan.id);
      if (existingDoseIndex !== -1) {
        return prev.map((d) =>
          d.planId === newPlan.id
            ? {
                ...d,
                medicationName: newPlan.name,
                dose: newPlan.dose,
                timeFormatted,
                timeHour: hourNum,
                timeMinute: minNum,
              }
            : d
        );
      } else {
        const newDose: DoseItem = {
          id: `dose-${Date.now()}`,
          planId: newPlan.id,
          medicationName: newPlan.name,
          dose: newPlan.dose,
          timeFormatted,
          timeHour: hourNum,
          timeMinute: minNum,
          status: 'pending',
        };
        return [newDose, ...prev];
      }
    });

    // 3. Deactivate empty state if it was active
    setIsEmptyState(false);

    // 4. Return to Home / Mis Planes view
    setScreen('home');
    setActiveTab('planes');
  };

  const handleEditPlan = (plan: MedicationPlan) => {
    setPendingScannedPlan(plan);
    setScreen('plan_form');
  };

  const handleDeletePlan = (planId: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    setDoses((prev) => prev.filter((d) => d.planId !== planId));
  };

  // Apagar no necesita gesto ni permisos; encender pasa por el flujo de la campana
  const handleToggleReminders = () => {
    if (remindersEnabled) {
      setRemindersEnabled(false);
    } else {
      handleEnableReminders();
    }
  };

  const handleSaveProfile = (updated: SeniorProfile) => {
    setProfile(updated);
  };

  // Alarma de prueba (botón temporal del menú): suena y se muestra al instante
  // dentro del mismo toque, así el audio no queda bloqueado por el navegador.
  // `testAlarmVersion` dice qué diseño se está comparando (1 o 2); null = cerrada.
  const [testAlarmVersion, setTestAlarmVersion] = useState<1 | 2 | null>(null);
  const handleTestAlarm = (version: 1 | 2) => {
    unlockAudio();
    playReminderSound();
    setTestAlarmVersion(version);
    requestNotificationPermission()
      .then((granted) => granted && showTestNotification())
      .catch(() => undefined);
  };

  const handleResetData = () => {
    setPlans(INITIAL_PLANS);
    setDoses(INITIAL_TODAY_DOSES);
    setIsEmptyState(false);
  };

  const pendingDosesCount = doses.filter((d) => d.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1b1c1c] font-sans flex flex-col items-center justify-start antialiased">
      {/* Container Device Envelope */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-[#f8f9fa] min-h-screen relative flex flex-col shadow-2xl border-x border-gray-200">
        {/* Full-Screen Workflows */}
        {screen === 'scan' && (
          <CameraScanScreen
            onTakePhoto={handleTakePhoto}
            onSkipToManualForm={handleSkipToManualForm}
            onBack={() => setScreen('home')}
          />
        )}

        {screen === 'loading' && (
          <LoadingScreen onComplete={handleLoadingComplete} isReady={isPlanReady} />
        )}

        {screen === 'plan_form' && (
          <PlanFormScreen
            initialData={pendingScannedPlan}
            onSavePlan={handleSavePlan}
            onCancel={() => setScreen('home')}
          />
        )}

        {/* Main Home App View */}
        {screen === 'home' && (
          <>
            {/* En Perfil no hay Header: la foto y el nombre ya encabezan la vista,
                y los recordatorios se controlan con su propio interruptor */}
            {activeTab !== 'perfil' && (
              <Header
                profile={profile}
                isEmptyState={isEmptyState}
                onToggleEmptyState={() => setIsEmptyState(!isEmptyState)}
                todayCountPending={pendingDosesCount}
                remindersEnabled={remindersEnabled}
                onEnableReminders={handleEnableReminders}
              />
            )}

            <main className="flex-1 overflow-y-auto">
              {activeTab === 'horario' && (
                <HorarioView
                  doses={doses}
                  isEmptyState={isEmptyState}
                  onMarkAsTaken={handleMarkAsTaken}
                  onNavigateToScan={handleTapScan}
                  onNavigateToForm={handleSkipToManualForm}
                />
              )}

              {activeTab === 'planes' && (
                <MisPlanesView
                  plans={plans}
                  isEmptyState={isEmptyState}
                  onNavigateToScan={handleTapScan}
                  onNavigateToForm={handleSkipToManualForm}
                  onEditPlan={handleEditPlan}
                  onDeletePlan={handleDeletePlan}
                />
              )}

              {activeTab === 'perfil' && (
                <PerfilView
                  profile={profile}
                  remindersEnabled={remindersEnabled}
                  onToggleReminders={handleToggleReminders}
                  onSaveProfile={handleSaveProfile}
                />
              )}
            </main>

            <BottomNav
              activeTab={activeTab}
              onSelectTab={(tab) => {
                if (tab === 'escanear') {
                  handleTapScan();
                } else {
                  setActiveTab(tab);
                }
              }}
              onTapScan={handleTapScan}
              onTapTestAlarm={() => handleTestAlarm(1)}
              onTapTestAlarm2={() => handleTestAlarm(2)}
            />

            {/* Recordatorio de toma: solo sobre la vista principal, para no
                interrumpir el escáner ni el formulario de plan. */}
            {testAlarmVersion && (
              <ReminderAlert
                isTest
                version={testAlarmVersion}
                onClose={() => setTestAlarmVersion(null)}
              />
            )}
            {dueDose && !testAlarmVersion && (
              <ReminderAlert
                dose={dueDose}
                plan={plans.find((p) => p.id === dueDose.planId)}
                onMarkAsTaken={handleMarkAsTaken}
                onSnooze={snooze}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
