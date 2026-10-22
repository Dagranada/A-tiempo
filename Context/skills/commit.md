# Skill · Escribir el commit

Solo commitea si la persona lo pidió. Estilo del repo (mira `git log`):

- **Título en español, imperativo, ≤72 caracteres.** Sin prefijos tipo `feat:`/`fix:`.
  - Bien: `Corrige la cámara real: el video nunca quedaba montado`
  - Mal: `fix(camera): mount video`
- **Cuerpo obligatorio** salvo cambios triviales, envuelto a ~72 columnas, respondiendo:
  1. Qué estaba mal o faltaba (el síntoma que veía el cuidador, no el detalle interno).
  2. Qué hace ahora la app.
  3. Por qué así y no de otra forma.
  4. **Alcance / limitación conocida**, si la hay (ej.: "funciona con la app abierta").
- Un commit = un cambio coherente. No mezcles memoria/documentación con cambios de código. Si dos cambios de código comparten archivos y no se separan limpiamente (`git apply --cached` de un hunk sirve a veces), un solo commit que los nombre todos.
- Pie: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (el modelo que hizo el trabajo; si cambia, actualiza esta línea).
- Nunca incluyas `.env.local` ni claves.
