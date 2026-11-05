# Gotchas — Gemini / escaneo

**Desde el 2026-11-04 Gemini se llama desde la Edge Function `analizar-medicamento` de Supabase** (ADR 0002, actualización): el modelo, el prompt y el schema viven en `supabase/functions/analizar-medicamento/index.ts`, y la clave en el secreto `GEMINI_API_KEY` de Supabase (Edge Functions → Secrets). Un cambio en la función **no se publica con el PR**: hay que pegar el archivo en el panel (Edge Functions → analizar-medicamento → Code → Deploy). Los errores de Gemini se ven en los logs de la función.

## Los nombres de modelo caducan sin aviso
`gemini-2.5-flash` empezó a devolver **404 "no longer available to new users"**. El análisis fallaba **en silencio**: el `catch` de `App.handleTakePhoto` dejaba el formulario vacío y parecía "la foto no se entendió". Corregido en `ed3ecbb` usando **`gemini-flash-latest`**.

**Si el escaneo deja el formulario vacío:** abre la consola del navegador antes de culpar al prompt o a la foto. El error de red aparece ahí.
Para verificar un modelo contra la API real:
```bash
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" | grep -o '"name": "[^"]*"'
```

## Si el análisis falla, el formulario avisa
`App.handleTakePhoto` deja `scanFailed` en true y `PlanFormScreen` muestra "No pudimos leer la foto. Llena el plan a mano o inténtalo otra vez." con "Intentar de nuevo" (vuelve al escáner). El detalle del error queda en la consola.

## La clave ya no va en la app
`GEMINI_API_KEY` de `.env.local` y el `define` de `vite.config.ts` ya no los usa ningún archivo de `src/` (no quedan en el build). La clave que vale es el secreto de Supabase; si se cambia ahí, no hay que reiniciar nada.

## La función revisa la sesión ella misma
Con las claves publicables nuevas, "Verify JWT" del panel no bastó: una llamada sin sesión llegó a Gemini. Por eso `index.ts` valida el token en `/auth/v1/user` y responde 401. Prueba rápida sin sesión: `curl -s -X POST "$URL/functions/v1/analizar-medicamento" -H "apikey: $KEY" -H "Content-Type: application/json" -d '{"image":"x"}'` → debe dar 401.

## El schema es un contrato
`RESPONSE_SCHEMA` (ahora en la Edge Function) debe seguir a `MedicationPlan` de `src/types.ts`. `startDate`/`endDate` **no** los pide la IA: se calculan en el servicio (hoy y hoy+30 días, con la fecha local).

## Lo que no se lee queda vacío (desde 2026-11-03)
El `PROMPT` pide no inventar: lo que no aparece en la foto vuelve `""` (o `0` en la frecuencia) y el servicio no lo rellena (antes ponía "Medicamento", "1 pastilla", "08:00", cada 24 h). `PlanFormScreen` solo usa sus valores por defecto (1 pastilla, 8:00 a. m., cada 8 horas) al llenar a mano (`initialData` nulo); con un plan escaneado deja los campos vacíos y la validación los pide antes de guardar. Una hora que no sea `HH:MM` también se descarta.

## `LoadingScreen` tiene un tope de 30 s
`MAX_WAIT_MS` abre el formulario aunque Gemini no haya respondido, con el aviso de arriba; si la respuesta llega después se ignora (`scanIdRef`), para no mezclarla con lo que la persona ya esté escribiendo. Un análisis normal tarda unos 8 a 9 s. La foto se achica a 1280 px por el lado largo antes de enviarla (`MAX_PHOTO_PX` en `CameraScanScreen`): unos 66 KB en la prueba.
