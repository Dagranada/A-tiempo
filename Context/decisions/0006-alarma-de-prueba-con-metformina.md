# 0006 · La alarma de prueba muestra Metformina (excepción al invariante 5)

**Fecha:** 2026-10-14 (ampliado hasta 2026-10-22) · **Estado:** Vigente mientras existan los botones temporales de prueba · **Pidió:** la persona a cargo del diseño, explícitamente, tras ver el riesgo explicado.

## Contexto
El botón temporal "Alarma" de la `BottomNav` abre `ReminderAlert` en modo prueba para mostrar el diseño sin esperar a la hora de una toma. Hasta ahora usaba un medicamento ficticio ("Medicamento de prueba") para respetar el invariante 5 (`../AGENTS.md` §2.A): nada en pantalla que no corresponda con la realidad. Se pidió que la prueba muestre exactamente los textos de la referencia de diseño: Metformina, "Control de glucosa en sangre", 1 pastilla · 850 mg, "Tomar con el almuerzo para evitar molestias estomacales".

## Decisión
La alarma de prueba (`TEST_MEDICATION` en `src/components/ReminderAlert.tsx`, y desde 2026-10-22 los avisos de reclamo de prueba con `buildTestClaim` en `src/components/ClaimAlert.tsx`) muestra esos textos tal cual, sin etiqueta de prueba. Sus botones siguen sin marcar tomas ni posponer: solo cierran la pantalla. La excepción cubre **solo** la alarma de prueba (hoy los botones "Alarma 4", "Reclamo" y "Mañana", los dos últimos con avisos de reclamo de prueba; el botón "Alarma" de la versión 1 se quitó el 2026-10-14); las alarmas reales siguen bajo el invariante 5.

## Alternativas descartadas
- Textos de la referencia con nombre ficticio (recomendada; respetaba la regla).
- Metformina con etiqueta "PRUEBA · no tomar".

## Consecuencias
- **Riesgo aceptado:** si alguien toca un botón de prueba ("Alarma 4", "Reclamo" o "Mañana") delante de Alberto, verá una alarma de Metformina que no corresponde a una toma o reclamo real y podría tomarse una pastilla de más o ir a la EPS sin motivo.
- Mitigación: los botones son temporales (pendiente 8 en `../state/current.md`) y deben quitarse antes de cualquier uso real. Al quitarlos, esta excepción caduca.
