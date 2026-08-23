# Skill · Cuando una petición choca con una regla dura

Se activa **sola**, sin que nadie la invoque: si lo que te piden contradice `AGENTS.md` §2, aplícala antes de editar.

## 1. Identifica el nivel
¿Invariante (§2.A) o convención (§2.B)? Si dudas, trátala como invariante.

## 2. Si es invariante — para y pregunta
- **No edites código todavía.** Ni "para mostrar cómo quedaría".
- Nombra la regla textualmente y di qué riesgo concreto corre el paciente o el proyecto.
- Ofrece la alternativa más cercana que sí la respeta.
- Si la persona la reafirma: **primero** un ADR en `decisions/` (fecha, quién lo pidió, por qué, qué se pierde) que derogue o acote la regla, **después** el código, y actualiza §2.A.
- Una confirmación vale para **ese** cambio, no para los siguientes.

## 3. Si es convención — ejecuta, pero cierra el círculo en el mismo turno
1. Haz el trabajo.
2. **Actualiza la regla en `AGENTS.md` §2.B** en ese mismo turno: reescríbela, o añádele la excepción con fecha y alcance.
3. Anótalo en `logs/` y, si cambia el producto, en `decisiones.md`.
4. Recién entonces reporta.

**Prohibido dejarlo "pendiente de decisión".** Si no sabes cómo debe quedar la regla, escribe la excepción acotada al cambio que hiciste ("desde <fecha>, X está en inglés; el resto sigue en español") y pregunta después. Una regla que contradice al código envenena todas las sesiones siguientes.

## 4. Señal de alarma
Si terminas un turno diciendo "ojo, esto contradice la regla N" y la regla N sigue igual → **fallaste esta skill**. Vuelve y ciérrala.
