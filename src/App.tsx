import React, { useState } from 'react';
import {
  INITIAL_PLANS,
  INITIAL_SENIOR_PROFILE,
  INITIAL_TODAY_DOSES,
} from './data/mockData';
import { DoseItem, MedicationPlan, NavTab, ScreenView } from './types';

import { Header } from './components/Header';
import { HorarioView } from './components/HorarioView';
import { MisPlanesView } from './components/MisPlanesView';
import { CameraScanScreen } from './components/CameraScanScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { PlanFormScreen } from './components/PlanFormScreen';
import { PerfilView } from './components/PerfilView';
import { BottomNav } from './components/BottomNav';

export default function App() {
  const [profile] = useState(INITIAL_SENIOR_PROFILE);
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

  const handleTakePhoto = (
    extractedPlanData?: Omit<MedicationPlan, 'id' | 'createdAt'>
  ) => {
    setPendingScannedPlan(extractedPlanData || null);
    setScreen('loading');
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
          <LoadingScreen onComplete={handleLoadingComplete} />
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
            <Header
              profile={profile}
              isEmptyState={isEmptyState}
              onToggleEmptyState={() => setIsEmptyState(!isEmptyState)}
              todayCountPending={pendingDosesCount}
            />

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
                <PerfilView profile={profile} />
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
            />
          </>
        )}
      </div>
    </div>
  );
}
