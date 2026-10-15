import { useEffect, useState } from 'react';

// Prefijo con versión: si cambia la forma de los datos, se sube la versión y
// los datos viejos simplemente se ignoran en lugar de romper la app.
const PREFIX = 'a-tiempo:v1:';

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
