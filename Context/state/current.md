# Estado actual — 2026-10-22

Se trabaja en la rama `memoria-de-contexto` y se fusiona a `main` por PR; **Vercel publica `main` en producción** en cada fusión (último: PR #27). Hogar canónico de "qué falta y qué bloquea".

**Éxito =** Alberto se toma todas las pastillas según lo planeado, sin confusiones. Lo que no acerque a eso, no es prioritario.

## Funciona
- **Pestañas**: Horario · Mis planes · Pastas · Perfil ; al abrir, splash (2 s) y, la primera vez, "Nuevo perfil". Escanear ya no es pestaña: se abre desde "Nuevo plan" y desde "Crear plan" de los estados vacíos.
- **Planes**: CRUD con validación; formulario "Revisa el plan" con steppers de dosis (cantidad + mg) y frecuencia; eliminar pide confirmación (`ConfirmDialog`). Un plan nuevo tiene paso 2, "Reclamo en la EPS" (todos se reclaman en la EPS por ahora), que registra la orden con la entrega 1 ya reclamada.
- **Horario**: tomas de hoy calculadas desde los planes (frecuencia, Desde/Hasta), "Hoy no hay tomas" si los planes no tienen ese día; marcar toma con hora real; recuadro "Mañana toca reclamar …" desde las 12 m de la víspera, con X para ocultarlo.
- **Escaneo real** (cámara → Gemini → formulario); sin cámara o si Gemini falla, formulario vacío.
- **Notificaciones estilo ajustes de Android** (paso 3 de "Nuevo perfil" y Perfil): Recordatorios, Sonido y Vibración con su interruptor; tocar "Sonido" abre los sonidos y la música del celular (selector de archivos) y muestra el nombre del elegido; si no se puede reproducir, suena el chime. En la app nativa debería abrir el selector de tonos de Android.
- **Recordatorios siempre activos** desde que existe el perfil (no son una opción, 2026-11-04): alerta a pantalla completa + notificación + sonido elegido o chime, insistiendo cada 5 min; posponer de 5 en 5 minutos (5–60).
- **Alarma real = versión 4** (sin píldora, texto al centro, ondas fluidas) para toma y reclamo, con escala de texto común (`design.md` §9).
- **Pastas — reclamos mensuales en la EPS** (ADR 0008): registrar/editar/renovar la orden de un plan, estado del mes, historial con meses perdidos; avisos a las 12 m de la víspera y a las 8 a. m. del día y de cada día de atraso, posponibles de 1 a 12 h; punto en la pestaña.
- **Datos guardados en el teléfono** (ADR 0007, prefijo `v2`): una instalación nueva empieza sin perfil ni planes; los recordatorios encendidos se recuerdan. Sin datos de ejemplo: Perfil → "Borrar todo y empezar de nuevo" deja el teléfono como recién instalado.
- **Perfil editable** sin barra superior, con interruptor de recordatorios.
- **Inicio**: splash en cada apertura → "Crea tu cuenta" (correo + código de 6 números con **Supabase**, probado de punta a punta) → "Nuevo perfil" (3 pasos, solo el nombre obligatorio) si no hay perfil → Horario en estado vacío hasta el primer plan. El Header muestra el primer nombre del perfil y la fecha real.
- Estados vacíos comunes (`EmptyState`: "No tienes un horario / un plan / pastas" + "Crear plan"), que salen cuando de verdad no hay planes, y sistema de diseño documentado y revisado a 386 y 320 px.

## Pendiente

1. ~~Generar las tomas desde la frecuencia~~ Resuelto el 2026-11-03: las tomas de cada día se calculan desde los planes (`src/lib/doses.ts`) y el formulario muestra las horas que resultan.
2. **Datos en la nube** (ADR 0010): listo en el código; funciona cuando se complete la configuración de Supabase (Pendiente 15).
3. ~~Reinicio diario~~ Resuelto el 2026-11-03: solo se guardan las tomas marcadas, por día; cada día empieza con todas pendientes. Falta un historial de tomas olvidadas (las de ayer sin marcar no se ven).
4. ~~`upcoming` nunca pasa a `pending`~~ Resuelto el 2026-11-03: el estado se recalcula cada minuto.
5. ~~`startDate`/`endDate` decorativos~~ Resuelto el 2026-11-03: fuera de Desde/Hasta no hay tomas.
6. ~~Fecha del `Header` escrita a mano~~ Resuelto el 2026-11-03: muestra la fecha real.
7. **Texto del recuadro y notificación de la víspera** ("Mañana toca reclamar …") distinto del de la alarma ("MAÑANA / debes reclamar:"). Se dejó así a pedido; preguntar si se unifica.
8. ~~"Restablecer datos de ejemplo"~~ Resuelto el 2026-11-03: se borraron los datos de ejemplo (`mockData.ts`), las alarmas de prueba y los textos inventados por defecto ("Tomar según indicaciones del empaque", "Plan de medicación"); en su lugar, "Borrar todo y empezar de nuevo". Quedan sin uso las versiones 2 y 3 de la alarma en `AlarmShell`.
9. **La app no usa Nunito Sans**: `font-sans` en la raíz de `src/App.tsx:325` pisa la fuente del `body`. Las alarmas la corrigen con `font-heading`; falta el resto (y `index.html` solo carga los pesos 600–800).
10. **`App.tsx` tiene 464 líneas**: ADR 0001 pide extraer un hook (`usePlans`/`useClaims`) con los handlers a partir de 400.
11. **Avisos de reclamo sin probar en tiempo real**: la lógica se probó con fechas simuladas y adelantando el reloj de la página; falta verlos sonar a las 12 m y 8 a. m. en un celular.
12. ~~Quitar un reclamo en Pastas no pide confirmación~~ Resuelto el 2026-11-03: pide confirmación; además, "Deshacer" en Ya tomadas para una toma marcada por error.
13. **En el Horario, varias tomas pendientes muestran varios "Listo" verdes** (choca con "un solo primario por pantalla", `design.md` §3). Se ofreció aplicarles el secundario menta y quedó sin respuesta.
14. **Deuda de diseño**: `#69E1BC` huérfano, `motion` sin usar y `--color-success` sin uso (`../design.md` §11).
15. **Supabase: terminar la configuración** (ADR 0010). El código ya está (cuenta con código, sincronización, Cerrar sesión, Borrar todo en la nube). Hecho en el proyecto (2026-11-04): SQL corrido, SMTP con Gmail (contraseña de aplicación; Username = el Gmail completo) y plantillas "Confirm sign up" y "Magic link or OTP" con `{{ .Token }}`. Probado de punta a punta en local: crear cuenta, perfil y plan en la nube, recargar sin código, cerrar sesión y recuperar todo con otro código. Falta: **agregar `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en Vercel antes de publicar**, y para gente real, Resend con dominio propio en vez de Gmail. Después: mover Gemini a una Edge Function.
16. **Todo plan nuevo pasa por "Reclamo en la EPS"**: decidido así por la persona (2026-11-03), "todas se reclaman en la EPS". No agregar la opción "no se reclama" hasta que lo pida.
17. ~~`npm run lint` no revisa props~~ Resuelto el 2026-11-04: se instalaron `@types/react` y `@types/react-dom` (cero errores).

## Blockers
- **API key en el bundle del navegador** (`vite.config.ts` → `define`). Bloquea cualquier deploy público. Salida: endpoint propio (`express` y `tsx` ya instalados, sin usar). ADR 0002.
- **Recordatorios solo con la app abierta.** Con el celular bloqueado no suena: la adherencia depende de que alguien mire la pantalla. Exigiría PWA + push con servidor. ADR 0004.
- **Sin tests.** La red de seguridad es `npm run lint` + probar a mano (y scripts con `tsx` para `claims.ts`).
- **Sin README** (el arranque está en `../AGENTS.md` §4).

## Verificaciones que la Ficha 4D exige y no se han hecho
Medir los 30 s de creación en móvil · probar en celular real que los recordatorios de toma y de reclamo llegan a la hora (ojo: por IP LAN en HTTP no hay cámara, `../gotchas/navegador.md`) · checklist QA sobre la URL pública de Vercel.

## No tocar sin motivo
`vite.config.ts` · el `<video>` siempre montado en `CameraScanScreen` · el `unlockAudio()` dentro del gesto (campana, interruptor y botones de prueba) · las reglas de `src/lib/claims.ts` sin re-probar los casos del ADR 0008.
