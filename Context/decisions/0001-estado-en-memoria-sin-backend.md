# 0001 · Estado en memoria, sin backend

**Fecha:** 2026-07-28 · **Estado:** Vigente (con deuda técnica reconocida)

## Contexto
Prototipo nacido en Google AI Studio para validar el flujo del cuidador, no para producción.

## Decisión
Todo el estado de dominio (`plans`, `doses`, `profile`, navegación) vive en `useState` dentro de `src/App.tsx`, inicializado desde `src/data/mockData.ts`. Los componentes son presentacionales: reciben props y callbacks.

## Alternativas descartadas
- Context/Redux: overhead innecesario para ~4 piezas de estado.
- localStorage / backend: fuera de alcance del prototipo.

## Consecuencias
- Recargar la página borra todo lo que el cuidador creó. **Es el bloqueador #1 para uso real.**
- `App.tsx` concentra la lógica (295 líneas). Aceptable mientras no crezca; si pasa de ~400, extraer un hook `usePlans`.
- Migrar a persistencia es barato: reemplazar los `useState` iniciales por lectura de `localStorage` y escribir en cada `set*`. Ver `../state/current.md`.
