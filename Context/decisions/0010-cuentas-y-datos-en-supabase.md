# 0010 · Cuentas y datos en Supabase, con copia en el teléfono

**Fecha:** 2026-11-04 · **Estado:** Vigente · **Reemplaza en parte a:** 0001 (ya hay backend) y 0007 (el teléfono deja de ser el único lugar)

## Contexto
Los datos vivían solo en el navegador de ese teléfono (ADR 0007): cambiar de celular, desinstalar o borrar los datos del sitio perdía los planes y el historial de reclamos. La cuenta con código al correo era una pantalla de prueba. La persona decidió: **una cuenta por persona, la de quien toma los medicamentos (sin cuidador)**, que se crea **al principio**, con **un código al correo, sin contraseña**.

## Decisión
- **Supabase** (proyecto `zjobhztshrycepyceiff`). `src/lib/supabase.ts` con la URL y la **clave publicable** desde `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` (`.env.local` en local, variables de entorno en Vercel). La clave publicable está hecha para ir en la app; no es un secreto (invariante 2 intacto).
- **Cuenta:** `signInWithOtp` + `verifyOtp({ type: 'email' })`, código de 6 números, sin enlace (`detectSessionInUrl: false`): un código funciona igual en web y en la futura app nativa. La sesión la guarda supabase-js en el teléfono.
- **Datos:** cuatro tablas (`supabase/migrations/0001_cuentas_y_datos.sql`): `profiles`, `plans`, `taken_doses`, `user_state` (avisos de reclamo). Perfil y planes van como `jsonb` con la forma de `src/types.ts`, para no mantener el modelo dos veces. **RLS en todas**: cada fila tiene `user_id` y solo `auth.uid()` puede leerla o cambiarla.
- **El teléfono manda** (`src/hooks/useCloudSync.ts`): la app sigue leyendo y escribiendo la copia local (`usePersistentState`), así las alarmas suenan sin internet. Al entrar: si la nube tiene perfil, sus datos reemplazan a los del teléfono; si no, se sube lo del teléfono. Después cada cambio se sube a los 0,8 s; si falla, se reintenta al volver la conexión y cada 30 s. Conflictos: gana el último que sube.
- **Cerrar sesión** borra la copia del teléfono (no la nube); **"Borrar todo"** borra las filas de la cuenta en la nube (necesita internet) y cierra la sesión. El usuario de Auth (el correo) queda; volver a entrar crea un perfil nuevo.
- Quedan solo en el teléfono: el sonido elegido (IndexedDB) y los interruptores de Sonido y Vibración, que son del aparato.

## Alternativas descartadas
- **Tablas con una columna por campo:** más "correcto", pero obliga a mapear y migrar cada cambio de `MedicationPlan`; con jsonb basta con `src/types.ts`.
- **La nube como fuente principal (leer siempre de Supabase):** sin señal no habría planes ni alarmas.
- **Enlace mágico en el correo:** en la app nativa obliga a abrir la app desde el correo (deep links); el código no.
- **Contraseña:** se olvida; justo la barrera que se quiere evitar para un adulto mayor.

## Consecuencias
- Hay que correr el SQL una vez en el proyecto y poner `{{ .Token }}` en las plantillas de correo (si no, llega un enlace en vez del código).
- **Vercel necesita las dos variables** antes de publicar, o la cuenta no funciona en producción (`isSupabaseConfigured` muestra un error en vez de romperse).
- El correo que trae Supabase envía pocos por hora: para gente real hace falta SMTP propio (p. ej. Resend).
- Si en un teléfono con datos viejos sin cuenta entra una cuenta nueva, esos datos se suben a esa cuenta.
- Pendiente: mover Gemini a una Edge Function para sacar su clave del bundle (ADR 0002).
