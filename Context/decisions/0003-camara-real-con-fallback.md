# 0003 · Cámara real con degradación elegante

**Fecha:** 2026-07-28 · **Estado:** Vigente

## Contexto
`getUserMedia` falla en muchos escenarios reales: sin HTTPS, permiso denegado, iframe sin permisos, navegador sin soporte.

## Decisión
`CameraScanScreen` intenta `getUserMedia({ facingMode: 'environment' })`. El `<video>` está **montado desde el primer render** (oculto con `hidden` hasta que hay stream). Al tomar la foto se dibuja el frame en un `<canvas>` y se envía el base64 JPEG (calidad 0.85, sin prefijo `data:`).

Si no hay cámara: se muestra un visor simulado + el motivo exacto del error en pantalla, y `onTakePhoto(null)` hace que la app use `SCAN_PRESETS[0]` como ejemplo, para que la demo nunca quede sin salida.

## Consecuencias
- El flujo de escaneo siempre llega al formulario, con datos reales o de ejemplo.
- El montaje incondicional del `<video>` es obligatorio, no cosmético: ver `../gotchas/navegador.md`.
- `metadata.json` declara `requestFramePermissions: ["camera"]` para AI Studio.
