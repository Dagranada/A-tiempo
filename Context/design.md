# Design System — A Tiempo

Fuente de verdad visual. Documenta lo que la app ya hace: si cambias un componente, actualiza aquí.
Los bloques de clases son **canónicos** (cópialos tal cual). Lo demás describe el patrón y apunta al componente.
Revisado 2026-10-14 contra el código.

## 1. Principios
- **Legibilidad para adultos mayores** por encima de todo: texto grande, contraste alto, áreas táctiles amplias.
- **Homogeneidad**: misma altura, radio y peso para toda acción principal, en todos los flujos.
- **Jerarquía por peso, no por color.** El color acentúa; el rojo se reserva para lo destructivo o urgente.
- **Todo estado resuelto**: vacío, cargando, error y lleno están diseñados. Ninguna pantalla queda en blanco.
- **Envelope de teléfono** también en desktop: la app nunca se estira a pantalla completa.

## 2. Paleta

| Token | Valor | Uso |
|---|---|---|
| Acento | `#0ee5ba` | CTA primario, anillo de foco, marco de cámara, punto de sección del Perfil, interruptor encendido |
| Acento oscuro | `#0bc4a0` | Hover del primario; iconos y texto sobre fondo menta; texto de ayuda de formularios |
| Menta suave | `#d0f8ed` | Píldora de nav activa, círculos de icono, check de toma hecha |
| Canvas | `#f8f9fa` | Fondo de las pantallas (envelope y pantallas completas) y del exterior en desktop |
| Superficie | `#ffffff` | Tarjetas, `Header`, `BottomNav`, barra del formulario, inputs |
| **Borde estándar** | `#E2E8F0` | El borde de la app: tarjetas, divisores, píldoras |
| Borde suave | `gray-100` / `gray-200` | Barras superiores, inputs, estados vacíos |
| Hundido | `#fafafa` / `gray-50` | Cajas de instrucciones, píldoras informativas, botones de stepper |
| Texto | `#1b1c1c` / `gray-900` · `gray-500`/`600` | Principal · secundario |
| Urgencia | `#ff5f56` | Punto pulsante de la campana cuando hay tomas pendientes |
| Error | `red-500` | Borde y mensaje de validación |
| Destructivo | `red-500` + `hover:bg-red-50`; botón `bg-red-500` | Eliminar plan (con `ConfirmDialog`) y quitar un reclamo |
| Aviso IA | `amber-50` / `amber-200/80` / `amber-800` | Banner "esto es una sugerencia" |
| Cámara | `#000` + `white/10` | Contexto oscuro de la cámara |
| Alarma | degradados verdes propios + texto blanco; acción `#009688` | Solo `ReminderAlert` (§9) |

Variables en `src/index.css` (`--color-accent`, `--color-accent-dark`, `--color-nav-active-bg`, `--color-success`; esta última ya no se usa en pantalla). Color huérfano pendiente: ver §11.

## 3. Botones — especificación única

```tsx
// A. Primario — "Guardar plan", "Guardar cambios", "Listo", "Tomar foto", "Nuevo plan"
"w-full bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 px-5 rounded-full text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2"

// B. Secundario — "Crear a mano", "Omitir y llenar a mano"
"w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-full text-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5"

// C. Secundario sobre cámara
"w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-5 rounded-full text-sm transition-all border border-white/10 active:scale-[0.98] flex items-center justify-center space-x-2"
```
- **Invariantes**: `py-2.5 px-5` · `rounded-full` · `text-sm font-bold` · `active:scale-[0.98]`.
- **Única excepción: la alarma** (§9), cuyos botones son más grandes (`py-4 text-[1.1rem]`) porque tienen que leerse y tocarse de lejos.
- **Botón de icono** (barra): `p-2 rounded-full hover:bg-gray-100 text-gray-600` (claro) o `bg-white/10 text-white hover:bg-white/20` (oscuro). `aria-label` obligatorio.
- **Acción rápida en tarjeta de plan**: editar `text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100` · eliminar igual pero `hover:text-red-500 hover:bg-red-50`; iconos `w-5`, `aria-label` con el nombre ("Editar plan de Metformina").
- **Iconos**: solo `lucide-react` (salvo la píldora SVG propia de la alarma). `w-4` en línea y en campos · `w-5` en CTA, barras y acciones de tarjeta · `w-6` campana y CTA de la alarma · `w-10` círculos de estado.

