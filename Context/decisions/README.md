# Índice de decisiones (ADR)

Una línea por decisión. Lee el archivo completo solo si vas a tocar esa área.

- [0001](0001-estado-en-memoria-sin-backend.md) — 2026-07-28 · Todo el estado vive en `App.tsx`; sin backend. **Vigente salvo la persistencia (ver 0007).**
- [0002](0002-gemini-vision-en-cliente.md) — 2026-07-28 · El escaneo llama a Gemini desde el navegador con schema JSON; la key va en el bundle. **Vigente en demo.**
- [0003](0003-camara-real-con-fallback.md) — 2026-07-28 · Cámara real vía `getUserMedia`, con visor simulado + preset de ejemplo si falla. **Vigente.**
- [0004](0004-recordatorios-opt-in-en-cliente.md) — 2026-08-22 · Recordatorios opt-in desde la campana, reloj vigilado en cliente, chime Web Audio. **Vigente.**
- [0005](0005-memoria-persistente-en-archivos.md) — 2026-08-22 · Memoria del agente en archivos (`../AGENTS.md` + carpetas), no en el historial. **Vigente.**
- [0006](0006-alarma-de-prueba-con-metformina.md) — 2026-10-14 · Las alarmas de prueba muestran Metformina tal cual la referencia; excepción acotada al invariante 5. **Vigente mientras existan los botones "Alarma 4", "Reclamo" y "Mañana".**
- [0007](0007-datos-guardados-en-el-telefono.md) — 2026-10-14 · Perfil, planes, tomas y avisos de reclamo se guardan en `localStorage`. Reemplaza en parte a 0001. **Vigente.**
- [0008](0008-reclamos-mensuales-en-la-eps.md) — 2026-10-14 · Reglas de los reclamos mensuales en la EPS (pestaña Pastas) y sus avisos. **Vigente.**
- [0009](0009-alarma-real-version-4.md) — 2026-10-22 · La alarma real (toma y reclamo) es la versión 4; posponer de 5 en 5 minutos; escala de texto común. **Vigente.**

Formato de un ADR nuevo: `NNNN-titulo-corto.md` con Fecha / Contexto / Decisión / Alternativas / Consecuencias.
