# AGENTS.md — A Tiempo

Control central. Rutas relativas a `Context/` (salvo `src/`, desde la raíz del repo).
Léelo completo al arrancar, junto con `state/current.md`. Todo lo demás, **bajo demanda**.

## 1. Proyecto

**A Tiempo**: app web móvil-first para que un cuidador familiar organice los medicamentos de un adulto mayor.
Persona: **Alberto, 78**; cuidadora: **María (hija)**. Origen: Google AI Studio.

**Definición de éxito:** Alberto se toma **todas** las pastillas según lo planeado, **sin confusiones**. Adherencia y claridad — no retención ni tiempo de uso. Juzga cada cambio contra esto.

Flujos: `Horario` (tomas de hoy, marcar "Listo") · `Mis Planes` (CRUD; "Nuevo plan" abre Escanear: foto → Gemini → formulario prellenado) · `Pastas` (reclamos mensuales en la EPS, ADR 0008) · `Perfil`. Alarma a pantalla completa para tomas y reclamos. Los datos se guardan en el teléfono (ADR 0007).
Publicación: rama `memoria-de-contexto` → PR → `main`; **Vercel despliega `main` a producción** en cada fusión.
Stack: React 19 + TS + Vite 6 + Tailwind 4 (`@tailwindcss/vite`) + `lucide-react` + `@google/genai`. Sin backend, sin router, sin tests.

## 2. Reglas duras

Dos niveles. **Nunca los trates igual.**

### 2.A · Invariantes — no se cambian sin ADR

Si una petición contradice una de estas, **detente antes de editar nada**: nombra la regla, explica el riesgo y pide confirmación explícita. Si se confirma, el cambio empieza por un ADR en `decisions/` que derogue la regla; recién después se toca el código. Nunca las cambies "de paso" dentro de otra tarea.

1. **La app sugiere, no prescribe.** El criterio clínico no se delega — ni a Gemini, ni a un default, ni al copy. Todo plan es sugerencia editable que un médico avala, y el aviso de consultar al médico no se quita ni se debilita.
2. **Ningún secreto en el repo.** `.env.local`, API keys ni credenciales, en ningún archivo ni commit.
3. **Accesibilidad mínima**: nada accionable baja de `text-sm`, todo botón solo-icono lleva `aria-label`, el foco es visible. La app es para una persona de 78 años.
4. **La salida manual siempre visible**: "Omitir y llenar a mano" / "Crear a mano" no se elimina de ningún paso del flujo de creación.
5. **Nada en pantalla que no corresponda con la realidad.** Un dato falso o desactualizado sobre qué tomar y cuándo es un bug de seguridad del paciente, no un detalle cosmético. *Excepción acotada: las alarmas de prueba ("Alarma 4", "Reclamo", "Mañana") muestran Metformina (ADR 0006). Sus botones se quitaron del menú el 2026-10-23; si se vuelven a conectar, la excepción sigue valiendo.*

### 2.B · Convenciones — la persona puede cambiarlas al vuelo

Se pueden ejecutar sin pedir permiso, **pero en el mismo turno actualizas la regla aquí y lo anotas en `logs/`**. El código y esta memoria nunca quedan en contradicción, ni "hasta que decidas".

6. **Idioma**: UI, comentarios y commits en español. Sin excepciones vigentes.
7. **El diseño manda**: clases exactas de `design.md`, no aproximadas.
8. **Estado en `App.tsx`**; los componentes son presentacionales (props + callbacks).
9. **No toques `vite.config.ts`** (`hmr`/`watch` están así por AI Studio).
10. **No leas** `node_modules/`, `package-lock.json` ni `explicacion-visual-a-tiempo.html`. Nunca `grep` sin `--include` o sin acotar a `src/`.
11. `npm run lint` (`tsc --noEmit`) debe pasar antes de cerrar.
12. Commits según `skills/commit.md`. Solo commitear o pushear si la persona lo pide.

Protocolo completo ante un choque: `skills/conflicto-con-una-regla.md`.

## 3. Qué leer, según la tarea

| Tarea | Lee |
|---|---|
| Siempre | `AGENTS.md` → `state/current.md` |
| UI / visual | `design.md` → el componente hermano |
| Escaneo / IA | `gotchas/gemini.md` → `src/services/geminiService.ts` |
| Recordatorios | `gotchas/navegador.md` → `src/hooks/useDoseReminders.ts` + `services/notificationService.ts` |
| Reclamos en la EPS | `decisions/0008` → `src/lib/claims.ts` + `src/hooks/useClaimReminders.ts` |
| Alarma (toma o reclamo) | `design.md` §9 → `src/components/AlarmShell.tsx` |
| Modelo de datos | `src/types.ts` → `gotchas/datos-y-estado.md` |
| "¿Por qué está así?" | `decisions/README.md` → el ADR concreto |
| Alcance / éxito | `ficha-4d.md` |
| Retomar trabajo | `logs/` (el más reciente) |

## 4. Mapa del código

