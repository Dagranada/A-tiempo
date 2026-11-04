import { useCallback, useEffect, useRef, useState } from 'react';
import { MedicationPlan, SeniorProfile } from '../types';
import { TakenDoses } from '../lib/doses';
import { ClaimAlertState, EMPTY_CLAIM_ALERTS } from './useClaimReminders';
import { supabase } from '../lib/supabase';

export interface CloudData {
  profile: SeniorProfile | null;
  plans: MedicationPlan[];
  takenDoses: TakenDoses;
  claimAlerts: ClaimAlertState;
}

interface CloudSetters {
  setProfile: (profile: SeniorProfile | null) => void;
  setPlans: (plans: MedicationPlan[]) => void;
  setTakenDoses: (taken: TakenDoses) => void;
  setClaimAlerts: (alerts: ClaimAlertState) => void;
}

// 'loading' = trayendo los datos de la nube al entrar; 'ready' = listo (con o sin
// conexión: sin internet se sigue con la copia del teléfono).
export type CloudStatus = 'signed-out' | 'loading' | 'ready';

const PUSH_DELAY_MS = 800; // agrupa cambios seguidos en un solo envío
const RETRY_MS = 30 * 1000;

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Mantiene la copia del teléfono y la de Supabase iguales para la cuenta
 * `userId`. El teléfono manda (las alarmas no pueden depender de la señal):
 *
 * - Al entrar, si la nube ya tiene un perfil, se usan sus datos (otro teléfono
 *   o reinstalación). Si no tiene, se sube lo que haya en el teléfono.
 * - Después, cada cambio se sube; si falla (sin internet), se reintenta al
 *   volver la conexión y cada 30 s. Si dos teléfonos cambian lo mismo, gana el
 *   último que sube.
 */
