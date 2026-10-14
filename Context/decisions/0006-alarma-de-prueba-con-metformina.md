# 0006 · La alarma de prueba muestra Metformina (excepción al invariante 5)

**Fecha:** 2026-10-14 · **Estado:** Vigente mientras exista el botón temporal "Alarma" · **Pidió:** la persona a cargo del diseño, explícitamente, tras ver el riesgo explicado.

## Contexto
El botón temporal "Alarma" de la `BottomNav` abre `ReminderAlert` en modo prueba para mostrar el diseño sin esperar a la hora de una toma. Hasta ahora usaba un medicamento ficticio ("Medicamento de prueba") para respetar el invariante 5 (`../AGENTS.md` §2.A): nada en pantalla que no corresponda con la realidad. Se pidió que la prueba muestre exactamente los textos de la referencia de diseño: Metformina, "Control de glucosa en sangre", 1 pastilla · 850 mg, "Tomar con el almuerzo para evitar molestias estomacales".

## Decisión
La alarma de prueba (`TEST_MEDICATION` en `src/components/ReminderAlert.tsx`) muestra esos textos tal cual, sin etiqueta de prueba. Sus botones siguen sin marcar tomas ni posponer: solo cierran la pantalla. La excepción cubre **solo** la alarma de prueba; las alarmas reales siguen bajo el invariante 5.

## Alternativas descartadas
- Textos de la referencia con nombre ficticio (recomendada; respetaba la regla).
- Metformina con etiqueta "PRUEBA · no tomar".

## Consecuencias
- **Riesgo aceptado:** si alguien toca "Alarma" delante de Alberto, verá una alarma de Metformina que no corresponde a una toma real y podría tomarse una pastilla de más.
- Mitigación: el botón es temporal (pendiente en `../state/current.md`) y debe quitarse antes de cualquier uso real. Al quitarlo, esta excepción caduca.
