# Gotchas — datos y estado

## Todo persiste en el navegador (desde 2026-10-14)
`profile`, `plans`, `doses` y `claim-alerts` usan `usePersistentState` (ADR 0007): se guardan en `localStorage` con el prefijo `a-tiempo:v1:`. Consecuencias al probar:
- **Cambiar `mockData.ts` no cambia lo que ves**: el navegador ya tiene datos guardados. Para volver a los de ejemplo: **Perfil → "Restablecer datos de ejemplo"** (también en el celular), o en la consola: `Object.keys(localStorage).filter(k => k.startsWith('a-tiempo:')).forEach(k => localStorage.removeItem(k))` y recarga.
- Si cambias la forma de un dato guardado, sube el prefijo a `v2` o migra; si no, los datos viejos pueden romper la vista.
- Las fechas de reclamo de ejemplo (`demoDate`, `LATE_DAYS` en `mockData.ts`) se calculan **desde el día en que se cargaron por primera vez**: Metformina "faltan 3 días", Losartán "mañana" con un mes perdido, Atorvastatina atrasada. Días después ya no muestran eso; "Restablecer datos de ejemplo" las recalcula.
- Las alarmas de prueba (`TEST_MEDICATION`, `buildTestClaim`) **no tocan los datos**: sus botones solo cierran.

## Fechas de reclamo: siempre texto YYYY-MM-DD local
`src/lib/claims.ts` compara fechas como texto `YYYY-MM-DD` y usa `toIsoDate(new Date())`. No uses `new Date('2026-10-14')` (se interpreta en UTC y en Colombia da el día anterior) ni `toISOString().split('T')[0]` para "hoy" (de noche ya es mañana en UTC). `PlanFormScreen` todavía usa `toISOString` para las fechas por defecto: mismo riesgo.

## Editar un plan no debe borrar su reclamo
`PlanFormScreen` arma el plan desde cero al guardar; por eso copia `claim: initialData?.claim`. Cualquier campo nuevo de `MedicationPlan` que no se edite en ese formulario necesita lo mismo.

## Un plan genera exactamente una toma diaria
`handleSavePlan` (`src/App.tsx:152`) crea **un** `DoseItem` por plan, con la hora inicial. `frequencyValue` y `frequencyUnit` se guardan y se muestran, pero **no generan tomas adicionales**. "Cada 8 horas" hoy avisa una vez al día.

## `upcoming` nunca se convierte en `pending`
Nada en la app cambia el `status` con el paso del tiempo. Por eso `useDoseReminders` filtra por `status !== 'taken'` en lugar de por `'pending'`: ambos significan "todavía no se tomó". Si agregas lógica de estados, revisa ese filtro (`findOverdueDoses`).

## Las tomas no tienen fecha, solo hora
`DoseItem` guarda `timeHour`/`timeMinute`, no un día. Las comparaciones son "minutos del día" y todo se resetea conceptualmente cada medianoche… salvo que nada lo resetea: una toma marcada hoy sigue marcada mañana.

## `startDate` / `endDate` son decorativos
Se capturan, se validan y se muestran en la tarjeta del plan, pero ningún cálculo los usa para incluir o excluir tomas.

## Dos formatos de hora conviviendo
`MedicationPlan.initialTime` es 24 h (`"14:00"`); `DoseItem.timeFormatted` es 12 h (`"02:00 PM"`). La conversión está inline en `handleSavePlan`. Si tocas horas, respeta ambos formatos o unifícalos de forma explícita.

## Los IDs son `Date.now()`
`plan-${Date.now()}` / `dose-${Date.now()}`. Dos guardados en el mismo milisegundo colisionarían. Improbable a mano, pero no uses esto para importaciones masivas.

## "Restablecer datos de ejemplo" no toca el perfil
`handleResetData` (Perfil, con confirmación) vuelve `plans`, `doses` y `claim-alerts` a los de ejemplo, pero **deja el `profile`** como está. Si cambias `INITIAL_SENIOR_PROFILE`, en un navegador con datos guardados no se verá hasta borrar la clave `a-tiempo:v1:profile`.

## Posponer: la toma recuerda los minutos, el reclamo las horas
`useDoseReminders.snooze(minutos)` guarda el "hasta cuándo" **en memoria** (se pierde al recargar). Los avisos de reclamo guardan lo pospuesto y lo resuelto en `claim-alerts` (persistente), con una clave por plan + fecha (+ día en los atrasos, para volver a avisar cada día).
