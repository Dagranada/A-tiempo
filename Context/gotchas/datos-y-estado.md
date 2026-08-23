# Gotchas — datos y estado

## Nada persiste
`plans`, `doses` y `profile` son `useState` inicializados desde `mockData.ts`. **Un refresh borra todo lo que el cuidador creó.** Al probar en el navegador, no confundas "se perdió mi plan" con un bug: es el diseño actual (ADR 0001).

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
