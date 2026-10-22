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
- **Reclamos en la EPS, en su propia pestaña ("Pastas").** Medicamentos que se reclaman cada mes mientras dura la orden médica; si un mes se olvida, se pierde. Las reglas de fechas son del ADR 0008 y las fechas siempre las pone la persona.
- **Avisar sin hora exacta, pero a tiempo.** Los reclamos avisan a las 12 m del día anterior y a las 8 a. m. del día (y cada día de atraso); el día anterior, además, un recuadro en el Horario con el mismo texto de la notificación.
- **Una sola alarma, dos usos.** Toma y reclamo usan la misma pantalla (versión 4, ADR 0009) con la misma escala de texto; posponer se elige: de 5 en 5 minutos en la toma, de 1 en 1 hora en el reclamo.
- **Los datos son del teléfono.** Se guardan en el navegador (ADR 0007), sin cuentas; "Restablecer datos de ejemplo" en Perfil vuelve a la demo.
- **Lo destructivo se confirma** (eliminar un plan, restablecer datos), con el nombre de lo que se pierde. Marcar una toma no se confirma: es un solo gesto.
- **Encabezados sin nombre propio.** Las bajadas de las pestañas son genéricas ("Planes de medicación activos", "Medicamentos para reclamar en la EPS"); los estados vacíos sí nombran a Alberto.
- **Nunca prometer lo que la app no hace**: ni vibración, ni avisos con la app cerrada, ni un tiempo de posponer distinto al real.
- **Pruebas visibles solo mientras se diseña.** Los botones de prueba del menú ("Alarma 4", "Reclamo", "Mañana") son temporales y salen antes de cualquier uso real (ADR 0006).
- **Todo en español**: UI, comentarios, commits y esta memoria.
