# Índice de decisiones (ADR)

Una línea por decisión. Lee el archivo completo solo si vas a tocar esa área.

- [0001](0001-estado-en-memoria-sin-backend.md) — 2026-07-28 · Todo el estado vive en `App.tsx` con `useState`; sin backend ni persistencia. **Vigente (con deuda).**
- [0002](0002-gemini-vision-en-cliente.md) — 2026-07-28 · El escaneo llama a Gemini desde el navegador con schema JSON; la key va en el bundle. **Vigente en demo.**
- [0003](0003-camara-real-con-fallback.md) — 2026-07-28 · Cámara real vía `getUserMedia`, con visor simulado + preset de ejemplo si falla. **Vigente.**
- [0004](0004-recordatorios-opt-in-en-cliente.md) — 2026-08-22 · Recordatorios opt-in desde la campana, reloj vigilado en cliente, chime Web Audio. **Vigente.**
- [0005](0005-memoria-persistente-en-archivos.md) — 2026-08-22 · Memoria del agente en archivos (`../AGENTS.md` + carpetas), no en el historial. **Vigente.**
- [0006](0006-alarma-de-prueba-con-metformina.md) — 2026-10-14 · La alarma de prueba muestra Metformina tal cual la referencia; excepción acotada al invariante 5. **Vigente mientras exista el botón "Alarma".**

Formato de un ADR nuevo: `NNNN-titulo-corto.md` con Fecha / Contexto / Decisión / Alternativas / Consecuencias.
