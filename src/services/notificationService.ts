const NOTIFICATION_TITLE = 'A Tiempo';

// Chime de dos notas, sintetizado con Web Audio para no depender de un archivo.
const CHIME_NOTES = [880, 1174.7]; // La5 y Re6
const NOTE_DURATION = 0.28;
const NOTE_GAP = 0.22;
const PEAK_GAIN = 0.22;

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  const AudioContextCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextCtor) return null;

  if (!audioContext) {
    audioContext = new AudioContextCtor();
  }
  return audioContext;
}

/**
 * Los navegadores bloquean el audio hasta que la persona interactúa con la
 * página. Se llama desde el mismo toque que activa los recordatorios para que
 * el sonido pueda sonar después por sí solo.
 */
export function unlockAudio(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    void ctx.resume();
  }
  // El sonido escogido también necesita un primer toque para poder sonar solo:
  // se reproduce en silencio y se detiene al instante.
  if (customSound && customSound.paused) {
    const sound = customSound;
    const primeId = ++playId;
    sound.muted = true;
    sound
      .play()
      .then(() => {
        // Si mientras tanto empezó a sonar de verdad (alarma o "Escuchar"), no se toca.
        if (playId !== primeId) return;
        sound.pause();
        sound.currentTime = 0;
      })
      .catch(() => undefined)
      .finally(() => {
        if (playId === primeId) sound.muted = false;
      });
  }
}

// --- Sonido escogido por la persona (canción o tono del celular) ---
// Suena hasta 1 minuto por aviso (o hasta que se responda la alarma); si no se
// puede reproducir, suena el chime de siempre.
const CUSTOM_MAX_MS = 60 * 1000;
const PREVIEW_MS = 10 * 1000;
let customSound: HTMLAudioElement | null = null;
let customSoundUrl: string | null = null;
let stopTimer: ReturnType<typeof setTimeout> | null = null;
let playId = 0; // cada reproducción real invalida la preparación en silencio

/** Usa este archivo como sonido de alarma; null vuelve al de A Tiempo. */
export function setCustomAlarmSound(file: Blob | null): void {
  stopReminderSound();
  if (customSoundUrl) URL.revokeObjectURL(customSoundUrl);
  customSoundUrl = file ? URL.createObjectURL(file) : null;
  customSound = customSoundUrl ? new Audio(customSoundUrl) : null;
  if (customSound) {
    customSound.preload = 'auto';
    customSound.loop = true; // canciones o tonos cortos se repiten hasta el tope
  }
}

/** Detiene el sonido escogido (al responder la alarma o al terminar la prueba). */
export function stopReminderSound(): void {
  navigator.vibrate?.(0);
  if (stopTimer) clearTimeout(stopTimer);
  stopTimer = null;
  if (customSound) {
    customSound.pause();
    customSound.currentTime = 0;
  }
}

function playCustom(maxMs: number): boolean {
  if (!customSound) return false;
  stopReminderSound();
  const sound = customSound;
  playId += 1;
  sound.muted = false;
  sound.play().catch(() => playChime());
  stopTimer = setTimeout(stopReminderSound, maxMs);
  return true;
}

/** "Escuchar": 10 segundos del sonido elegido (o el chime, si es el de A Tiempo). */
export function previewAlarmSound(): void {
  unlockAudio();
  if (!playCustom(PREVIEW_MS)) playChime();
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Pide permiso para mostrar notificaciones del sistema.
 * Devuelve false (en vez de romper) si el navegador no las soporta o si la
 * persona las rechaza, para que la app pueda seguir avisando solo en pantalla.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Muestra la notificación del sistema de una toma pendiente.
 * El `tag` por medicamento evita que se apilen decenas de avisos repetidos:
 * cada recordatorio reemplaza al anterior del mismo medicamento.
 */
export function showDoseNotification(medicationName: string, dose: string, tag: string): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  new Notification(NOTIFICATION_TITLE, {
    body: `Es hora de tomar ${dose} de ${medicationName}`,
    tag: `dose-${tag}`,
    requireInteraction: true,
    silent: false,
  });
}

/** Notificación del sistema de un reclamo en la EPS: mismo texto que el recuadro del Horario. */
export function showClaimNotification(body: string, tag: string): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  new Notification(body, {
    body: 'Toca para ver tus pastas',
    tag: `claim-${tag}`,
    silent: false,
  });
}

// Interruptores "Sonido" y "Vibración" de Notificaciones.
let soundOn = true;
let vibrationOn = true;
// Tres pulsos largos: se notan en el bolsillo sin ser molestos.
const VIBRATION_PATTERN = [700, 300, 700, 300, 700];

export function setAlarmPreferences(prefs: { sound: boolean; vibration: boolean }): void {
  soundOn = prefs.sound;
  vibrationOn = prefs.vibration;
  if (!soundOn) stopReminderSound();
}

/**
 * Aviso de toma o reclamo: vibra (si está activo, y si el teléfono puede) y
 * suena el sonido escogido o, si no hay, el chime. Con "Sonido" apagado, la
 * alarma solo se ve (y vibra).
 */
export function playReminderSound(): void {
  if (vibrationOn) navigator.vibrate?.(VIBRATION_PATTERN);
  if (!soundOn) return;
  if (!playCustom(CUSTOM_MAX_MS)) playChime();
}

/** Chime de A Tiempo: dos notas cortas, suficientes para llamar la atención. */
function playChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  CHIME_NOTES.forEach((frequency, index) => {
    const startAt = ctx.currentTime + index * NOTE_GAP;
    const endAt = startAt + NOTE_DURATION;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    // Envolvente suave para que no suene como un "clic" seco.
    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(PEAK_GAIN, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(startAt);
    oscillator.stop(endAt);
  });
}
