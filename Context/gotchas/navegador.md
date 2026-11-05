# Gotchas — navegador (cámara, audio, notificaciones, timers)

## El `<video>` debe estar montado desde el primer render
Bug real (`d966cb9`): el `<video>` solo se renderizaba **después** de confirmar el acceso, pero confirmar el acceso requería asignar `srcObject` a un `<video>` que ya existiera. Candado circular: el stream se obtenía bien y nunca se veía, cayendo siempre al visor simulado **sin ningún error visible**.

**Regla:** el `<video>` se monta siempre y se oculta con `hidden` hasta que hay stream. No lo condiciones a `hasCameraAccess`.

## La cámara exige contexto seguro
`getUserMedia` solo existe en HTTPS o `localhost`. El dev server corre con `--host=0.0.0.0`: si entras desde el celular por IP LAN (`http://192.168.x.x:3000`) **no hay cámara**. `CameraScanScreen` ya detecta esto y muestra el motivo exacto en pantalla — léelo antes de depurar a ciegas.

## El audio está bloqueado hasta que hay un gesto del usuario
El `AudioContext` nace `suspended`. Por eso `unlockAudio()` se llama en el **mismo click** de la campana que activa los recordatorios. Si mueves esa activación a un `useEffect` o a un flujo automático, el chime deja de sonar sin lanzar ningún error.

## Notificaciones: pedir permiso también exige gesto, y puede negarse
`requestNotificationPermission()` devuelve `false` en vez de romper. La app **igual** activa los recordatorios: la alerta en pantalla y el sonido son el canal principal; la notificación del sistema es un extra.
El `tag: dose-<planId>` evita que se apilen decenas de avisos: cada recordatorio reemplaza al anterior del mismo medicamento.

## Los timers en segundo plano se estrangulan
Con la pestaña oculta, `setInterval` baja a ~1 ejecución por minuto. El ciclo de chequeo es de 30 s y la insistencia de 5 min precisamente para tolerarlo. **No bajes `REMINDER_INTERVAL_MS` esperando precisión de segundos.**

## Alcance real de los recordatorios
Funcionan **solo con la app abierta**. Con el celular bloqueado o el navegador cerrado no suena nada. Eso exigiría PWA instalada + push con backend (no existe). No prometas esto en la UI.

## El HMR no refresca el estado inicial
Al cambiar un valor inicial de `usePersistentState` o de un `useState` de `App.tsx`, la pantalla puede seguir mostrando el valor viejo: el hot reload no lo vuelve a leer (y lo guardado en el teléfono manda). **Recarga la página** antes de concluir que tu cambio no se aplicó. (Visto el 2026-08-22.)

## Ver un video de referencia (.mov/.mp4) en este entorno
No hay `ffmpeg`, y `swift`/`swiftc` con AVFoundation se cuelgan o fallan por los module maps de las Command Line Tools. Lo que sí funciona (2026-10-14): copiar el video temporalmente a la raíz del repo, abrir `http://localhost:3000/index.html` en una pestaña aparte del preview y, con `javascript_tool`, crear un `<video src="/archivo.mov">`, recorrer `currentTime` y dibujar cada cuadro en un `<canvas>` en cuadrícula con su tiempo; luego una captura. H.264 se decodifica bien. **Borra la copia del video al terminar** (no debe entrar en git).

## Animaciones que se traban o parpadean en el celular
Animar `width`/`height`, `border-width`, `box-shadow` o `filter: blur()` obliga a repintar en cada cuadro; con varias capas grandes a la vez (las 10 ondas de la alarma) el celular se traba al rato, y en escritorio se ve **intermitente** con el tiempo. Regla: anima solo `transform` y `opacity`, con el elemento ya del tamaño final (`will-change: transform, opacity`) y escalando desde `--wave-start`. Pasó con la versión 3 (2026-10-14) y con la 4 (2026-10-22); hoy la alarma real (`.alarm-wave-line`) lo cumple. La versión 2 (`.alarm-wave`, sin botón) todavía anima tamaño.

## Editar `Context/*.md` recarga la app entera
Vite vigila todo el proyecto: guardar un archivo de `Context/` dispara un **page reload**, no un HMR. Se pierde lo que estaba abierto (una alarma de prueba, un formulario, el viewport emulado sigue). Si al volver al navegador "desapareció" algo, es eso; vuelve a abrirlo antes de concluir que es un bug.

## La consola del panel guarda errores viejos
`read_console_messages` en la pestaña del panel devuelve también mensajes de recargas anteriores (p. ej. "Failed to reload … Toast.tsx" de un archivo ya borrado, o un warning de `key` de un estado intermedio). Antes de reportar un error, **ábrelo en una pestaña nueva** (`tabs_create` + `navigate`) y lee su consola; si ahí no está, era viejo. Cierra la pestaña al terminar.

## Probar lo que depende de la hora sin esperar
El recuadro de reclamo aparece desde las 12 m y los avisos de reclamo a las 8 a. m. Para verlos sin esperar, en la página (no en el código) reemplaza `Date` por una clase que sume un desfase (`class extends RealDate { constructor(...a){ a.length ? super(...a) : super(RealDate.now()+offset) } static now(){ return RealDate.now()+offset } }`) y espera al siguiente tic de la app (≤ 60 s, el reloj de `App.tsx`). **Recarga después** para volver a la hora real, y avisa a la persona de que lo que ve está adelantado.

## `npm run lint` no revisaba las props (resuelto 2026-11-04)
Hasta el 2026-11-04 faltaban `@types/react` y `@types/react-dom`: el JSX era `any` y `tsc` no avisaba de props faltantes, sobrantes o con nombre viejo. Ya están en `devDependencies`; si `lint` vuelve a pasar con props mal puestas, revisa que sigan instalados.

## Chrome de Android prohíbe `new Notification()` (pantalla en blanco, 2026-11-04)
Con el permiso concedido, `new Notification(...)` en Chrome de Android lanza **"Illegal constructor"**: solo acepta `ServiceWorkerRegistration.showNotification()`. El error salía dentro del chequeo de `useDoseReminders` y React dejaba **toda la app en blanco**, justo al entrar con una cuenta que tenía una toma vencida (con una cuenta sin planes no pasaba). Arreglo: `public/sw.js` (service worker mínimo: sin caché ni red, solo `notificationclick`), registrado en `main.tsx`, y `showSystemNotification` en `notificationService.ts`, que usa el service worker, cae a `new Notification` solo si no hay, y **nunca lanza**. Si tocas notificaciones, pruébalo simulando el constructor que lanza (ver log del 2026-11-04).
