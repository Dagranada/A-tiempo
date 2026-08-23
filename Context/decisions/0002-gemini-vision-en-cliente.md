# 0002 · Análisis de imagen con Gemini desde el cliente

**Fecha:** 2026-07-28 (modelo corregido 2026-07-29) · **Estado:** Vigente en demo

## Contexto
El cuidador debe poder fotografiar una caja o receta y obtener el plan prellenado, sin escribir nada.

## Decisión
`src/services/geminiService.ts` llama a `@google/genai` **desde el navegador** con:
- modelo `gemini-flash-latest`,
- `responseMimeType: 'application/json'` + `responseSchema` tipado (nombre, dosis, hora inicial, frecuencia, unidad, instrucciones),
- prompt en español que obliga a valores por defecto razonables cuando el dato no aparece en la foto.
La key entra por `vite.config.ts` → `define: process.env.GEMINI_API_KEY`.

## Consecuencias
- **La API key queda expuesta en el bundle del navegador.** Aceptable para demo/AI Studio; para producción hay que mover la llamada a un endpoint propio (`express` ya está en `package.json`, sin usar).
- Si la llamada falla, `App.handleTakePhoto` cae a formulario vacío en lugar de romper.
- El schema fija el contrato: cambiar `MedicationPlan` obliga a actualizar `RESPONSE_SCHEMA`. Ver `../skills/agregar-campo-al-plan.md`.
- Los nombres de modelo caducan. Ver `../gotchas/gemini.md`.
