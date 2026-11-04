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
`RESPONSE_SCHEMA` en `geminiService.ts` debe seguir a `MedicationPlan` de `src/types.ts`. `startDate`/`endDate` **no** los pide la IA: se calculan en el servicio (hoy y hoy+30 días, con la fecha local).

## Lo que no se lee queda vacío (desde 2026-11-03)
El `PROMPT` pide no inventar: lo que no aparece en la foto vuelve `""` (o `0` en la frecuencia) y el servicio no lo rellena (antes ponía "Medicamento", "1 pastilla", "08:00", cada 24 h). `PlanFormScreen` solo usa sus valores por defecto (1 pastilla, 8:00 a. m., cada 8 horas) al llenar a mano (`initialData` nulo); con un plan escaneado deja los campos vacíos y la validación los pide antes de guardar. Una hora que no sea `HH:MM` también se descarta.

## `LoadingScreen` tiene un tope de 15 s
`MAX_WAIT_MS` avanza al formulario aunque Gemini no haya respondido. Si la respuesta llega después, `pendingScannedPlan` cambia pero el formulario ya tomó sus valores iniciales: los datos se pierden. Es un caso raro pero real.