```
src/App.tsx                        464 · TODO el estado + handlers + routing por screen/activeTab (pide extraer hooks)
src/types.ts                        57 · MedicationPlan (+ claim: EpsClaim), DoseItem, SeniorProfile, ScreenView, NavTab
src/data/mockData.ts               238 · INITIAL_PLANS (3 con reclamo, fechas relativas a hoy) / _TODAY_DOSES / _SENIOR_PROFILE, SCAN_PRESETS
src/lib/claims.ts                  126 · getClaimSchedule (reglas de reclamo), fechas YYYY-MM-DD, textos de estado
src/services/geminiService.ts       76 · analyzeMedicationImage(base64) → plan
src/services/notificationService.ts 125 · permisos, notificaciones (toma, reclamo, prueba), chime Web Audio
src/hooks/usePersistentState.ts     34 · useState + localStorage (prefijo a-tiempo:v1:)
src/hooks/useDoseReminders.ts      110 · vigila el reloj → dueDose + snooze(minutos)
src/hooks/useClaimReminders.ts      99 · vigila el reloj → aviso de reclamo (12 m víspera, 8 a. m. el día)
src/components/                         Header, BottomNav, HorarioView, MisPlanesView, PastasView, PerfilView,
                                        CameraScanScreen, LoadingScreen, PlanFormScreen, Stepper, ConfirmDialog,
                                        AlarmShell (fondo, ondas, SnoozeControl, ALARM_TEXT), ReminderAlert, ClaimAlert,
                                        EmptyState, PlanClaimStep, ProfileFields (campos del perfil), ProfileCreateScreen
```
`npm run dev` (:3000) · `npm run lint` · `npm run build`. Para ver la app: preview con `a-tiempo-dev` de `.claude/launch.json`, **nunca** `npm run dev` por Bash.

## 5. Skills

| Tarea | Skill |
|---|---|
| Pantalla o componente | `skills/nueva-vista-o-componente.md` |
| Campo nuevo en el plan | `skills/agregar-campo-al-plan.md` |
| Verificar en el navegador | `skills/verificar-en-navegador.md` |
| Escribir el commit | `skills/commit.md` |
| **La petición choca con una regla** | **`skills/conflicto-con-una-regla.md`** (se aplica sola) |
| Cerrar sesión | `skills/cerrar-sesion.md` |

Procedimiento repetido dos veces → conviértelo en skill y añádelo aquí.

## 6. Cómo manejar el contexto

- **El context window es caro y volátil; la memoria real vive en archivos.**
- **Nunca cargues todo**: ni el historial, ni el repo. Solo lo que la tarea toca.
- **Referencia, no copies**: `src/App.tsx:130` en vez de pegar 40 líneas. Lee con `sed -n 'A,Bp'` / `grep -n`.
- **Un hecho, un hogar.** No dupliques entre archivos; apunta al canónico:
  | Tipo de hecho | Vive en |
  |---|---|
  | Qué falta, qué bloquea | `state/current.md` |
  | Trampas técnicas | `gotchas/` |
  | Por qué se decidió así | `decisions/` |
  | Reglas visuales | `design.md` |
  | Alcance y éxito | `ficha-4d.md` · `decisiones.md` |
- **Al cerrar sesión importante**: `skills/cerrar-sesion.md`.
- Mantén este archivo bajo 300 líneas y de alta densidad.

## 7. Definition of Done

1. `npm run lint` pasa.
2. La UI respeta `design.md`.
3. Verificado en el navegador (`skills/verificar-en-navegador.md`), no solo "compila".
4. Textos en español, legibles para un adulto mayor.
5. Estados vacío / error / carga cubiertos.
6. `state/current.md` actualizado; decisión no obvia → `decisions/`; trampa nueva → `gotchas/`.

Si tocaste el flujo de crear un plan, además (Ficha 4D):

7. El plan se presenta como **sugerencia editable**, nunca como indicación cerrada.
8. Crear un plan en móvil sigue tomando **menos de 30 segundos**.
9. La salida manual ("Omitir y llenar a mano") sigue visible en cada paso.
10. Nada en pantalla induce confusión sobre **qué toca tomar y cuándo**: un dato mostrado que no corresponde con la realidad es un bug, no un detalle.

## 8. Mapa de la memoria

```
Context/
├── AGENTS.md          Este archivo.
├── design.md          Sistema de diseño. Fuente de verdad visual.
├── decisiones.md      Reglas de producto.
├── ficha-4d.md        Encuadre: qué se delega a la IA, alcance, criterios de éxito.
├── decisions/         ADRs (índice en decisions/README.md).
├── state/current.md   Hecho · Pendiente · Blockers. Actualizar cada sesión.
├── skills/            Procedimientos repetibles (§5).
├── gotchas/           gemini · navegador · datos-y-estado.
└── logs/              Resúmenes de sesión, uno por sesión importante.
```
En la raíz del repo solo `CLAUDE.md`, un puntero a este archivo.