## 4. Tipografía

**Nunito Sans** para todo, por legibilidad (`Inter` solo en encabezados de sección del horario). ⚠️ Hoy solo la alarma la muestra de verdad: ver §11.

| Rol | Clases |
|---|---|
| Título de pantalla | `text-2xl font-extrabold text-gray-900 font-heading` |
| Título de sección/tarjeta | `text-xl font-bold font-heading` · `text-lg font-bold` |
| Encabezado de lista | `text-[13px] font-bold tracking-wider text-gray-500 uppercase` |
| Título de sección del Perfil | `text-[13px] font-bold tracking-wider text-gray-900 uppercase` + punto acento |
| Nombre de medicamento | `text-[18px] font-bold text-gray-900` |
| Hora grande | `text-[22px] font-bold leading-none` (pendiente) · `font-medium text-gray-600` (próxima) |
| Etiqueta de campo | `text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5` |
| Valor de campo | `text-sm font-medium text-gray-900` (inputs, selects, steppers y textarea por igual) |
| Detalle | `text-xs`/`text-[13px]`/`text-[14px]` `text-gray-500 font-medium` |
| Label de nav | `text-[11px] font-semibold` |

Escala mixta (Tailwind + px arbitrarios). Reutiliza uno de estos valores; no introduzcas otro. La alarma tiene su propia escala (§9).

## 5. Layout

```tsx
// Envelope — lo repite TODA pantalla completa y barra fija, o se desalinea en desktop
"w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl"
```
- Contenedor raíz: envelope + `bg-[#f8f9fa] min-h-screen flex flex-col shadow-2xl border-x border-gray-200`. Fuera del envelope, en desktop, también `#f8f9fa`.
- Barras fijas: envelope + `left-1/2 -translate-x-1/2`.
- Vistas: `px-5 py-6`, secciones `space-y-4`/`6`, y **`pb-28` obligatorio** o la `BottomNav` tapa la última tarjeta.
- Capas: contenido/header sticky `z-10` → `BottomNav` `z-30` → pantallas completas y alarma `z-50`.

## 6. Tarjetas y vistas

```tsx
// Tarjeta base (plan, toma pendiente, secciones del perfil)
"bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm"
```

### Horario (`HorarioView`)
- **Recuadro de reclamo** arriba de todo cuando hay que reclamar hoy, mañana o hay atraso (se ve aunque los recordatorios estén apagados): botón-tarjeta `bg-white rounded-3xl p-4 border border-[#0ee5ba]/40 shadow-sm`, icono `Pill` en `w-12 h-12 rounded-2xl bg-[#d0f8ed] text-[#0bc4a0]`, una línea `text-sm font-bold` por aviso ("Mañana toca reclamar Losartán en la EPS"), "Toca para ver tus pastas" y `ChevronRight`. Lleva a la pestaña Pastas.

**Principio rector:** lo pendiente es una tarjeta con acción; lo hecho es una fila sin acción. La jerarquía visual baja a medida que la toma deja de requerir atención.

| Estado | Tratamiento |
|---|---|
| **Pendiente** | Tarjeta base + `hover:shadow-md`. Columna de hora `w-20 border-r border-[#E2E8F0] pr-4` con hora `text-[22px] font-bold` y meridiano debajo; detalle en `pl-4 flex-1`; CTA primario ancho completo abajo (`mt-3`). |
| **Próxima** | Igual, atenuado: `shadow-[0_2px_8px_rgba(0,0,0,0.02)] opacity-90`, columna de hora `opacity-70` en `font-medium text-gray-600`, **sin CTA**. Píldora de aviso si hay `nextTakeNotice`. |
| **Ya tomada** | No es tarjeta: fila `py-3` separada por `border-b border-[#E2E8F0]`, check `text-[#0bc4a0] bg-[#d0f8ed] p-1.5 rounded-full`, y hora real en píldora gris a la derecha. |

