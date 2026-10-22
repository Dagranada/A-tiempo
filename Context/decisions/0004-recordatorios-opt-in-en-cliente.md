# 0004 · Recordatorios opt-in, vigilando el reloj en el cliente

**Fecha:** 2026-08-22 · **Estado:** Vigente

## Contexto
La app mostraba las tomas del día pero nunca comparaba la hora actual contra ellas: el cuidador solo se enteraba si abría la app y miraba la lista.

## Decisión
`useDoseReminders(doses, enabled)` revisa el reloj cada 30 s y devuelve la toma vencida más antigua sin marcar. Cuando hay una:
- alerta a pantalla completa (`ReminderAlert`) sobre la vista principal,
- notificación del sistema (`tag` por plan, para que no se apilen),
- chime de dos notas sintetizado con Web Audio (sin archivo de audio),
- insiste cada **5 minutos** (`REMINDER_INTERVAL_MS`) hasta que se marca como tomada; `snooze(minutos)` pospone lo que se elija en la alarma (**de 5 en 5, de 5 a 60**, desde 2026-10-22; antes era fijo en 5).

Es **opt-in**: se activa con la campana del `Header` o con el interruptor de Perfil, y ese mismo toque llama `unlockAudio()`. Los avisos de reclamo en la EPS (ADR 0008) usan el mismo interruptor y el mismo diseño de alarma. Si el navegador niega las notificaciones, la alerta en pantalla y el sonido siguen funcionando.

## Alternativas descartadas
- Activar al abrir la app: alarma sin que nadie lo pida, y el audio quedaría bloqueado por falta de gesto del usuario.
- Service Worker + push: exige PWA instalada y backend real. Fuera de alcance.

## Consecuencias
- **Solo funciona con la app abierta.** Con el celular bloqueado no suena.
- Los timers en segundo plano se estrangulan a ~1/min; tolerable para un ciclo de 5 min, no para uno de 30 s.
- La alerta se muestra solo en `screen === 'home'`, para no interrumpir el escáner ni el formulario.
