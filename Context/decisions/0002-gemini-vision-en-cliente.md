# 0002 · Análisis de imagen con Gemini desde el cliente

**Fecha:** 2026-07-28 (modelo corregido 2026-07-29) · **Estado:** Reemplazado el 2026-11-04: Gemini se llama desde la Edge Function `analizar-medicamento` de Supabase (ver al final)

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

## Actualización 2026-11-04 · Gemini pasa a una Edge Function de Supabase
`src/services/geminiService.ts` ya no llama a Gemini ni lleva clave: hace `supabase.functions.invoke('analizar-medicamento', { body: { image } })`. La función (`supabase/functions/analizar-medicamento/index.ts`, se sube a mano desde el panel de Supabase) guarda el prompt, el schema y el modelo, y lee la clave del secreto `GEMINI_API_KEY` de Supabase. **Revisa ella misma la sesión** (`/auth/v1/user` con el token de la app) y responde 401 sin cuenta: la opción "Verify JWT" del panel no lo garantizaba (una llamada sin sesión llegó a Gemini). Se quitó `@google/genai` de la app y el build ya no contiene ninguna clave de Google. Nota: en producción el escaneo nunca había funcionado, porque Vercel no tenía `GEMINI_API_KEY`.
