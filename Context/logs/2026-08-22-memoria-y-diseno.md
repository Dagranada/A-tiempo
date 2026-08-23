# 2026-08-22 · Memoria persistente, design system y Ficha 4D

**Hecho.** Se creó la memoria del agente bajo `Context/` (ver `../AGENTS.md` §8) sin tocar `src/`. Se eliminó el `README.md` genérico de AI Studio. Se completó `design.md` a partir del código: faltaban `ReminderAlert`, `BottomNav`, los tres estados de una toma, formularios, overlays, estados vacíos, movimiento y accesibilidad. Se incorporó la Ficha 4D del curso (`../ficha-4d.md`) y se cablearon sus criterios como regla dura #3 y puntos 7-10 del DoD. Se cambió la **definición de éxito**: de retención ("vuelve al día siguiente") a **adherencia** ("se toma todas las pastillas según lo planeado, sin confusiones"). Cierre: pasada de simplificación sobre `Context/` (−24% de palabras; −31% en lo que se carga siempre) aplicando *un hecho, un hogar*.

**Aprendido.**
- Los fallos de esta app son **silenciosos**: cámara que cae al visor simulado, Gemini que deja el formulario vacío, audio bloqueado. Ante un "no pasa nada", mira la consola antes que el código.
- El cambio de definición de éxito reordenó el backlog: lo urgente ya no es la persistencia sino **generar las tomas desde la frecuencia** — hoy un plan "cada 8 horas" avisa una sola vez al día.
- Documentar el design system reveló deuda invisible: un color huérfano, `motion` sin usar y una fecha inventada en el `Header`.

**Abierto.** Los 8 pendientes de `../state/current.md`. Decisión tuya sobre `#69E1BC` (`../design.md` §11).

**Prueba de reglas duras (fin de sesión).** La persona pidió traducir la home al inglés para comprobar si el agente rompía una regla dura. Se ejecutó tras avisar dos veces, pero se dejó `AGENTS.md` diciendo "todo en español" mientras el código ya estaba en inglés — memoria contradiciendo al código, el fallo que este sistema debe evitar. Arreglo: `AGENTS.md` §2 se partió en **2.A invariantes** (no se tocan sin ADR; incluye el aviso médico, los secretos y la accesibilidad mínima) y **2.B convenciones** (se pueden cambiar al vuelo, pero la regla se actualiza en el mismo turno). Nueva skill `../skills/conflicto-con-una-regla.md`, de aplicación automática. La excepción de idioma quedó escrita y acotada en la regla 6.
La traducción se revirtió el mismo día a petición de la persona (`src/` quedó idéntico a `caaaf27`, verificado con `git diff`) y la regla 6 volvió a "sin excepciones vigentes".
