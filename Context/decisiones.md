# Reglas de producto

Encuadre y criterios de éxito: `ficha-4d.md`. Reglas visuales: `design.md`. Por qué técnico: `decisions/`.

- **Un paciente, un cuidador.** Sin multi-usuario, login ni roles. Es "el pastillero de Alberto" en manos de María.
- **La app sugiere, el médico avala.** El criterio clínico no se delega nunca.
- **Modo de trabajo con IA: aumentar.** La IA propone layouts, microcopy y colores; el tono y el alcance los cierra la persona. En una demo se dice qué generó la IA y qué se retuvo.
- **Escanear es el camino feliz; escribir a mano es el respaldo**, y el respaldo está visible en cada paso ("Omitir y llenar a mano" / "Crear a mano").
- **La IA nunca guarda sola**: prellena el formulario, la persona confirma, y un banner avisa de que es una sugerencia.
- **Flujo canónico de creación**: CTA «escanear» → cámara → carga → plan editable → confirmación corta. **Sin dashboards en esa pantalla.** Meta: menos de 30 segundos en móvil.
- **Marcar la toma es un solo gesto.** Botón "Listo" grande, sin confirmaciones dobles.
- **Modo vacío demostrable**: `isEmptyState` se alterna desde el `Header` para enseñar los estados vacíos sin borrar datos.
- **Todo en español**: UI, comentarios, commits y esta memoria.
