# Estado actual — 2026-08-22

Rama `main`. Último commit de código: `caaaf27` (recordatorios). Hogar canónico de "qué falta y qué bloquea".

**Éxito =** Alberto se toma todas las pastillas según lo planeado, sin confusiones. Lo que no acerque a eso, no es prioritario.

## Funciona
Navegación de 4 pestañas · CRUD de planes con validación · marcar toma con hora real · escaneo real (cámara → Gemini → formulario, con fallback a preset y a formulario vacío) · recordatorios opt-in (alerta + notificación + chime, insistiendo cada 5 min, con snooze) · estados vacíos demostrables (`isEmptyState`) · sistema de diseño homogéneo · formulario "Revisa el plan" con steppers de dosis (cantidad + mg) y frecuencia · Perfil editable con interruptor de recordatorios (2026-10-13).

## Pendiente

1. ⚠️ **Generar las tomas desde la frecuencia.** `handleSavePlan` crea **una sola toma diaria** e ignora `frequencyValue`/`frequencyUnit`: un plan "cada 8 horas" deja dos dosis sin avisar. **Es el mayor incumplimiento de la definición de éxito.** `src/App.tsx:130-180`
2. **Persistencia.** Nada sobrevive a un refresh (ADR 0001). Mínimo viable: `localStorage` para `plans` + `doses`.
3. **Reinicio diario.** Las tomas marcadas nunca vuelven a `pending`: no existe el concepto de "día" en los datos.
4. **`upcoming` nunca pasa a `pending`** con el reloj. `useDoseReminders` lo esquiva; `HorarioView` sí los distingue.
5. **`startDate`/`endDate` decorativos**: se guardan y se muestran, no filtran nada.
6. **Fecha del `Header` escrita a mano**: siempre `"Lunes, 24 de febrero"` (`src/components/Header.tsx:38`). Dato falso en pantalla → confusión.
7. **`handleResetData` sin conectar** a ninguna vista. (El Perfil ya es editable desde 2026-10-13: datos básicos, médicos y el interruptor de recordatorios; nada persiste tras un refresh.)
8. **Botón temporal "Alarma" en la `BottomNav`** (2026-10-14) para probar la alerta y el sonido. Quitarlo antes de un lanzamiento real.
9. **La app no usa Nunito Sans** (2026-10-14): `font-sans` en la raíz de `src/App.tsx:233` pisa la fuente del `body` con la del sistema, contra `design.md` §4. La alarma ya lo corrige con `font-heading`; falta el resto (y el `<link>` de `index.html` solo carga los pesos 600–800).
10. **Deuda de diseño**: `#69E1BC` huérfano y `motion` sin usar (`../design.md` §11).

## Blockers
- **API key en el bundle del navegador** (`vite.config.ts` → `define`). Bloquea cualquier deploy público. Salida: endpoint propio (`express` y `tsx` ya instalados, sin usar). ADR 0002.
- **Recordatorios solo con la app abierta.** Con el celular bloqueado no suena: la adherencia depende de que alguien mire la pantalla. Exigiría PWA + push. ADR 0004.
- **Sin tests.** La red de seguridad es `npm run lint` + probar a mano.
- **Sin README** (se eliminó el genérico de AI Studio el 2026-08-22; el arranque está en `../AGENTS.md` §4).

## Verificaciones que la Ficha 4D exige y no se han hecho
Medir los 30 s de creación en móvil · probar en celular real que los recordatorios llegan a la hora (ojo: por IP LAN en HTTP no hay cámara, `../gotchas/navegador.md`) · deploy público + checklist QA (bloqueado, ver arriba).

## No tocar sin motivo
`vite.config.ts` · el `<video>` siempre montado en `CameraScanScreen` · el `unlockAudio()` dentro del gesto de la campana.
