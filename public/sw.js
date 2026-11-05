// Service worker mínimo de A Tiempo: solo para notificaciones.
//
// En Chrome de Android una página no puede crear notificaciones con
// `new Notification()` (lanza "Illegal constructor"): hay que pedírselas a un
// service worker. Este no guarda nada en caché ni intercepta la red; solo
// muestra las notificaciones que le pide la app y, al tocarlas, abre la app.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => 'focus' in w);
      return open ? open.focus() : self.clients.openWindow('/');
    })
  );
});
