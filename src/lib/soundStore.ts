// Sonido de alarma que escogió la persona (una canción o un tono del celular).
// Un archivo de audio no cabe en localStorage, así que va en IndexedDB; su
// nombre, para mostrarlo, sí va con el resto de los datos (`alarm-sound`).

const DB_NAME = 'a-tiempo';
const STORE = 'sounds';
const KEY = 'alarm';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = action(db.transaction(STORE, mode).objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
  );
}

export const saveAlarmSound = (file: Blob) => run('readwrite', (store) => store.put(file, KEY)).then(() => undefined);

/** El sonido guardado, o null si no hay (o si el almacenamiento está bloqueado). */
export const loadAlarmSound = () =>
  run<Blob | undefined>('readonly', (store) => store.get(KEY))
    .then((blob) => blob ?? null)
    .catch(() => null);

export const deleteAlarmSound = () =>
  run('readwrite', (store) => store.delete(KEY))
    .then(() => undefined)
    .catch(() => undefined);