```tsx
// Píldora informativa (hora programada, próxima toma)
"bg-gray-50 text-gray-600 text-[13px] font-medium rounded-full flex items-center justify-center space-x-2 border border-[#E2E8F0] py-2"
```

### Mis planes (`MisPlanesView`)
- Título "Mis Planes" (`text-xl font-bold font-heading`) + subtítulo y CTA primario "Nuevo plan" ancho completo.
- **Tarjeta de plan**: base + `space-y-4`.
  - Encabezado: nombre `text-[18px] font-bold`, descripción `text-sm text-gray-500`, editar/eliminar a la derecha. Separado del resto por un **divisor igual al borde de la tarjeta, de lado a lado**: `-mx-5 px-5 pb-4 border-b border-[#E2E8F0]`.
  - Detalles en `<dl className="space-y-2.5 text-sm">`, filas `flex justify-between`: etiqueta `text-gray-500`, valor `font-bold text-gray-900` a la derecha. Dosis (partes separadas por `·` gris) · Frecuencia ("1 cada 8 horas") · Hora inicial en 12 h ("02:00 PM") · Vigencia legible ("1 Feb 2026 – 1 Ago 2026").
  - Instrucciones en `bg-gray-50 px-4 py-3 rounded-2xl text-sm text-gray-600 leading-relaxed`, sin borde ni itálica.

### Pastas (`PastasView`) — reclamos en la EPS
Reglas en ADR 0008. Título "Pastas" (`text-xl font-bold font-heading`) + "Medicamentos que Alberto reclama en la EPS" + CTA primario "Registrar orden de la EPS".
- **Formulario** (tarjeta base, en la misma vista): Medicamento * (`<select>` con los planes sin reclamo, `appearance-none` + `ChevronDown`) · Primer reclamo * (fecha nativa + `Calendar`) y Meses de la orden * (`Stepper` 1–24, por defecto 6) en `grid-cols-2` · ayuda en `text-xs text-[#0bc4a0] font-semibold` · "Guardar orden" (A, icono `CalendarCheck`) + "Cancelar" (B).
- **Tarjeta de reclamo**: misma estructura que la de plan (encabezado con divisor de lado a lado; nombre + dosis; eliminar "Quitar el reclamo de …"). Debajo:
  - **Píldora de estado** `text-[13px] font-bold rounded-full px-3 py-1 border`: menta (`bg-[#d0f8ed] text-[#0b8f75]`) para *Hoy toca reclamar* / *Mañana toca reclamar*; ámbar (`bg-amber-50 text-amber-800 border-amber-200`) para *Atrasado · quedan N días* / *Último día para reclamar*; gris para *Faltan N días*.
  - `<dl>` como en Mis planes: "Le toca reclamar" (o "Puede reclamar hasta" si ya se abrió) + fecha "17 de octubre", y "Entrega 3 de 6".
  - "Marcar como reclamada" (A, `CheckCircle2`) **solo** cuando la ventana está abierta.
  - **Historial** (etiqueta de campo + "· N meses perdidos"): una fila por entrega pasada, `CheckCircle2 text-[#0bc4a0]` "Reclamada el 14 de agosto" o `XCircle text-red-500` "Perdida" en `font-bold text-red-500` (la pérdida se ve en color **y** en texto).
  - Orden terminada: caja `bg-gray-50 rounded-2xl text-sm` "La orden terminó… pide una orden nueva al médico" + "Registrar orden nueva" (A).
- Orden de las tarjetas: la próxima fecha primero; las terminadas al final.
- **Estado vacío** neutro (§9), con texto distinto si no hay planes ("Primero crea el plan…" + "Ir a Mis planes") o si hay planes sin orden.

