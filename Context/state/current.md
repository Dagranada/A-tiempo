# Estado actual — 2026-10-22

Se trabaja en la rama `memoria-de-contexto` y se fusiona a `main` por PR; **Vercel publica `main` en producción** en cada fusión (último: PR #18). Hogar canónico de "qué falta y qué bloquea".

**Éxito =** Alberto se toma todas las pastillas según lo planeado, sin confusiones. Lo que no acerque a eso, no es prioritario.

## Funciona
- **Pestañas**: Horario · Mis planes · Pastas · Perfil (+ botones temporales "Empty states" y "Crear perfil", ver Pendiente 8). Escanear ya no es pestaña: se abre desde "Nuevo plan" y desde "Crear plan" de los estados vacíos.
- **Planes**: CRUD con validación; formulario "Revisa el plan" con steppers de dosis (cantidad + mg) y frecuencia; eliminar pide confirmación (`ConfirmDialog`). Un plan nuevo tiene paso 2, "Reclamo en la EPS" (todos se reclaman en la EPS por ahora), que registra la orden con la entrega 1 ya reclamada.
- **Horario**: marcar toma con hora real; recuadro "Mañana toca reclamar …" desde las 12 m de la víspera, con X para ocultarlo.
- **Escaneo real** (cámara → Gemini → formulario), con fallback a preset y a formulario vacío.
- **Recordatorios opt-in** (campana o interruptor del Perfil): alerta a pantalla completa + notificación + chime, insistiendo cada 5 min; posponer de 5 en 5 minutos (5–60).
- **Alarma real = versión 4** (sin píldora, texto al centro, ondas fluidas) para toma y reclamo, con escala de texto común (`design.md` §9).
- **Pastas — reclamos mensuales en la EPS** (ADR 0008): registrar/editar/renovar la orden de un plan, estado del mes, historial con meses perdidos; avisos a las 12 m de la víspera y a las 8 a. m. del día y de cada día de atraso, posponibles de 1 a 12 h; punto en la pestaña.
- **Datos guardados en el teléfono** (ADR 0007); Perfil → "Restablecer datos de ejemplo" vuelve a los datos de muestra (incluye un reclamo atrasado de Atorvastatina).
- **Perfil editable** sin barra superior, con interruptor de recordatorios.
- **Flujo "Nuevo perfil"** (3 pasos: básica, médica, notificaciones), visible con el botón temporal "Crear perfil" del menú. **Todavía no guarda** (ver Pendiente 15).
- Estados vacíos comunes (`EmptyState`: "No tienes un horario / un plan / pastas" + "Crear plan"), demostrables con el botón "Empty states", y sistema de diseño documentado y revisado a 386 y 320 px.

## Pendiente

1. ⚠️ **Generar las tomas desde la frecuencia.** `handleSavePlan` (`src/App.tsx:152`) crea **una sola toma diaria** e ignora `frequencyValue`/`frequencyUnit`: un plan "cada 8 horas" deja dos dosis sin avisar. **Es el mayor incumplimiento de la definición de éxito.**
2. **Datos solo en ese navegador** (ADR 0007): no se comparten entre María y Alberto ni sobreviven a borrar los datos del sitio. Sincronizar exige backend.
3. **Reinicio diario.** Las tomas marcadas nunca vuelven a `pending`: no existe el concepto de "día" en los datos.
4. **`upcoming` nunca pasa a `pending`** con el reloj. `useDoseReminders` lo esquiva; `HorarioView` sí los distingue.
5. **`startDate`/`endDate` del plan decorativos**: se guardan y se muestran, no filtran nada.
6. **Fecha del `Header` escrita a mano**: siempre `"Lunes, 24 de febrero"` (`src/components/Header.tsx:38`). Dato falso en pantalla → confusión.
7. **Texto del recuadro y notificación de la víspera** ("Mañana toca reclamar …") distinto del de la alarma ("MAÑANA / debes reclamar:"). Se dejó así a pedido; preguntar si se unifica.
8. **Botón temporal "Empty states" en la `BottomNav`** (enciende `isEmptyState`). **Quitarlo antes de un lanzamiento real.** Los botones "Alarma 4", "Reclamo" y "Mañana" se quitaron del menú (2026-10-23), pero su código de prueba (`isTest` en `ReminderAlert`, `buildTestClaim`) y las versiones 2 y 3 de la alarma siguen sin usarse: borrarlos si no vuelven.
9. **La app no usa Nunito Sans**: `font-sans` en la raíz de `src/App.tsx:325` pisa la fuente del `body`. Las alarmas la corrigen con `font-heading`; falta el resto (y `index.html` solo carga los pesos 600–800).
10. **`App.tsx` tiene 464 líneas**: ADR 0001 pide extraer un hook (`usePlans`/`useClaims`) con los handlers a partir de 400.
11. **Avisos de reclamo sin probar en tiempo real**: la lógica se probó con fechas simuladas y adelantando el reloj de la página; falta verlos sonar a las 12 m y 8 a. m. en un celular.
12. **Quitar un reclamo en Pastas no pide confirmación** (eliminar un plan sí). Se ofreció y quedó sin respuesta.
13. **En el Horario, varias tomas pendientes muestran varios "Listo" verdes** (choca con "un solo primario por pantalla", `design.md` §3). Se ofreció aplicarles el secundario menta y quedó sin respuesta.
14. **Deuda de diseño**: `#69E1BC` huérfano, `motion` sin usar y `--color-success` sin uso (`../design.md` §11).
15. **Varios perfiles, cada uno con sus planes.** El flujo "Nuevo perfil" existe pero no guarda: falta separar `profile`, `plans`, `doses` y `claim-alerts` por perfil (cambia ADR 0007, pide un ADR nuevo y migrar los datos `a-tiempo:v1:`), decidir dónde se cambia de perfil, qué ve la app al abrirse por primera vez y si los recordatorios son por perfil o del teléfono.

## Blockers
- **API key en el bundle del navegador** (`vite.config.ts` → `define`). Bloquea cualquier deploy público. Salida: endpoint propio (`express` y `tsx` ya instalados, sin usar). ADR 0002.
- **Recordatorios solo con la app abierta.** Con el celular bloqueado no suena: la adherencia depende de que alguien mire la pantalla. Exigiría PWA + push con servidor. ADR 0004.
- **Sin tests.** La red de seguridad es `npm run lint` + probar a mano (y scripts con `tsx` para `claims.ts`).
- **Sin README** (el arranque está en `../AGENTS.md` §4).

## Verificaciones que la Ficha 4D exige y no se han hecho
Medir los 30 s de creación en móvil · probar en celular real que los recordatorios de toma y de reclamo llegan a la hora (ojo: por IP LAN en HTTP no hay cámara, `../gotchas/navegador.md`) · checklist QA sobre la URL pública de Vercel.

## No tocar sin motivo
`vite.config.ts` · el `<video>` siempre montado en `CameraScanScreen` · el `unlockAudio()` dentro del gesto (campana, interruptor y botones de prueba) · las reglas de `src/lib/claims.ts` sin re-probar los casos del ADR 0008.
