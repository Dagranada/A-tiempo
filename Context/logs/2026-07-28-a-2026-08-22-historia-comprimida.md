# Historia del proyecto — 2026-07-28 → 2026-08-22 (comprimido)

Reconstruido desde `git log`. Detalle: `git show <hash>`.

- **`6084cbd` · 2026-07-28 — Inicio.** App React 19 + TS + Vite + Tailwind 4 venida de Google AI Studio. Navegación de 4 pestañas, CRUD de planes, escaneo simulado, sistema de diseño (hoy `../design.md`).
- **`b1eddc5` · 2026-07-28 — Cámara + IA reales.** Se reemplaza el escaneo simulado: frame real del `<video>` → Gemini → plan extraído, con fallback al preset de ejemplo.
- **`d966cb9` · 2026-07-28 — Bug de cámara.** El `<video>` se renderizaba solo tras confirmar el acceso, y confirmar el acceso necesitaba el `<video>`: candado circular, stream válido que nunca se veía, sin error visible. Se monta oculto desde el primer render + se muestra el motivo exacto del fallo. → `../gotchas/navegador.md`
- **`ed3ecbb` · 2026-07-29 — Modelo caducado.** `gemini-2.5-flash` devolvía 404 "no longer available to new users"; el análisis fallaba en silencio y el formulario quedaba vacío. Se pasa a `gemini-flash-latest`, verificado contra la API real. → `../gotchas/gemini.md`
- **`caaaf27` · 2026-08-22 — Recordatorios.** La app nunca comparaba la hora actual con las tomas. Se agrega `useDoseReminders` (chequeo cada 30 s), alerta a pantalla completa, notificación del sistema y chime Web Audio, insistiendo cada 5 min. Opt-in desde la campana (mismo gesto que desbloquea el audio). Alcance: solo con la app abierta. → ADR 0004

**Patrón que se repite:** los fallos de esta app son **silenciosos** (cámara que cae al visor simulado, Gemini que deja el formulario vacío, audio bloqueado). Ante un "no pasa nada", mira la consola antes que el código.
