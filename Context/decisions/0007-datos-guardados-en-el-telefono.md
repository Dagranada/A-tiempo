# 0007 · Los datos se guardan en el teléfono (localStorage)

**Fecha:** 2026-10-14 · **Estado:** Vigente · **Reemplaza en parte a:** 0001

## Contexto
ADR 0001 dejaba todo en memoria: recargar borraba lo creado. Con los reclamos en la EPS eso dejó de ser aceptable: el historial de reclamos y "su día" de cada mes son justamente lo que evita perder una entrega.

## Decisión
`src/hooks/usePersistentState.ts`: igual que `useState`, pero lee y escribe en `localStorage` con el prefijo `a-tiempo:v1:`. Se guardan `profile`, `plans` (incluye `claim`), `doses` y `claim-alerts` (avisos de reclamo resueltos o pospuestos). El estado sigue viviendo en `App.tsx` (regla 8). Si no se puede leer o escribir (modo privado, espacio lleno, JSON dañado), la app arranca desde los datos de ejemplo y sigue en memoria.

## Alternativas descartadas
- Backend propio: necesario a futuro (también para notificaciones con el teléfono bloqueado y para la API key), pero desproporcionado para este paso.
- IndexedDB: más capacidad, pero más complejo; los datos caben de sobra en `localStorage`.

## Consecuencias
- Recargar ya no borra nada. Para volver a los datos de ejemplo hay que borrar las claves `a-tiempo:v1:*` (consola o datos del sitio).
- Los datos viven **solo en ese navegador de ese teléfono**: no se comparten entre María y Alberto ni sobreviven a borrar los datos del sitio.
- Si cambia la forma de los datos, subir el prefijo a `v2` (los viejos se ignoran) o migrarlos.
- No se persisten: si los recordatorios están activos (`remindersEnabled`), el "posponer" de las tomas, ni la navegación.
