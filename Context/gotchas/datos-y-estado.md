# Gotchas — datos y estado

## Todo persiste en el navegador (desde 2026-10-14)
`alarm-sound` (nombre del sonido elegido), `alarm-sound-enabled` y `alarm-vibration-enabled` (interruptores), `profile`, `plans`, `taken-doses` (tomas marcadas) y `claim-alerts` usan `usePersistentState` (ADR 0007): se guardan en `localStorage` con el prefijo `a-tiempo:v2:` (también `reminders-enabled`). Una instalación nueva arranca **sin perfil ni planes** (no hay datos de ejemplo). Consecuencias al probar:
- **Para volver a empezar**: Perfil → "Borrar todo y empezar de nuevo" (también en el celular). Borra además los restos con prefijo `a-tiempo:` que no usa ningún estado (datos v1, la vieja lista `doses`): `clearLeftoverStoredData`. Si agregas una clave guardada, súmala a `CURRENT_KEYS` en `usePersistentState.ts` o "Borrar todo y empezar de nuevo" la borrará al instante.
- Si cambias la forma de un dato guardado, sube el prefijo a `v2` o migra; si no, los datos viejos pueden romper la vista.

## Fechas de reclamo: siempre texto YYYY-MM-DD local
`src/lib/claims.ts` compara fechas como texto `YYYY-MM-DD` y usa `toIsoDate(new Date())`. No uses `new Date('2026-10-14')` (se interpreta en UTC y en Colombia da el día anterior) ni `toISOString().split('T')[0]` para "hoy" (de noche ya es mañana en UTC). Desde 2026-11-03 tampoco `PlanFormScreen`, `geminiService` ni `mockData`: todos usan `toIsoDate`. Ahora importa más, porque Desde/Hasta deciden qué días hay tomas: con la fecha UTC, un plan creado después de las 7 p. m. empezaba mañana y sus tomas de esa noche no salían.

## Editar un plan no debe borrar su reclamo
`PlanFormScreen` arma el plan desde cero al guardar; por eso copia `claim: initialData?.claim`. Cualquier campo nuevo de `MedicationPlan` que no se edite en ese formulario necesita lo mismo.

## Las tomas se calculan, no se guardan (desde 2026-11-03)
`getDosesForDay` (`src/lib/doses.ts`) arma las tomas de hoy desde los planes, con el reloj de `App` (cada minuto). Solo se guarda `taken-doses`: clave `planId@YYYY-MM-DDTHH:MM` → hora en que se marcó; se borran las de más de 31 días. Consecuencias:
- **"Cada N horas" cuenta desde Desde + hora inicial**, no desde las 00:00: cada 8 h desde las 08:00 da 08:00 · 16:00 · 00:00; cada 5 o cada 36 h cambian de día en día. "Cada N días" = una toma a la hora inicial cada N días desde Desde.
- **Desde/Hasta filtran** (Hasta incluido), y **no salen tomas de más de 1 h antes de crear el plan** (`createdAt`): crear a las 3 p. m. un plan de las 8 a. m. no deja la de esa mañana como atrasada.
- `pending` = ya llegó su hora y no se marcó; `upcoming` = aún no; se recalcula cada minuto. Al pasar la medianoche, las de ayer sin marcar desaparecen (no hay historial de olvidadas).
- **Editar la hora o la frecuencia** recalcula el horario; una toma ya marcada a la hora vieja queda guardada pero no se ve.
- Horario sin tomas hoy pero con planes ≠ estado vacío: muestra "Hoy no hay tomas" (`hasPlans`).

## Dos formatos de hora conviviendo
`MedicationPlan.initialTime` es 24 h (`"14:00"`); `DoseItem.timeFormatted` es 12 h (`"02:00 PM"`). `parseTime` y `formatDoseTime` (`src/lib/doses.ts`) convierten entre los dos (también aceptan "8:00 PM"). Si tocas horas, respeta ambos formatos o unifícalos de forma explícita.

## Los IDs son `Date.now()`
`plan-${Date.now()}`. Dos guardados en el mismo milisegundo colisionarían. Improbable a mano, pero no uses esto para importaciones masivas.

## Posponer: la toma recuerda los minutos, el reclamo las horas
`useDoseReminders.snooze(minutos)` guarda el "hasta cuándo" **en memoria** (se pierde al recargar). Los avisos de reclamo guardan lo pospuesto y lo resuelto en `claim-alerts` (persistente), con una clave por plan + fecha (+ día en los atrasos, para volver a avisar cada día).

## El sonido de alarma vive en IndexedDB, no en localStorage
Una canción no cabe en `localStorage`: el archivo va en IndexedDB (`src/lib/soundStore.ts`, base `a-tiempo`, clave `alarm`) y solo el nombre en `alarm-sound`. Al abrir, `App` lo carga y se lo pasa a `setCustomAlarmSound`; si el archivo falta, se borra el nombre y vuelve el chime. Con "Sonido" apagado no suena nada (la alarma se ve y, si está activa, vibra con `navigator.vibrate`; `stopReminderSound` también corta la vibración). Suena en bucle hasta 1 min por aviso (o hasta responder la alarma: `stopReminderSound` cuando no hay `dueDose` ni `dueClaim`); si `play()` falla, suena el chime. El navegador exige un toque antes: `unlockAudio` lo reproduce en silencio y lo pausa, y `playId` evita que esa preparación silencie una reproducción real que empezó a la vez (pasó con "Escuchar").

## Supabase: la copia del teléfono manda (desde 2026-11-04, ADR 0010)
- La sesión la guarda supabase-js en `localStorage` con su propia clave (`sb-…-auth-token`), fuera del prefijo `a-tiempo:`: "Borrar todo y empezar de nuevo" no la toca; la cierra `signOut`.
- **Cerrar sesión: primero `signOut`, después vaciar el teléfono.** Al revés, la sincronización vería el teléfono vacío y borraría los planes de la nube.
- Al entrar, si la nube tiene perfil **reemplaza** al teléfono; si no, **sube** lo del teléfono (también datos viejos de antes de la cuenta).
- Cambiar `.env.local` exige **reiniciar el dev server** (Vite lee las variables al arrancar). En producción las variables van en Vercel.
- Probar con la clave publicable si las tablas existen: `curl "$URL/rest/v1/profiles?select=user_id&limit=1" -H "apikey: $KEY"` → `PGRST205` = falta correr el SQL; `[]` = existen (RLS no deja ver nada sin sesión).
- **"Error sending confirmation email" (500)** al pedir el código = el SMTP rechazó el envío. Visto el 2026-11-04: en Supabase el **Username** del SMTP de Gmail decía "A tiempo"; tiene que ser el Gmail completo (el nombre va en *Sender name*). Las plantillas de correo solo se pueden editar con SMTP propio; editar **las dos**: "Confirm sign up" (cuenta nueva) y "Magic link or OTP" (volver a entrar).
- **Al entrar, la carga de la nube tiene un tope de 12 s.** Si falla o tarda y el teléfono **tiene** perfil, se sigue con esa copia; si **no tiene** (otro celular, reinstalación), `useCloudSync` queda en `error` y se ofrece reintentar. Nunca seguir sin datos: la app pediría "Nuevo perfil" y ese perfil pisaría el de la nube.
- Con sesión, `App` muestra `CloudLoadingScreen` para todo estado que no sea `ready` (incluido `signed-out` en el render justo después del código, antes de que el hook pase a `loading`): ahí estaba la pantalla en blanco reportada el 2026-11-04.
