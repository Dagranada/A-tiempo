import { useEffect, useState } from 'react';

// Prefijo con versión: si cambia la forma de los datos, se sube la versión y
// los datos viejos simplemente se ignoran en lugar de romper la app.
// v2 (2026-11-03): el perfil puede faltar (primera vez → "Nuevo perfil") y ya no
// se arranca con datos de ejemplo; los datos v1 quedan guardados, sin usar.
const PREFIX = 'a-tiempo:v2:';

// Claves que usa la app hoy. Todo lo demás con el prefijo "a-tiempo:" son
// restos de versiones anteriores (datos v1, la lista de tomas que ya no se guarda).
const CURRENT_KEYS = new Set(['alarm-sound', 'alarm-sound-enabled', 'alarm-vibration-enabled', 'profile', 'plans', 'taken-doses', 'claim-alerts']);

/** "Borrar todo": quita del teléfono los restos que no maneja ningún estado. */
export function clearLeftoverStoredData(): void {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith('a-tiempo:') && !(k.startsWith(PREFIX) && CURRENT_KEYS.has(k.slice(PREFIX.length))))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // Almacenamiento bloqueado: no hay nada que borrar.
  }
}

function read<T>(key: string, initial: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? initial : (JSON.parse(raw) as T);
  } catch {
    // Modo privado, almacenamiento bloqueado o JSON dañado: se arranca de cero.
    return initial;
  }
}

/**
 * Como useState, pero guarda el valor en el teléfono (localStorage) para que
 * sobreviva a recargar o cerrar la app. Si no se puede guardar (espacio lleno,
 * modo privado), la app sigue funcionando en memoria.
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => read(key, initial));

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (err) {
      console.error(`No se pudo guardar "${key}" en el teléfono:`, err);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
