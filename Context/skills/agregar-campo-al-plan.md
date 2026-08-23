# Skill · Agregar un campo a `MedicationPlan`

Toca 5 archivos **en este orden**. Saltarse uno deja el campo a medias sin que TypeScript siempre lo delate.

1. `src/types.ts` — agrega el campo a `MedicationPlan` (opcional con `?` si puede faltar; obligatorio rompe a propósito el resto y te guía).
2. `src/data/mockData.ts` — complétalo en los 4-5 planes de `INITIAL_PLANS` y, si aplica, en los `extractedPlan` de `SCAN_PRESETS`.
3. `src/components/PlanFormScreen.tsx` — `useState` inicializado desde `initialData?.campo`, el input con las clases de formulario ya usadas, validación en `handleSubmit` si es obligatorio, y el campo en el objeto `newPlan`.
4. `src/services/geminiService.ts` — agrégalo a `RESPONSE_SCHEMA` (y a `required` solo si la IA siempre puede deducirlo), menciónalo en el `PROMPT`, y devuélvelo con valor por defecto en el `return`.
5. `src/components/MisPlanesView.tsx` — muéstralo en la tarjeta si aporta al cuidador. No todo campo necesita verse.

**Si además debe afectar las tomas**, revisa `handleSavePlan` en `App.tsx` y `src/types.ts` → `DoseItem`.

Cierra con `npm run lint` y probando el flujo completo: escanear → formulario → guardar → ver tarjeta.
