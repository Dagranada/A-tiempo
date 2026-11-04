import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { analyzeMedicationImage } from './services/geminiService';
import {
  requestNotificationPermission,
  unlockAudio,
} from './services/notificationService';
import { useDoseReminders } from './hooks/useDoseReminders';
import { clearLeftoverStoredData, usePersistentState } from './hooks/usePersistentState';
import { EpsClaim, MedicationPlan, NavTab, ScreenView, SeniorProfile } from './types';
import {
  CLAIM_EVE_HOUR,
  ClaimAlertState,
  EMPTY_CLAIM_ALERTS,
  useClaimReminders,
} from './hooks/useClaimReminders';
import { daysBetween, getClaimSchedule, toIsoDate } from './lib/claims';
import { TakenDoses, getDosesForDay, markTaken } from './lib/doses';

import { Header } from './components/Header';
import { ReminderAlert } from './components/ReminderAlert';
import { HorarioView } from './components/HorarioView';
import { MisPlanesView } from './components/MisPlanesView';
import { CameraScanScreen } from './components/CameraScanScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { PlanFormScreen } from './components/PlanFormScreen';
import { PerfilView } from './components/PerfilView';
import { AccountScreen } from './components/AccountScreen';
import { ProfileCreateScreen } from './components/ProfileCreateScreen';
import { SplashScreen } from './components/SplashScreen';
import { BottomNav } from './components/BottomNav';
import { PastasView } from './components/PastasView';
import { ClaimAlert } from './components/ClaimAlert';