export function useCloudSync(userId: string | null, data: CloudData, setters: CloudSetters): CloudStatus {
  const [status, setStatus] = useState<CloudStatus>(userId ? 'loading' : 'signed-out');
  // Lo último que se sabe que está en la nube, para subir solo lo que cambió.
  const syncedRef = useRef<CloudData | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const settersRef = useRef(setters);
  settersRef.current = setters;

  // 1. Al entrar (o cambiar de cuenta): traer los datos de la nube.
  useEffect(() => {
    syncedRef.current = null;
    if (!userId) {
      setStatus('signed-out');
      return;
    }
    setStatus('loading');
    let cancelled = false;

    (async () => {
      try {
        const [profileRes, plansRes, takenRes, stateRes] = await Promise.all([
          supabase.from('profiles').select('data').eq('user_id', userId).maybeSingle(),
          supabase.from('plans').select('data').eq('user_id', userId),
          supabase.from('taken_doses').select('dose_key, taken_at').eq('user_id', userId),
          supabase.from('user_state').select('claim_alerts').eq('user_id', userId).maybeSingle(),
        ]);
        const failed = [profileRes, plansRes, takenRes, stateRes].find((r) => r.error);
        if (failed?.error) throw failed.error;
        if (cancelled) return;

        if (profileRes.data) {
          // La nube ya tiene esta cuenta: sus datos reemplazan a los del teléfono.
          const remote: CloudData = {
            profile: profileRes.data.data as SeniorProfile,
            plans: (plansRes.data ?? []).map((row) => row.data as MedicationPlan),
            takenDoses: Object.fromEntries((takenRes.data ?? []).map((row) => [row.dose_key, row.taken_at])),
            claimAlerts: (stateRes.data?.claim_alerts as ClaimAlertState | undefined) ?? EMPTY_CLAIM_ALERTS,
          };
          settersRef.current.setProfile(remote.profile);
          settersRef.current.setPlans(remote.plans);
          settersRef.current.setTakenDoses(remote.takenDoses);
          settersRef.current.setClaimAlerts(remote.claimAlerts);
          syncedRef.current = remote;
        } else {
          // Cuenta nueva en la nube: lo que haya en el teléfono se sube (paso 2).
          syncedRef.current = { profile: null, plans: [], takenDoses: {}, claimAlerts: EMPTY_CLAIM_ALERTS };
        }
      } catch (err) {
        // Sin conexión al abrir: se sigue con la copia del teléfono, tal cual.
        console.error('No se pudieron traer los datos de la nube:', err);
        if (cancelled) return;
        syncedRef.current = { ...dataRef.current };
      }
      if (!cancelled) setStatus('ready');
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // 2. Subir lo que cambió desde la última vez.
  const push = useCallback(async () => {
    const synced = syncedRef.current;
    if (!userId || !synced) return;
    const current = dataRef.current;

    try {
      if (current.profile && !same(current.profile, synced.profile)) {
        const { error } = await supabase
          .from('profiles')
          .upsert({ user_id: userId, data: current.profile, updated_at: new Date().toISOString() });
        if (error) throw error;
        synced.profile = current.profile;
      }

      if (!same(current.plans, synced.plans)) {
        const currentIds = new Set(current.plans.map((p) => p.id));
        const removed = synced.plans.filter((p) => !currentIds.has(p.id)).map((p) => p.id);
        if (removed.length > 0) {
          const { error } = await supabase.from('plans').delete().eq('user_id', userId).in('id', removed);
          if (error) throw error;
        }
        const changed = current.plans.filter((p) => !same(p, synced.plans.find((s) => s.id === p.id)));
        if (changed.length > 0) {
          const now = new Date().toISOString();
          const { error } = await supabase
            .from('plans')
            .upsert(changed.map((p) => ({ user_id: userId, id: p.id, data: p, updated_at: now })));
          if (error) throw error;
        }
        synced.plans = current.plans;
      }

      if (!same(current.takenDoses, synced.takenDoses)) {
        const removed = Object.keys(synced.takenDoses).filter((k) => !(k in current.takenDoses));
        if (removed.length > 0) {
          const { error } = await supabase.from('taken_doses').delete().eq('user_id', userId).in('dose_key', removed);
          if (error) throw error;
        }
        const changed = Object.entries(current.takenDoses).filter(([k, v]) => synced.takenDoses[k] !== v);
        if (changed.length > 0) {
          const { error } = await supabase
            .from('taken_doses')
            .upsert(changed.map(([dose_key, taken_at]) => ({ user_id: userId, dose_key, taken_at })));
          if (error) throw error;
        }
        synced.takenDoses = current.takenDoses;
      }

      if (!same(current.claimAlerts, synced.claimAlerts)) {
        const { error } = await supabase
          .from('user_state')
          .upsert({ user_id: userId, claim_alerts: current.claimAlerts, updated_at: new Date().toISOString() });
        if (error) throw error;
        synced.claimAlerts = current.claimAlerts;
      }
    } catch (err) {
      // Queda pendiente: se vuelve a intentar al volver la conexión o en 30 s.
      console.error('No se pudieron subir los cambios a la nube:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (status !== 'ready') return;
    const timer = setTimeout(push, PUSH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status, push, data.profile, data.plans, data.takenDoses, data.claimAlerts]);

  useEffect(() => {
    if (status !== 'ready') return;
    const retry = () => void push();
    window.addEventListener('online', retry);
    const interval = setInterval(retry, RETRY_MS);
    return () => {
      window.removeEventListener('online', retry);
      clearInterval(interval);
    };
  }, [status, push]);

  return status;
}

/** "Borrar todo": quita los datos de la cuenta en la nube. */
export async function deleteCloudData(userId: string): Promise<void> {
  const results = await Promise.all([
    supabase.from('taken_doses').delete().eq('user_id', userId),
    supabase.from('plans').delete().eq('user_id', userId),
    supabase.from('user_state').delete().eq('user_id', userId),
    supabase.from('profiles').delete().eq('user_id', userId),
  ]);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}