### Perfil (`PerfilView`)
- **Sin `Header`**: la foto y el nombre ya encabezan la vista (no se repiten).
- Formulario de borrador local que se aplica con "Guardar cambios" (primario A con `Check`, debajo `role="status"` "Cambios guardados" en `text-xs text-[#0bc4a0]`).
- Tres tarjetas base (`space-y-4`), cada una con **título de sección**: punto `w-2 h-2 rounded-full bg-[#0ee5ba]` + `text-[13px] font-bold tracking-wider text-gray-900 uppercase`.
  1. **Foto + Información básica**: foto `w-28 h-28 rounded-full border-4 border-white ring-1 ring-[#E2E8F0]` con botón de cámara `w-10 h-10` abajo a la derecha (input de archivo `sr-only` con `aria-label`); nombre `text-xl font-bold font-heading`. Campos: nombre completo, fecha de nacimiento, sexo, teléfono, con iconos `User`/`Calendar`/`ChevronDown`/`Phone` a la derecha.
  2. **Información médica**: `grid grid-cols-2 gap-3` con peso (`kg`) y estatura (`m`) como sufijo `text-sm text-gray-400`, grupo sanguíneo y factor RH en `<select>`.
  3. **Notificaciones**: tarjeta sin padding con encabezado `px-5 py-4 border-b`; fila con icono `w-12 h-12 rounded-2xl bg-[#d0f8ed] text-[#0bc4a0]`, "Recordatorios con sonido" + "Avisan a la hora de cada toma, con la app abierta" y el interruptor.
- **Interruptor**: `role="switch"` + `aria-checked` + `aria-labelledby`, pista `w-14 h-8 rounded-full` (`bg-[#0ee5ba]` encendido · `bg-gray-200` apagado), perilla `w-6 h-6 bg-white shadow-sm` que se desplaza `translate-x-6`. Se aplica al instante, sin esperar a "Guardar cambios". El copy no promete vibración ni avisos con la app cerrada.

## 7. Formularios

```tsx
// Input estándar — rounded-2xl, NO rounded-full: los campos no son botones
"w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 h-12 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba] transition-all flex items-center"
```
Lo usan `PlanFormScreen` y `PerfilView`.
- Error: borde `border-red-500` + `<p className="text-xs text-red-500 mt-1 font-medium">`. Se limpia al escribir, no al reenviar. Mensajes en imperativo amable ("Ingresa el nombre del medicamento").
- Etiqueta encima (§4) con `*` si es obligatorio, unida al campo con `htmlFor`/`id`. Placeholders con ejemplos reales. Campos separados `space-y-5`; pares en `grid grid-cols-2 gap-3`.
- **Hora y fechas**: selector nativo (`type="time"`/`"date"`). El indicador nativo se estira invisible sobre el campo (`[&::-webkit-calendar-picker-indicator]:opacity-0 ... inset-0 w-full h-full`) para que **todo el campo sea táctil**. Se probó un campo de texto + botones AM/PM y se descartó: el teléfono ya trae su propio selector con AM/PM.
- **Iconos en campos**: `Clock`/`Calendar`/`ChevronDown`/`User`/`Phone` `w-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none` + `pr-10` en el input; el `<select>` usa `appearance-none`.
- **Stepper numérico** (`Stepper` en `PlanFormScreen`): caja `h-12 rounded-2xl border-gray-200 px-1.5` con `focus-within:ring-2 focus-within:ring-[#0ee5ba]`, botones `w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100` con `Minus`/`Plus` `w-4` y `aria-label` "Disminuir/Aumentar …", deshabilitados (`opacity-40`) en el mínimo/máximo; valor `text-sm font-medium` editable a mano (prefijo/sufijo `text-sm text-gray-400`). Cada stepper lleva su propia etiqueta de campo, sin subetiquetas.

### "Revisa el plan" / "Nuevo plan" (`PlanFormScreen`)
- Barra blanca sticky con botón Volver y título `text-lg font-bold font-heading`: "Revisa el plan" si viene de la IA o de editar, "Nuevo plan" si es manual. Fondo `#f8f9fa`.
- **Banner de sugerencia IA**: `bg-amber-50 border border-amber-200/80 p-3.5 rounded-2xl text-xs`, cerrable. La IA nunca guarda sola: prellena y la persona confirma.
- Campos en orden: Nombre del medicamento * · Descripción breve · **Pastillas por toma *** y **Mg por pastilla** (dos steppers; la unidad sale de la dosis: "Cápsulas por toma", "Mg por cápsula") · Hora de toma inicial * · Desde / Hasta · Frecuencia * (stepper "Cada N" + `<select>` horas/días, con ayuda "Ejemplo: 1 toma cada 8 horas" en `text-xs text-[#0bc4a0] font-semibold`) · Indicaciones especiales (`textarea rows={3} resize-none`) · "Guardar plan".
- **Dosis**: se guarda como texto `"N pastillas • X mg"` (mg opcional; los mg suben de 50 en 50). Si la dosis que llega no se cuenta por pieza (ml, gotas…), el campo cae a texto libre para no falsearla.

