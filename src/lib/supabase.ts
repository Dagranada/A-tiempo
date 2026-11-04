import { createClient } from '@supabase/supabase-js';

// La URL y la clave publicable pueden ir en la app: lo que protege los datos
// son las reglas RLS de supabase/migrations (cada cuenta solo ve lo suyo).
const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** false si falta configurar Supabase (p. ej., las variables en Vercel). */
export const isSupabaseConfigured = Boolean(url && publishableKey);

// Sin configuración se crea igual (con valores vacíos no conecta) para que la
// app pueda mostrar el aviso en vez de romperse al cargar.
export const supabase = createClient(url || 'https://sin-configurar.supabase.co', publishableKey || 'sin-configurar', {
  auth: {
    persistSession: true, // la sesión queda guardada en el teléfono
    autoRefreshToken: true,
    detectSessionInUrl: false, // se entra con código, no con enlace
  },
});

/** Mensaje en español para los errores de la cuenta y de los datos. */
export function describeSupabaseError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const code = (error as { code?: string; status?: number } | null)?.code ?? '';
  const status = (error as { status?: number } | null)?.status;
  console.error('Supabase:', error); // el detalle completo, para diagnosticar
  if (!navigator.onLine || /fetch|network/i.test(message)) {
    return 'No hay conexión. Revisa tu internet e intenta de nuevo.';
  }
  if (status === 429 || /rate limit/i.test(message) || code === 'over_email_send_rate_limit') {
    return 'Ya enviamos varios códigos. Espera unos minutos e intenta de nuevo.';
  }
  if (/sending .*email/i.test(message)) {
    // El servicio de correo (SMTP) rechazó el envío: no es culpa de la persona.
    return 'No pudimos enviar el correo con el código. Intenta de nuevo en un momento.';
  }
  if (code === 'otp_expired' || /expired|invalid/i.test(message)) {
    return 'El código no es correcto o ya venció. Revisa el correo o pide uno nuevo.';
  }
  return 'Algo salió mal. Intenta de nuevo en un momento.';
}
