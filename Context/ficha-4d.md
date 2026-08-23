# Ficha 4D — A Tiempo

Documento fuente del curso (Interface School, Wave Europa II, sesión 3). Entregado el 28 de julio de 2026.
Feature evaluada: **Agregar nuevo plan de medicinas**. Checkpoint C1 aprobado en los 5 criterios.

Define el **encuadre del producto**: qué se delega a la IA, qué no, y cómo se mide el éxito.
Lo operativo está reflejado en `AGENTS.md` (§2 reglas duras, §7 DoD) y en `decisiones.md`.

---

## D1 · Dirección
- **I Do:** Defino el flujo semiautomático, el criterio de éxito y qué datos no pedimos en v1.
- **Mode:** aumentar
- **AI Does:** Propone layouts, microcopy y colores.
- **No delego (y por qué):** el criterio clínico ni el tono final. La app solo **sugiere** un plan a partir de las características del producto; debe ser avalado por un médico.

## D2 · Diseño
- **Proceso:** Brief → 2 variantes IA → evalúa CTA y jerga → fija una → documenta en bitácora.
- **Producto:** CTA «escanear» → acceso a la cámara para tomar foto del producto, con posibilidad de hacerlo manualmente mediante el botón de omitir → carga de datos → propuesta de plan editable y confirmación corta. **Sin dashboards en esta pantalla.**
- **Performance:** crear el plan de dosis del medicamento en móvil **en menos de 30 segundos**.

## D3 · Desarrollo
- **Proceso:** revisar en un celular real; comprobar que los recordatorios llegan en el horario establecido y ajustar si no.
- **Producto:** la persona ahorra tiempo y se despreocupa de recordar todos los horarios de la toma.
- **Performance:** **éxito = Alberto es capaz de tomarse todas las pastillas según lo planeado, sin confusiones.**
  <sub>Actualizado el 2026-08-22. La versión entregada el 28-jul decía "vuelve al día siguiente y registra sus tomas diarias"; se cambió de retención a adherencia, que es lo que el producto realmente persigue.</sub>

## D4 · Delivery
- **Creación:** yo cierro el copy y el alcance; la IA acelera la exploración de UI.
- **Transparencia:** en la demo se dirá qué generó la IA (layouts) y qué se retuvo (tono, DoD, datos fuera de alcance).
- **Verificación de deploy:** deploy a URL pública, registro en móvil propio, checklist QA S7 antes de mostrar.

---

## Dónde falla hoy el código contra esta ficha

El éxito se mide en **adherencia** y **ausencia de confusión**. Los cuatro huecos —tomas no generadas por frecuencia, recordatorio solo con la app abierta, datos falsos en pantalla, nada persiste— están descritos con detalle y prioridad en `state/current.md`. Las verificaciones de D3/D4 (30 s, celular real, deploy público) también.