## 8. Navegación

- **Header**: `bg-white px-5 py-4 border-b border-gray-100 sticky top-0 z-10`. Avatar `w-[50px] rounded-full border-2 border-[#0ee5ba]/20`, **solo el primer nombre** `text-[19px] font-bold`, fecha `text-[14px] text-[#0bc4a0] font-semibold`. Se muestra en Horario, Mis planes y Pastas; **no en Perfil**.
  **Campana** con dos estados: activa `text-[#0bc4a0] bg-[#d0f8ed]` · inactiva `text-gray-500 hover:bg-gray-50`; punto `w-2.5 h-2.5 bg-[#ff5f56] ring-2 ring-white animate-pulse` si hay tomas pendientes; `aria-label` que cambia con el estado.
- **BottomNav**: `bg-white border-t border-gray-200 px-2 py-2 fixed bottom-0 z-30` + envelope. Píldora `px-4 py-1 rounded-full` + label `text-[11px] font-semibold`. Activa `bg-[#d0f8ed] text-[#0bc4a0]`, inactiva `text-gray-400`/`text-gray-500`.
  **Hoy tiene seis botones `w-1/6`**: Horario · Mis planes · **Pastas** · Alarma 2 · Alarma 3 · Perfil. La pestaña **Escanear se quitó** (2026-10-14): escanear se abre desde "Nuevo plan" en Mis planes y desde los estados vacíos, siempre con "Omitir y llenar a mano" al lado.
  - **Pastas** (icono `Pill`) lleva punto `w-2.5 h-2.5 bg-[#ff5f56] ring-2 ring-white motion-safe:animate-pulse` cuando hay que reclamar hoy, mañana o hay atraso; su `aria-label` cambia a "Pastas: hay un reclamo pendiente".
  - **"Alarma 2" y "Alarma 3" son temporales**: icono `BellRing`, nunca quedan activos y no son pestañas. Abren la alarma de prueba en las versiones 2 y 3 (§9) para comparar. La versión 1 y su botón se eliminaron el 2026-10-14. Cuando se elija, se quitan y la nav vuelve a cuatro botones `w-1/4`.

## 9. Overlays

### Alarma (`AlarmShell` + `ReminderAlert` / `ClaimAlert`) — la pantalla más importante de la app
Aparece sola; debe leerse de lejos y resolverse con un toque. `AlarmShell` pone el fondo, la píldora y las ondas; `ReminderAlert` (toma) y `ClaimAlert` (reclamo en la EPS) ponen textos y botones. Botones compartidos: `ALARM_PRIMARY_BUTTON` / `ALARM_SECONDARY_BUTTON`.

**Estructura común:**
- Pantalla completa `fixed inset-0 z-50` + envelope, `px-6 pt-16 pb-10`, todo en Nunito Sans (`font-heading` en la raíz), texto blanco. **Sin hora arriba.**
- Píldora: SVG propio (cápsula `-rotate-45`, `w-12`) en un disco sólido `w-[110px] rounded-full bg-[#00e5cf] border border-white/50`; un contenedor `w-[210px]` reserva el espacio de las ondas. **Sin anillos estáticos.**
- **Ondas** en una capa de fondo a pantalla completa centrada en la píldora (posición medida con `ResizeObserver`): sale una cada **0.8 s** (`WAVE_GAP_S`), cada una tarda **8 s** (`WAVE_DURATION_S`, debe coincidir con el CSS), diez en total, con 2–3 visibles a la vez; crecen del disco hasta la esquina más lejana y se apagan rápido (invisibles desde el 70 % del recorrido). No tapan toques (`pointer-events-none`). Con "reducir movimiento" no se ven.
- Botones grandes y del mismo tamaño (`py-4 rounded-full text-[1.1rem] font-bold`, `gap-3`):
  - Primario blanco "Marcar como tomada", texto `#009688`, icono `CheckCircle2 w-6`, sombra `shadow-[0_10px_30px_-8px_rgba(0,70,64,0.35)]`.
  - Posponer `bg-[#00695e]/30` con texto blanco, **sin icono**, "Recordar en N min" con los minutos reales de `REMINDER_INTERVAL_MS` (hoy 5; la referencia decía 10).
