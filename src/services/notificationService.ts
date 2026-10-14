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

/** Notificación del sistema de prueba: no menciona ningún medicamento real. */
export function showTestNotification(): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  new Notification(NOTIFICATION_TITLE, {
    body: 'Alarma de prueba: así llegará el aviso a la hora de cada toma.',
    tag: 'alarma-de-prueba',
    silent: false,
  });
}

/** Sonido de aviso: dos notas cortas, suficientes para llamar la atención. */
export function playReminderSound(): void {
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
