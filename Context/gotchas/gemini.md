# Gotchas — Gemini / escaneo

## Los nombres de modelo caducan sin aviso
`gemini-2.5-flash` empezó a devolver **404 "no longer available to new users"**. El análisis fallaba **en silencio**: el `catch` de `App.handleTakePhoto` dejaba el formulario vacío y parecía "la foto no se entendió". Corregido en `ed3ecbb` usando **`gemini-flash-latest`**.

**Si el escaneo deja el formulario vacío:** abre la consola del navegador antes de culpar al prompt o a la foto. El error de red aparece ahí.
Para verificar un modelo contra la API real:
```bash
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" | grep -o '"name": "[^"]*"'
```

## El error nunca llega a la UI
`analyzeMedicationImage` lanza, `App.tsx` hace `console.error` y sigue con el formulario vacío. **No hay mensaje en pantalla.** Si agregas manejo visible de errores, hazlo ahí y no dentro del servicio.

## Sin `GEMINI_API_KEY` no falla al arrancar, falla al escanear
La key se lee en tiempo de build (`vite.config.ts` → `define`). Si cambias `.env.local`, **hay que reiniciar el dev server**; recargar la página no basta.

## El schema es un contrato
`RESPONSE_SCHEMA` en `geminiService.ts` debe seguir a `MedicationPlan` de `src/types.ts`. `startDate`/`endDate` **no** los pide la IA: se calculan en el servicio (hoy y hoy+30 días).

## `LoadingScreen` tiene un tope de 15 s
`MAX_WAIT_MS` avanza al formulario aunque Gemini no haya respondido. Si la respuesta llega después, `pendingScannedPlan` cambia pero el formulario ya tomó sus valores iniciales: los datos se pierden. Es un caso raro pero real.