- **Obligatorio**: `role="alertdialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`.

- **Textos** (toma): "Toma:" `text-[1.05rem] text-[#087064]/80` · nombre `text-[2.25rem] font-extrabold text-[#087064]` · dosis en una línea "1 pastilla - 850 mg" `text-[1.25rem] font-bold` blanca · indicación centrada `text-[0.95rem] text-white/90`.

**Versiones** (la 1 se eliminó el 2026-10-14):

| | Versión 2 — la alarma real (y los avisos de reclamo) | Versión 3 (solo prueba) |
|---|---|---|
| Fondo | `radial-gradient(circle at 50% 35%, #2ee6cc 0%, #10d2b8 30%, #00bfa8 62%, #00a693 100%)` | `radial-gradient(circle at 50% 32%, #0cdbc9 0%, #01bcae 42%, #009d90 100%)` + 4 manchas cálidas `blur-3xl` (`#f6d365`/25, `#ffd166`/20, `#ffb703`/25, `#ffe49e`/15) + grano SVG (`feTurbulence`, `opacity-40 mix-blend-overlay`) |
| Ondas | líneas `.alarm-wave`: borde blanco 2.5px → 1px | bandas de luz difusas `.alarm-wave-soft` (degradado radial blanco de opacidad máx. 0.2 + sombra verde apenas visible) |

- **Rendimiento**: `.alarm-wave` (v2) anima `width`/`height`/`border-width`; `.alarm-wave-soft` (v3) nace del tamaño final y solo anima `transform: scale` (de `--wave-start` = 110px/tamaño a 1) y `opacity`, porque animar tamaño, sombras o `filter` trababa el celular. Regla en `gotchas/navegador.md`.
- **Aviso de reclamo** (`ClaimAlert`, siempre v2): "Mañana toca reclamar:" / "Hoy toca reclamar:" / "Sigue pendiente reclamar:" en el lugar de "Toma:", nombre, "En la EPS, el 15 de octubre" (o "hasta el 31 de octubre") y "Entrega N de M. Si no la reclamas este mes, se pierde." Primario "Ya lo reclamé" (día de reclamar o atraso) o "Entendido" (víspera). Posponer: `[ − ] Recordarme en N horas [ + ]`, botones redondos `w-14 h-14 bg-[#00695e]/30` con `Minus`/`Plus` `w-6` ("Menos horas"/"Más horas"), de 1 a 12 h, por defecto 2.
- **Alarma de prueba** (`isTest`, botones temporales "Alarma 2" y "Alarma 3"): muestra los textos exactos de la referencia (`TEST_MEDICATION`: Metformina, 1 pastilla · 850 mg, "Tomar con el almuerzo para evitar molestias estomacales"). Sus dos botones **solo la cierran**: no marcan ni posponen ninguna toma. Muestra un medicamento real por excepción explícita al invariante 5 (ADR 0006).

### Confirmación destructiva (`ConfirmDialog`)
Antes de eliminar un plan (Mis planes). Overlay `fixed inset-0 z-50 bg-black/60 backdrop-blur-sm` + envelope; tarjeta base `p-6 text-center space-y-5`; icono `Trash2 w-6` en círculo `w-14 h-14 bg-red-50 text-red-500`; título `text-xl font-bold font-heading` con el nombre ("¿Eliminar Metformina?"); mensaje `text-sm text-gray-500` que dice **qué se pierde** (si el plan tiene orden de la EPS, también el historial de reclamos) y "No se puede deshacer". Botones: destructivo `bg-red-500 hover:bg-red-600 text-white` con la forma de §3 ("Sí, eliminar") y secundario B "Cancelar". El foco arranca en "Cancelar"; Escape o tocar fuera cancelan. `role="alertdialog"` + `aria-modal` + `aria-labelledby` + `aria-describedby`.

