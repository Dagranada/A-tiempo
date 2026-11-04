# Gotchas — datos y estado

## Todo persiste en el navegador (desde 2026-10-14)
`account` (solo el correo, provisional), `profile`, `plans`, `taken-doses` (tomas marcadas) y `claim-alerts` usan `usePersistentState` (ADR 0007): se guardan en `localStorage` con el prefijo `a-tiempo:v2:` (también `reminders-enabled`). Una instalación nueva arranca **sin perfil ni planes** (no hay datos de ejemplo). Consecuencias al probar:
- **Para volver a empezar**: Perfil → "Borrar todo y empezar de nuevo" (también en el celular). Borra además los restos con prefijo `a-tiempo:` que no usa ningún estado (datos v1, la vieja lista `doses`): `clearLeftoverStoredData`. Si agregas una clave guardada, súmala a `CURRENT_KEYS` en `usePersistentState.ts` o "Borrar todo" la borrará al instante.
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
