# Skill · Cerrar sesión y guardar memoria

Ejecutar **antes de terminar** cualquier sesión con cambios reales. Toma 2 minutos y ahorra media sesión la próxima vez.

1. **`../state/current.md`** — mueve lo terminado a "Hecho", añade lo nuevo a "Pendiente", actualiza blockers y la fecha del encabezado. Es el archivo más importante: es lo primero que se lee al arrancar.
2. **¿Hubo una decisión no obvia** (elegir un enfoque sobre otro, aceptar una limitación)? → nuevo ADR en `../decisions/NNNN-titulo.md` (Fecha / Contexto / Decisión / Alternativas / Consecuencias) + una línea en `../decisions/README.md`.
3. **¿Perdiste tiempo con una trampa** (fallo silencioso, comportamiento raro del navegador o de la API)? → entrada en el archivo que corresponda de `../gotchas/`. Escribe el **síntoma** además de la causa: el síntoma es lo que se busca la próxima vez.
4. **¿Repetiste un procedimiento por segunda vez?** → conviértelo en `../skills/<nombre>.md` y añádelo al routing de `../AGENTS.md` §5.
5. **¿Cambió el diseño o una regla de producto?** → `../design.md` o `../decisiones.md`.
6. **`logs/AAAA-MM-DD-tema.md`** — resumen comprimido: qué se hizo, qué se aprendió, qué quedó abierto. Máximo ~20 líneas. **No copies diffs ni código**: apunta a los commits (`git show <hash>`).
7. Si `../AGENTS.md` quedó desactualizado (mapa del código, invariantes nuevas), corrígelo. Mantenlo bajo 300 líneas.
