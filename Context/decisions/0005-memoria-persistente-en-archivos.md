# 0005 · Memoria del agente en archivos, no en el historial

**Fecha:** 2026-08-22 · **Estado:** Vigente

## Contexto
Entre sesiones se perdía: por qué el modelo de Gemini es `gemini-flash-latest`, por qué el `<video>` se monta oculto, qué falta por hacer, y el estándar de diseño. Cada sesión se re-exploraba el repo entero (incluido un HTML de 25 KB y `node_modules`) para reconstruir lo mismo.

## Decisión
Memoria en el repo, toda bajo `Context/`: `AGENTS.md` como índice de control + `design.md`, `decisiones.md`, `decisions/`, `state/`, `skills/`, `gotchas/`, `logs/`. En la raíz del repo solo queda `CLAUDE.md`, un puntero de 3 líneas. El agente carga `AGENTS.md` + `state/current.md` al inicio y el resto bajo demanda.

## Consecuencias
- Arranque de sesión barato y determinista; la memoria viaja en git y es revisable en PRs.
- Exige disciplina: si no se actualiza `state/` y `logs/` al cerrar, la memoria envejece y engaña.
- `design.md` se movió a `Context/design.md` (no estaba referenciado por el código).
