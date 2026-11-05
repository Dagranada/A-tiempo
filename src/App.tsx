import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { analyzeMedicationImage } from './services/geminiService';
import {
  previewAlarmSound,
  requestNotificationPermission,
  setAlarmPreferences,
  setCustomAlarmSound,
  stopReminderSound,
  unlockAudio,
} from './services/notificationService';
import { deleteAlarmSound, loadAlarmSound, saveAlarmSound } from './lib/soundStore';
import { useDoseReminders } from './hooks/useDoseReminders';
import { clearLeftoverStoredData, usePersistentState } from './hooks/usePersistentState';
import { deleteCloudData, useCloudSync } from './hooks/useCloudSync';
import { describeSupabaseError, isSupabaseConfigured, supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
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
import { CloudLoadingScreen } from './components/CloudLoadingScreen';
import { BottomNav } from './components/BottomNav';
import { PastasView } from './components/PastasView';
import { ClaimAlert } from './components/ClaimAlert';

// Tope del sonido de alarma escogido del celular.
const MAX_SOUND_BYTES = 20 * 1024 * 1024;

export default function App() {
  // Cuenta (Supabase, código al correo, sin contraseña). undefined = todavía
  // leyendo la sesión guardada en el teléfono.
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);
  const userId = session?.user.id ?? null;

  // Datos de quien toma los medicamentos: una copia en el teléfono (ADR 0007),
  // para que todo funcione sin internet, sincronizada con su cuenta en Supabase
  // (useCloudSync). Una cuenta nueva arranca sin perfil ni planes: splash →
  // "Crea tu cuenta" → "Nuevo perfil" → estados vacíos.
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
  // No se pudo leer la foto (falló o se agotó la espera): el formulario lo avisa.
  const [scanFailed, setScanFailed] = useState(false);
  const scanIdRef = useRef(0); // para ignorar una respuesta que llega tarde

  // Recordatorios: son parte básica de la app, no una opción. Están activos
  // desde que existe el perfil (antes no hay nada que recordar).
  const remindersActive = Boolean(session && profile);
  const { dueDose, snooze } = useDoseReminders(doses, remindersActive);

  // Sonido de la alarma escogido del celular: el nombre va con los datos y el
  // archivo en IndexedDB (src/lib/soundStore.ts). Al abrir se vuelve a cargar;
  // si el archivo ya no está, se vuelve al sonido de A Tiempo.
  const [alarmSound, setAlarmSound] = usePersistentState<{ name: string } | null>('alarm-sound', null);
  useEffect(() => {
    loadAlarmSound().then((file) => {
      setCustomAlarmSound(file);
      if (!file) setAlarmSound(null);
    });
  }, []); // solo al abrir la app

  const handlePickSound = async (file: File): Promise<string | null> => {
    const isAudio = file.type.startsWith('audio/') || /\.(mp3|m4a|aac|wav|ogg|oga|opus|flac|amr|3gp)$/i.test(file.name);
    if (!isAudio) return 'Ese archivo no es un sonido. Escoge una canción o un tono.';
    if (file.size > MAX_SOUND_BYTES) return 'El archivo es muy grande (más de 20 MB). Escoge uno más corto.';
    try {
      await saveAlarmSound(file);
    } catch {
      return 'No se pudo guardar el sonido en este teléfono. Intenta con otro.';
    }
    setCustomAlarmSound(file);
    setAlarmSound({ name: file.name.replace(/\.[^.]+$/, '') || file.name });
    if (!soundEnabled) setSoundEnabled(true); // escoger un sonido es querer oírlo
    previewAlarmSound(); // se escucha unos segundos, como en el selector de tonos
    return null;
  };

  const handleClearSound = () => {
    void deleteAlarmSound();
    setCustomAlarmSound(null);
    setAlarmSound(null);
  };

  // Interruptores "Sonido" y "Vibración" de Notificaciones (se guardan).
  const [soundEnabled, setSoundEnabled] = usePersistentState('alarm-sound-enabled', true);
  const [vibrationEnabled, setVibrationEnabled] = usePersistentState('alarm-vibration-enabled', true);
  useEffect(() => {
    setAlarmPreferences({ sound: soundEnabled, vibration: vibrationEnabled });
  }, [soundEnabled, vibrationEnabled]);

  const notificationProps = {
    soundEnabled,
    onToggleSound: () => setSoundEnabled(!soundEnabled),
    vibrationEnabled,
    onToggleVibration: () => {
      // Al encenderla, una vibración corta confirma que funciona en este teléfono.
      if (!vibrationEnabled) navigator.vibrate?.(200);
      setVibrationEnabled(!vibrationEnabled);
    },
    soundName: alarmSound?.name ?? null,
    onPickSound: handlePickSound,
    onClearSound: handleClearSound,
  };

  // Cada vez que se abre la app, el navegador bloquea el sonido hasta el primer
  // toque: ese toque lo desbloquea y, si aún no se decidió, pide el permiso de
  // notificaciones. Solo con perfil (la primera vez lo hace "Crear perfil").
  useEffect(() => {
    if (!remindersActive) return;
    const unlock = () => enableReminderOutput();
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, [remindersActive]);

  // Avisos de reclamo en la EPS: qué se respondió a cada uno se guarda
  // en el teléfono para no repetir un aviso ya resuelto al recargar.
  const [claimAlerts, setClaimAlerts] = usePersistentState<ClaimAlertState>(
    'claim-alerts',
    EMPTY_CLAIM_ALERTS
  );
  const dueClaim = useClaimReminders(plans, claimAlerts, remindersActive);

  // Sincronización con la nube (ver useCloudSync).
  const { status: cloud, retry: retryCloud } = useCloudSync(
    userId,
    { profile, plans, takenDoses, claimAlerts },
    { setProfile, setPlans, setTakenDoses, setClaimAlerts }
  );

  const handleSendCode = async (email: string): Promise<string | null> => {
    if (!isSupabaseConfigured) return 'Falta configurar la conexión de la app. Intenta más tarde.';
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    return error ? describeSupabaseError(error) : null;
  };

  const handleVerifyCode = async (email: string, code: string): Promise<string | null> => {
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    return error ? describeSupabaseError(error) : null; // si salió bien, onAuthStateChange entra solo
  };

  // El sonido escogido suena mientras la alarma está en pantalla: al responderla
  // (Listo, Recordar en…, Entendido) se detiene.
  useEffect(() => {
    if (!dueDose && !dueClaim) stopReminderSound();
  }, [dueDose, dueClaim]);

  // Dentro de un toque: habilita el audio (los navegadores lo bloquean sin una
  // interacción previa) y pide permiso de notificaciones si aún no se decidió.
  // Aunque se nieguen, la alerta en pantalla y el sonido siguen funcionando.
  const enableReminderOutput = () => {
    unlockAudio();
    requestNotificationPermission().catch((err) => {
      console.error('No se pudo pedir permiso de notificaciones:', err);
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
    setScanFailed(false);
    setPendingScannedPlan(null);

    if (!base64Image) {
      // Sin cámara real no hay nada que analizar: formulario vacío, a mano.
      setScreen('plan_form');
      return;
    }

    setIsPlanReady(false);
    setScreen('loading');

    const scanId = ++scanIdRef.current;
    analyzeMedicationImage(base64Image)
      .then((extractedPlan) => {
        if (scanId === scanIdRef.current) setPendingScannedPlan(extractedPlan);
      })
      .catch((err) => {
        console.error('No se pudo analizar la imagen con Gemini:', err);
        // Se completa a mano; el formulario avisa y ofrece intentarlo otra vez.
        if (scanId === scanIdRef.current) setScanFailed(true);
      })
      .finally(() => {
        if (scanId === scanIdRef.current) setIsPlanReady(true);
      });
  };

  const handleSkipToManualForm = () => {
    setScanFailed(false);
    setPendingScannedPlan(null); // Empty form
    setScreen('plan_form');
  };

  const handleLoadingComplete = () => {
    if (!isPlanReady) {
      // Se agotó la espera: se ignora la respuesta si llega tarde (el formulario
      // ya estaría abierto) y se avisa que no se pudo leer la foto.
      scanIdRef.current += 1;
      setScanFailed(true);
    }
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
    setScanFailed(false);
    setPendingScannedPlan(plan);
    setScreen('plan_form');
  };

  const handleDeletePlan = (planId: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    setTakenDoses((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith(`${planId}@`)))
    );
  };

  const handleSaveProfile = (updated: SeniorProfile) => {
    setProfile(updated);
  };

  // Fin de "Nuevo perfil": entra al Horario, vacío hasta crear el primer plan.
  const handleCreateProfile = (created: SeniorProfile) => {
    enableReminderOutput(); // el toque de "Crear perfil" deja listos sonido y permiso
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

  // Deja el teléfono como recién instalado (sin tocar la nube).
  const clearPhoneData = () => {
    clearLeftoverStoredData();
    handleClearSound();
    setSoundEnabled(true);
    setVibrationEnabled(true);
    setPlans([]);
    setTakenDoses({});
    setClaimAlerts(EMPTY_CLAIM_ALERTS);
    setProfile(null);
    setScreen('home');
    setActiveTab('horario');
  };

  // "Cerrar sesión": los datos quedan en la nube; se borran del teléfono para
  // que la próxima cuenta que entre aquí no los vea. Primero se cierra la
  // sesión: así la sincronización no sube el teléfono vacío como "borrado".
  const handleSignOut = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    setSession(null);
    clearPhoneData();
  };

  // "Borrar todo y empezar de nuevo" (Perfil, con confirmación): borra los datos
  // de la cuenta también en la nube y cierra la sesión. Necesita internet.
  const handleDeleteAll = async (): Promise<string | null> => {
    if (!userId) return null;
    try {
      await deleteCloudData(userId);
    } catch (err) {
      return describeSupabaseError(err);
    }
    await handleSignOut();
    return null;
  };

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
            scanFailed={scanFailed}
            onRetryScan={handleTapScan}
          />
        )}

        {/* Sin sesión: entrar o crear la cuenta (correo + código). Con sesión,
            primero se traen los datos de la nube y, si no hay perfil, se crea. */}
        {session === null && <AccountScreen onSendCode={handleSendCode} onVerifyCode={handleVerifyCode} />}
        {/* Con sesión, mientras no esté lista (incluido el instante justo después
            del código, antes de empezar a cargar) se ve "Cargando tus datos…",
            nunca una pantalla en blanco. */}
        {session && cloud !== 'ready' && (
          <CloudLoadingScreen failed={cloud === 'error'} onRetry={retryCloud} onSignOut={handleSignOut} />
        )}
        {session && cloud === 'ready' && !profile && (
          <ProfileCreateScreen onCreateProfile={handleCreateProfile} notifications={notificationProps} />
        )}

        {/* Main Home App View */}
        {session && cloud === 'ready' && profile && screen === 'home' && (
          <>
            {/* En Perfil no hay Header: la foto y el nombre ya encabezan la vista,
                y los recordatorios se controlan con su propio interruptor */}
            {activeTab !== 'perfil' && (
              <Header
                profile={profile}
                today={now}
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
                  onSaveProfile={handleSaveProfile}
                  onDeleteAll={handleDeleteAll}
                  onSignOut={handleSignOut}
                  accountEmail={session.user.email ?? ''}
                  notifications={notificationProps}
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
