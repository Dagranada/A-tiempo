# Skill · Verificar un cambio en el navegador

Nunca pidas a la persona que compruebe a mano; compruébalo tú y muestra la evidencia.

1. `npm run lint` primero (es `tsc --noEmit`). Un error de tipos no se ve en pantalla.
2. Abre el preview con el config **`a-tiempo-dev`** de `.claude/launch.json` (`preview_start` con `{name}`). **Nunca lances el dev server por Bash.**
3. Revisa consola y logs del server antes de mirar píxeles: muchos fallos de esta app son silenciosos (Gemini, cámara, audio).
4. Recorre el flujo tocado:
   - **Horario:** marcar "Listo" mueve la toma a tomada con la hora real.
   - **Planes:** crear, editar y eliminar; verifica que la toma asociada se actualice/borre.
   - **Escanear:** en `localhost` la cámara real debe abrir. Sin cámara, debe verse el visor simulado con el motivo del error.
   - **Recordatorios:** difícil de esperar en vivo. Para forzarlo, pon una toma con hora ya pasada (editando un plan a una hora anterior a la actual) y activa la campana. Recuerda que el chime necesita el gesto de la campana.
5. Comprueba el ancho en móvil y desktop (`resize_window`): el envelope debe seguir centrado y la `BottomNav` alineada.
6. Cierra con una captura del estado final para la persona.

**Recuerda:** un refresh borra los datos creados (por diseño). No lo reportes como bug.
