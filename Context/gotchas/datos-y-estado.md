# Gotchas — datos y estado

## Todo persiste en el navegador (desde 2026-10-14)
`profile`, `plans`, `doses` y `claim-alerts` usan `usePersistentState` (ADR 0007): se guardan en `localStorage` con el prefijo `a-tiempo:v1:`. Consecuencias al probar:
- **Cambiar `mockData.ts` no cambia lo que ves**: el navegador ya tiene datos guardados. Para volver a los de ejemplo, en la consola: `Object.keys(localStorage).filter(k => k.startsWith('a-tiempo:')).forEach(k => localStorage.removeItem(k))` y recarga.
- Si cambias la forma de un dato guardado, sube el prefijo a `v2` o migra; si no, los datos viejos pueden romper la vista.
- Las fechas de reclamo de ejemplo se calculan **desde el día en que se cargaron por primera vez**; días después ya no muestran "mañana".

## Fechas de reclamo: siempre texto YYYY-MM-DD local
`src/lib/claims.ts` compara fechas como texto `YYYY-MM-DD` y usa `toIsoDate(new Date())`. No uses `new Date('2026-10-14')` (se interpreta en UTC y en Colombia da el día anterior) ni `toISOString().split('T')[0]` para "hoy" (de noche ya es mañana en UTC). `PlanFormScreen` todavía usa `toISOString` para las fechas por defecto: mismo riesgo.

## Editar un plan no debe borrar su reclamo
`PlanFormScreen` arma el plan desde cero al guardar; por eso copia `claim: initialData?.claim`. Cualquier campo nuevo de `MedicationPlan` que no se edite en ese formulario necesita lo mismo.

## Un plan genera exactamente una toma diaria
`handleSavePlan` (`src/App.tsx:130-180`) crea **un** `DoseItem` por plan, con la hora inicial. `frequencyValue` y `frequencyUnit` se guardan y se muestran, pero **no generan tomas adicionales**. "Cada 8 horas" hoy avisa una vez al día.

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

## `handleResetData` existe y nadie lo llama
Definido en `App.tsx`, sin ningún botón conectado. Es el gancho natural para un "restablecer datos de demo" en `PerfilView`.