export default function App() {
  // Datos de quien toma los medicamentos: se guardan en el teléfono (ADR 0007). Una instalación
  // nueva arranca sin cuenta, perfil ni planes: splash → "Crea tu cuenta" →
  // "Nuevo perfil" → estados vacíos. La cuenta es provisional (solo el correo)
  // hasta conectar Supabase.
  const [account, setAccount] = usePersistentState<{ email: string } | null>('account', null);
  const [profile, setProfile] = usePersistentState<SeniorProfile | null>('profile', null);
  const [plans, setPlans] = usePersistentState<MedicationPlan[]>('plans', []);
  // Las tomas de hoy se calculan desde los planes (src/lib/doses.ts); solo se
  // guardan las marcadas "Listo".
  const [takenDoses, setTakenDoses] = usePersistentState<TakenDoses>('taken-doses', {});

  // Reloj de la vista: se actualiza cada minuto para que las tomas pasen a
  // pendientes a su hora, el día cambie a medianoche y el recuadro de reclamo
  // aparezca a las 12 m sin tener que recargar.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  const todayIso = toIsoDate(now);
  const doses = useMemo(() => getDosesForDay(plans, now, takenDoses), [plans, now, takenDoses]);

  // App Navigation & Screen State
  const [screen, setScreen] = useState<ScreenView>('home');
  const [activeTab, setActiveTab] = useState<NavTab>('horario');

  // Splash: sale cada vez que se abre la app. Función estable para que el
  // reloj de la vista no reinicie su temporizador.
  const [isSplashOpen, setIsSplashOpen] = useState(true);
  const closeSplash = useCallback(() => setIsSplashOpen(false), []);

  // Draft plan passed from scan -> loading -> form
  const [pendingScannedPlan, setPendingScannedPlan] = useState<
    Omit<MedicationPlan, 'id' | 'createdAt'> | null
  >(null);
  // true cuando el análisis de la imagen (real o de ejemplo) ya terminó
  const [isPlanReady, setIsPlanReady] = useState(false);

  // Recordatorios de toma: se activan explícitamente (campana, Perfil o el paso
  // 3 de "Nuevo perfil") y la elección se guarda en el teléfono.
  const [remindersEnabled, setRemindersEnabled] = usePersistentState('reminders-enabled', false);
  const { dueDose, snooze } = useDoseReminders(doses, remindersEnabled);

  // Al reabrir la app con los recordatorios ya activos, el navegador vuelve a
  // bloquear el sonido: se desbloquea con el primer toque en cualquier parte.
  useEffect(() => {
    if (!remindersEnabled) return;
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, [remindersEnabled]);

  // Avisos de reclamo en la EPS: qué se respondió a cada uno se guarda
  // en el teléfono para no repetir un aviso ya resuelto al recargar.
  const [claimAlerts, setClaimAlerts] = usePersistentState<ClaimAlertState>(
    'claim-alerts',
    EMPTY_CLAIM_ALERTS
  );
  const dueClaim = useClaimReminders(plans, claimAlerts, remindersEnabled);

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

    setTakenDoses((prev) => markTaken(prev, doseId, timeFormatted, now));
  };

  // "Deshacer" en Ya tomadas: la toma vuelve a pendiente (o a próxima, si aún no es la hora).
  const handleUndoTaken = (doseId: string) =>
    setTakenDoses((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== doseId)));

  // Handlers for scanning workflow
  const handleTapScan = () => {
    setScreen('scan');
  };

  const handleTakePhoto = (base64Image: string | null) => {
    if (!base64Image) {
      // Sin cámara real no hay nada que analizar: formulario vacío, a mano.
      setPendingScannedPlan(null);
      setScreen('plan_form');
      return;
    }

    setIsPlanReady(false);
    setScreen('loading');

    analyzeMedicationImage(base64Image)
      .then((extractedPlan) => {
        setPendingScannedPlan(extractedPlan);
      })
      .catch((err) => {
        console.error('No se pudo analizar la imagen con Gemini:', err);
        // Si el análisis falla, el plan se completa a mano.
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

    // 2. Las tomas salen del plan (src/lib/doses.ts): no hay nada más que crear.

    // 3. Return to Home / Mis Planes view
    setScreen('home');
    setActiveTab('planes');
  };

  const handleEditPlan = (plan: MedicationPlan) => {
    setPendingScannedPlan(plan);
    setScreen('plan_form');
  };

  const handleDeletePlan = (planId: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    setTakenDoses((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith(`${planId}@`)))
    );
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

  // Fin de "Nuevo perfil": entra al Horario, vacío hasta crear el primer plan.
  const handleCreateProfile = (created: SeniorProfile) => {
    setProfile(created);
    setScreen('home');
    setActiveTab('horario');
  };

  // --- Reclamos en la EPS (pestaña Pastas) ---
  const updateClaim = (planId: string, change: (claim: EpsClaim) => EpsClaim | undefined) =>
    setPlans((prev) =>
      prev.map((p) => (p.id === planId && p.claim ? { ...p, claim: change(p.claim) } : p))
    );

  const handleSaveClaim = (planId: string, claim: EpsClaim) =>
    setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, claim } : p)));

  // Solo se puede marcar dentro de la ventana del mes (desde su día a fin de mes).
  const handleMarkClaimed = (planId: string) => {
    const today = toIsoDate(new Date());
    updateClaim(planId, (claim) => {
      const current = getClaimSchedule(claim, today).current;
      if (current?.status !== 'open') return claim;
      return { ...claim, claimedDates: [...claim.claimedDates, today] };
    });
  };

  const handleRemoveClaim = (planId: string) => updateClaim(planId, () => undefined);

  const handleAcknowledgeClaim = (key: string) =>
    setClaimAlerts((prev) => ({ ...prev, dismissed: [...prev.dismissed, key] }));

  const handleSnoozeClaim = (key: string, hours: number) =>
    setClaimAlerts((prev) => ({
      ...prev,
      snoozedUntil: { ...prev.snoozedUntil, [key]: Date.now() + hours * 60 * 60 * 1000 },
    }));

  // Punto en la pestaña Pastas: hay que reclamar hoy (o se atrasó) o es mañana.
  const hasClaimToday = plans.some((p) => {
    const current = p.claim && getClaimSchedule(p.claim, todayIso).current;
    return !!current && (current.status === 'open' || daysBetween(todayIso, current.dueDate) === 1);
  });

  // Recuadro del Horario: acompaña la primera notificación, la del día anterior
  // (desde las 12 m), con el mismo texto. Hoy y los atrasos los cubren el aviso
  // de las 8 a. m. y el punto de la pestaña.
  const claimNotices =
    now.getHours() < CLAIM_EVE_HOUR
      ? []
      : plans.flatMap((p) => {
          const current = p.claim && getClaimSchedule(p.claim, todayIso).current;
          if (!current || current.status !== 'upcoming' || daysBetween(todayIso, current.dueDate) !== 1) {
            return [];
          }
          return [{ key: `banner:${p.id}:${current.dueDate}`, planName: p.name, text: `Mañana toca reclamar ${p.name}` }];
        });
  const visibleClaimNotices = claimNotices.filter((n) => !claimAlerts.dismissed.includes(n.key));

  // "Borrar todo y empezar de nuevo" (Perfil, con confirmación): el teléfono
  // queda como recién instalado y la app vuelve a "Nuevo perfil".
  const handleDeleteAll = () => {
    clearLeftoverStoredData();
    setPlans([]);
    setTakenDoses({});
    setClaimAlerts(EMPTY_CLAIM_ALERTS);
    setRemindersEnabled(false);
    setProfile(null);
    setAccount(null);
    setScreen('home');
    setActiveTab('horario');
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

        {/* Primera vez: crear la cuenta (correo + código) y después el perfil */}
        {!account && <AccountScreen onCreateAccount={(email) => setAccount({ email })} />}
        {account && !profile && (
          <ProfileCreateScreen
            remindersEnabled={remindersEnabled}
            onToggleReminders={handleToggleReminders}
            onCreateProfile={handleCreateProfile}
          />
        )}

        {/* Main Home App View */}
        {account && profile && screen === 'home' && (
          <>
            {/* En Perfil no hay Header: la foto y el nombre ya encabezan la vista,
                y los recordatorios se controlan con su propio interruptor */}
            {activeTab !== 'perfil' && (
              <Header
                profile={profile}
                today={now}
                todayCountPending={pendingDosesCount}
                remindersEnabled={remindersEnabled}
                onEnableReminders={handleEnableReminders}
              />
            )}

            {/* flex: las vistas ocupan todo el alto, para centrar sus estados vacíos */}
            <main className="flex-1 overflow-y-auto flex flex-col">
              {activeTab === 'horario' && (
                <HorarioView
                  doses={doses}
                  hasPlans={plans.length > 0}
                  onMarkAsTaken={handleMarkAsTaken}
                  onUndoTaken={handleUndoTaken}
                  onNavigateToScan={handleTapScan}
                  claimNotices={visibleClaimNotices}
                  onOpenPastas={() => setActiveTab('pastas')}
                  onDismissNotice={handleAcknowledgeClaim}
                />
              )}

              {activeTab === 'planes' && (
                <MisPlanesView
                  plans={plans}
                  onNavigateToScan={handleTapScan}
                  onEditPlan={handleEditPlan}
                  onDeletePlan={handleDeletePlan}
                />
              )}

              {activeTab === 'pastas' && (
                <PastasView
                  plans={plans}
                  onSaveClaim={handleSaveClaim}
                  onMarkClaimed={handleMarkClaimed}
                  onRemoveClaim={handleRemoveClaim}
                  onCreatePlan={handleTapScan}
                />
              )}

              {activeTab === 'perfil' && (
                <PerfilView
                  profile={profile}
                  remindersEnabled={remindersEnabled}
                  onToggleReminders={handleToggleReminders}
                  onSaveProfile={handleSaveProfile}
                  onDeleteAll={handleDeleteAll}
                />
              )}
            </main>

            <BottomNav
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              hasClaimToday={hasClaimToday}
            />

            {/* Recordatorio de toma: solo sobre la vista principal, para no
                interrumpir el escáner ni el formulario de plan. */}
            {dueDose && (
              <ReminderAlert
                dose={dueDose}
                plan={plans.find((p) => p.id === dueDose.planId)}
                onMarkAsTaken={handleMarkAsTaken}
                onSnooze={snooze}
              />
            )}
            {/* Aviso de reclamo: solo si no hay una toma en pantalla */}
            {dueClaim && !dueDose && (
              <ClaimAlert
                key={dueClaim.key}
                claim={dueClaim}
                onClaimed={(planId) => {
                  handleMarkClaimed(planId);
                  handleAcknowledgeClaim(dueClaim.key);
                }}
                onAcknowledge={handleAcknowledgeClaim}
                onSnooze={handleSnoozeClaim}
              />
            )}
          </>
        )}

        {/* Splash al abrir la app, encima de todo (también de "Nuevo perfil") */}
        {isSplashOpen && <SplashScreen onClose={closeSplash} />}
      </div>
    </div>
  );
}
