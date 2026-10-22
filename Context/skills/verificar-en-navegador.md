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
   - **Alarmas:** los botones temporales del menú abren la alarma de toma ("Alarma 4") y los avisos de reclamo de hoy ("Reclamo") y de la víspera ("Mañana") sin esperar la hora.
   - **Pastas / avisos que dependen de la hora** (recuadro desde las 12 m, avisos de 8 a. m.): adelanta el reloj **de la página** sin tocar el código (ver `../gotchas/navegador.md`) y recarga después para volver a la hora real.
5. **Responsive**: prueba a **386 px y 320 px** (`resize_window`) además de desktop. No basta mirar: mide con `javascript_tool` que nada se desborde (`el.scrollWidth > el.clientWidth`) y que los textos que deben ir en una línea no midan dos, **con el caso más largo** (p. ej. "30 de septiembre", "Recordar en 12 horas", "Hidroclorotiazida"), cambiando el texto un momento en el DOM y restaurándolo. Vuelve a `preset: desktop` al terminar.
6. **Animaciones**: mide los fps con `requestAnimationFrame` durante unos segundos (objetivo ~60, sin cuadros de más de 34 ms).
7. Cierra con una captura del estado final para la persona.

Si la consola del panel muestra un error, confírmalo en una pestaña nueva: el panel conserva mensajes de recargas anteriores.