### Otras
- **`LoadingScreen`**: fondo `#f8f9fa`, título "Creando plan…" + 4 pasos en círculos `w-6 h-6`; hecho = acento + `Check` y texto `line-through opacity-80`, actual = acento 20% + `Loader2 animate-spin` en `font-bold`, futuro = `bg-gray-100 text-gray-400` con el número.
- **`CameraScanScreen`**: negro con barras `bg-black/80 backdrop-blur-md`. Marco `max-w-[280px] aspect-[4/3] border-2 border-[#0ee5ba] rounded-2xl shadow-[0_0_20px_rgba(14,229,186,0.3)]` con esquinas `border-4` y línea `animate-ping`. Sin cámara: visor simulado **con el motivo exacto del error** en `text-[11px] text-amber-400/90`. Nunca dejes al usuario sin explicación.
- **Estados vacíos**, dos variantes: *invitación* (icono `w-20 h-20 bg-[#d0f8ed]`, en `HorarioView`) y *neutro* (icono `w-16 h-16 bg-gray-100 text-gray-400`, en `MisPlanesView`). Ambos: tarjeta `rounded-3xl p-8 border-gray-100 text-center`, explicación `text-sm text-gray-500 max-w-xs mx-auto` **que nombra a Alberto**, y las dos salidas siempre juntas (escanear + crear a mano).

## 10. Movimiento y accesibilidad

- `active:scale-[0.98]` en todo botón grande: es el único feedback táctil del sistema. `transition-all`/`transition-colors` sin duración explícita.
- Atención: `animate-pulse` en el punto `#ff5f56`, `animate-ping` en el láser, `animate-spin` en `Loader2`, ondas de la alarma.
- **Toda animación en bucle respeta "reducir movimiento"**: con `motion-safe:` en Tailwind o, en CSS propio (las ondas de la alarma), dentro de `@media (prefers-reduced-motion: no-preference)`.
- **En animaciones, solo `transform` y `opacity`** sobre elementos ya del tamaño final. Animar tamaño, sombras o `filter` traba el celular.
- Sin transiciones de entrada/salida de pantalla: los cambios son instantáneos a propósito.

**Checklist antes de cerrar una pantalla:**
1. Botón solo-icono → `aria-label` descriptivo, que cambia si cambia el estado.
2. Overlay modal → `role` + `aria-modal` + `aria-labelledby`.
3. Nada accionable baja de `text-sm`; `text-xs` solo para etiquetas y metadatos.
4. Foco visible (`focus:ring-2 focus:ring-[#0ee5ba]`, o `focus-visible:ring-white` sobre la alarma); si quitas el outline, pon el anillo.
5. La información nunca depende solo del color (la toma hecha tiene check **y** posición **y** hora).
6. El copy habla de acciones concretas ("Marcar como tomada"), no de conceptos, y nunca promete algo que la app no hace.

## 11. Deuda del sistema

Cosas que el código hace y **no** deben replicarse:
1. **La app no muestra Nunito Sans**: `font-sans` en la raíz de `src/App.tsx` pisa la fuente del `body` con la del sistema. Solo la alarma la corrige (`font-heading`). Además el `<link>` de `index.html` solo carga los pesos 600–800.
2. **`#69E1BC` en `LoadingScreen:66,68`**: verde fuera de paleta, visible solo ahí. **Decisión pendiente**: reemplazar por `#0ee5ba` (recomendado) o adoptarlo como token con nombre.
3. **Ondas v2 (la alarma real) animan tamaño** (`width`/`height`/`border-width`): si se traban en el celular, pasarlas al método de la v3 (§9).
4. **`motion` v12 instalado y sin usar**: todas las animaciones son Tailwind o CSS propio. O se usa, o sale de `package.json`.
5. **Dos escalas tipográficas** conviviendo (Tailwind + px arbitrarios), más la propia de la alarma. Funciona; si crece, consolidar.
6. **`--color-success` (`#27c93f`)** sigue en `src/index.css` sin uso desde que el Perfil dejó de mostrar "Perfil activo".

Bugs de contenido (fecha inventada en el `Header`, etc.) y los botones temporales de alarma viven en `state/current.md`, no aquí.
