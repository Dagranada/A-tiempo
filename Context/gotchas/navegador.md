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

## El HMR no refresca los datos de `mockData.ts`
Al editar `src/data/mockData.ts`, la pantalla puede seguir mostrando los valores viejos: el estado inicial ya se copió a los `useState` de `App.tsx` y el hot reload no lo vuelve a leer. **Recarga la página** antes de concluir que tu cambio no se aplicó. (Visto el 2026-08-22 revirtiendo una traducción: el archivo ya estaba correcto y la pantalla seguía en inglés.)
