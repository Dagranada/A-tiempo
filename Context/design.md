# Design System — A Tiempo

Fuente de verdad visual. Documenta lo que la app ya hace: si cambias un componente, actualiza aquí.
Los bloques de clases son **canónicos** (cópialos tal cual). Lo demás describe el patrón y apunta al componente.
Revisado 2026-10-22 contra el código.

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
| Aviso IA | `amber-50` / `amber-200/80` / `amber-800` | Banner "esto es una sugerencia" y reclamo atrasado en Pastas |
| Cámara | `#000` + `white/10` | Contexto oscuro de la cámara |
| Alarma | degradado verde agua (§9) + texto blanco y verde oscuro `#0f5a4e`; acción `#009688`; secundarios `#00695e` al 30 % | Solo `ReminderAlert` y `ClaimAlert` (§9) |

Variables en `src/index.css` (`--color-accent`, `--color-accent-dark`, `--color-nav-active-bg`, `--color-success`; esta última ya no se usa en pantalla). Color huérfano pendiente: ver §11.

## 3. Botones — especificación única

```tsx
// A. Primario — "Guardar plan", "Guardar cambios", "Listo", "Tomar foto", "Nuevo plan"
"w-full bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 px-5 rounded-full text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2"

// B. Secundario — "Crear a mano", "Omitir y llenar a mano"
"w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-full text-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5"

// D. Secundario menta — acciones verdes que conviven con un primario (A) en la misma pantalla:
//    "Marcar como reclamada", "Registrar orden nueva" en las tarjetas de Pastas
"w-full bg-[#d0f8ed] hover:bg-[#bdf3e3] text-[#087064] font-bold py-2.5 px-5 rounded-full text-sm border border-[#0ee5ba]/30 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"

// C. Secundario sobre cámara
"w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-5 rounded-full text-sm transition-all border border-white/10 active:scale-[0.98] flex items-center justify-center space-x-2"
```
- **Invariantes**: `py-2.5 px-5` · `rounded-full` · `text-sm font-bold` · `active:scale-[0.98]`.
- **Un solo primario (A) por pantalla.** Si hay más acciones verdes, van como **secundario menta (D)**: el mismo verde, más claro. El texto es `#087064` (no `#0bc4a0`) para que se lea bien sobre el menta. El gris (B) queda para acciones neutras (Cancelar, salidas alternativas).
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
- **Recuadro de reclamo** arriba de todo: acompaña **la primera notificación**, la del día anterior. Aparece **desde las 12 m del día anterior** a la fecha de reclamo (uno por medicamento; la vista revisa el reloj cada minuto) y se ve aunque los recordatorios estén apagados. Hoy y los atrasos no llevan recuadro: los cubren el aviso de las 8 a. m. y el punto de la pestaña. Según la referencia de diseño: `bg-[#d0f8ed]/80 rounded-3xl shadow-sm`, **sin borde**; ícono `Pill w-6` en círculo `w-12 h-12 rounded-full bg-[#0ee5ba]/25 text-[#087064]`; título `text-base font-semibold text-[#087064]` "Mañana toca reclamar Losartán" (**mismo texto que la notificación del sistema**) y "Toca para ver tus pastas" en `text-sm text-[#087064]/75`. Tocarlo lleva a Pastas; la **X** (`w-6`, "Ocultar el aviso de … por hoy") lo oculta hasta la próxima fecha (se guarda en `claim-alerts`); el punto de la pestaña Pastas no se apaga.

**Principio rector:** lo pendiente es una tarjeta con acción; lo hecho es una fila sin acción. La jerarquía visual baja a medida que la toma deja de requerir atención.

| Estado | Tratamiento |
|---|---|
| **Pendiente** | Tarjeta base + `hover:shadow-md`. Columna de hora `w-20 border-r border-[#E2E8F0] pr-4` con hora `text-[22px] font-bold` y meridiano debajo; detalle en `pl-4 flex-1`; CTA primario ancho completo abajo (`mt-3`). |
| **Próxima** | Igual, atenuado: `shadow-[0_2px_8px_rgba(0,0,0,0.02)] opacity-90`, columna de hora `opacity-70` en `font-medium text-gray-600`, **sin CTA**. Píldora de aviso si hay `nextTakeNotice`. |
| **Ya tomada** | No es tarjeta: fila `py-3` separada por `border-b border-[#E2E8F0]`, check `text-[#0bc4a0] bg-[#d0f8ed] p-1.5 rounded-full`, y hora real en píldora gris a la derecha; debajo, botón de texto **"Deshacer"** (`text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-full`, `aria-label` "Deshacer: … vuelve a pendiente"), sin confirmación porque se puede volver a marcar. Contadores en singular con 1 ("1 toma restante", "1 completada"). |

```tsx
// Píldora informativa (hora programada, próxima toma)
"bg-gray-50 text-gray-600 text-[13px] font-medium rounded-full flex items-center justify-center space-x-2 border border-[#E2E8F0] py-2"
```

### Mis planes (`MisPlanesView`)
- Título "Mis Planes" (`text-xl font-bold font-heading`) + subtítulo "Planes de medicación activos" (las bajadas no nombran a Alberto; los estados vacíos sí) y CTA primario "Nuevo plan" ancho completo, que abre el escáner . En el estado vacío no se muestran ni el título, ni la bajada, ni "Nuevo plan": solo el `EmptyState` (igual en Pastas).
- **Tarjeta de plan**: base + `space-y-4` (`p-4` por debajo de 380px, como la de Pastas).
  - Encabezado: nombre `text-[18px] font-bold`, descripción `text-sm text-gray-500`, editar/eliminar a la derecha. Separado del resto por un divisor `pb-4 border-b border-[#E2E8F0]` **dentro del padding** (no llega a los bordes).
  - Detalles en una **cuadrícula de dos columnas** `<dl className="grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-2.5 text-sm">` (por debajo de 380px `grid-cols-[5.5rem_1fr] gap-x-2`): etiqueta `text-gray-500` y valor `font-bold text-gray-900` **alineado a la izquierda** en la segunda columna (referencia de diseño). Cada parte de la dosis y cada fecha de la vigencia van en `whitespace-nowrap`: si la vigencia no cabe, corta solo después del guion. Dosis (partes separadas por `·` gris) · Frecuencia ("1 cada 8 horas") · Hora inicial en 12 h ("02:00 PM") · Vigencia legible ("1 Feb 2026 – 1 Ago 2026").
  - Instrucciones en `bg-gray-50 border border-[#E2E8F0] px-4 py-3 rounded-2xl text-sm text-gray-600 leading-relaxed`, sin itálica: mismo fondo y borde que la caja de datos de Pastas.

### Pastas (`PastasView`) — reclamos en la EPS
Reglas en ADR 0008. Título "Pastas" (`text-xl font-bold font-heading`) + "Medicamentos para reclamar en la EPS" + CTA primario "Registrar orden de la EPS".
- **Formulario** (tarjeta base, en la misma vista): Medicamento * (`<select>` con los planes sin reclamo, `appearance-none` + `ChevronDown`) · Primer reclamo * (fecha nativa + `Calendar`) y Meses de la orden * (`Stepper` 1–24, por defecto 6) en `grid-cols-2` · (sin texto de ayuda) · "Guardar orden" (A, icono `CalendarCheck`) + "Cancelar" (B).
- **Tarjeta de reclamo** (tarjeta base `space-y-4`, **sin divisor bajo el encabezado**). **Regla común de las tarjetas**: los divisores internos respetan el padding de la tarjeta; ninguno llega al borde. Proporciones tomadas de la referencia: todo más contenido que en la tarjeta de plan.
  - Encabezado: nombre `text-xl font-bold`, dosis `text-sm text-gray-500`; a la derecha editar (`Pencil`, "Editar la orden de …") y quitar (`Trash2`, "Quitar el reclamo de …"), que pide confirmación con `ConfirmDialog` ("¿Quitar el reclamo de Losartán?" · "Se borrarán la orden de la EPS y su historial de entregas. El plan y sus tomas no cambian. No se puede deshacer." · "Sí, quitar").
  - **Píldora de estado** `text-[13px] font-bold rounded-full px-3 py-1 border`, **solo cuando ya se puede reclamar** (aparece junto con el botón): menta (`bg-[#d0f8ed] text-[#0b8f75]`) para *Hoy toca reclamar*. **Con atraso** no va píldora sino el **aviso ámbar** del banner de "Revisa el plan" (`bg-amber-50 border border-amber-200/80 p-3.5 rounded-2xl text-xs`, ícono `Info` `text-amber-600`, texto `font-medium text-amber-800`, sin X): *Reclamo atrasado, quedan N días antes de que pierdas la oportunidad* / *Reclamo atrasado, hoy es el último día antes de que pierdas la oportunidad*. "Mañana" no lleva píldora (lo avisan el recuadro del Horario y el punto de la pestaña).
  - **Caja de datos** `bg-gray-50 rounded-2xl border border-[#E2E8F0]`, **siempre en dos columnas** (como la referencia) separadas por `w-px bg-[#E2E8F0]`, la de la fecha más ancha. Etiqueta `text-xs font-medium uppercase tracking-wide text-gray-500` ("Próxima entrega", o "Reclamar hasta" con la ventana abierta · "Entrega") y valor `font-bold whitespace-nowrap` ("21 de octubre" · "4 de 4"). **Desde 380px**: `px-4 py-3.5`, columnas `flex-[3]`/`flex-[2]`, `mx-4`, valor `text-[15px]`. **Por debajo**: `px-3 py-3`, columnas `flex-[2]`/`flex-1`, `mx-3`, valor `text-sm`, y la tarjeta pasa a `p-4`. Probado con el caso más largo ("Reclamar hasta · 30 de septiembre", "12 de 24") a 320, 360, 379 y 386px.
  - "Marcar como reclamada" (**D, secundario menta**, `CheckCircle2`) **solo** cuando la ventana está abierta. El primario de la pantalla es "Registrar orden de la EPS".
  - **Historial** sin línea divisoria (la caja de datos ya lo separa; `pt-1`): etiqueta `text-xs font-bold uppercase tracking-wider text-gray-700` y una línea `text-sm` por entrega pasada (`space-y-1.5`): "Entrega 1:" en `font-medium text-gray-800` + fecha completa `text-gray-500` ("21 de julio de 2026") o "Perdida" en `font-semibold text-red-500`.
  - Orden terminada: caja `bg-gray-50 rounded-2xl border` "La orden terminó… pide una orden nueva al médico" + "Registrar orden nueva" (D).
- **Editar / renovar**: el formulario aparece **en el lugar de la tarjeta**, con el medicamento fijo (`<select>` deshabilitado). Editar conserva los reclamos hechos; "Registrar orden nueva" empieza una orden vacía. El formulario de "Registrar orden de la EPS" (nuevo) va arriba de la lista.
- Orden de las tarjetas: la próxima fecha primero; las terminadas al final.
- **Estado vacío**: sin planes, el común (`EmptyState`, §9) "No tienes pastas" + "Crear plan"; con planes sin orden, tarjeta neutra "Ninguna pasta por reclamar" (sin botón: arriba está "Registrar orden de la EPS").

### Perfil (`PerfilView`)
- **Sin `Header`**: la foto y el nombre ya encabezan la vista (no se repiten).
- Los campos viven en `ProfileFields.tsx` (`ProfilePhoto`, `ProfileBasicFields`, `ProfileMedicalFields`, `NotificationSettings`, `SectionTitle`) y los comparten Perfil y "Nuevo perfil". Sin foto, el círculo muestra la silueta `User` gris (`bg-gray-100 text-gray-400`).
- **Notificaciones** (`NotificationSettings` en `ProfileFields.tsx`, paso 3 de "Nuevo perfil" y Perfil; se aplica al instante). Estilo de los ajustes de Android (referencia): filas `py-4` separadas por `divide-y divide-[#E2E8F0]`, cada una con título `text-base font-semibold text-gray-900`, debajo el valor `text-sm font-semibold` en `text-[#0bc4a0]` (gris `text-gray-400` si está apagado), una línea vertical `w-px h-9 bg-gray-200 mx-4` y el interruptor `w-14 h-8` a la derecha. **No hay fila de "Recordatorios"**: son parte básica de la app y siempre están activos (2026-11-04). Dos filas:
  1. **Sonido** · el nombre del sonido elegido sin extensión o "Sonido de A Tiempo". **Tocar el texto abre los sonidos y la música del celular** (`accept="audio/*"`; en nativo, el selector de tonos de Android); al escoger, suena 10 s y el interruptor se enciende. Con uno elegido, debajo, botón de texto "Usar el sonido de A Tiempo". Errores (no es audio, más de 20 MB) en rojo bajo la fila. Apagado: la alarma solo se ve y vibra.
  2. **Vibración** · "Al sonar la alarma" / "Apagada" (`navigator.vibrate`, tres pulsos; al encenderla, una vibración corta de prueba; en iPhone no vibra).
- **"Crea tu cuenta"** (`AccountScreen`, pantalla completa como "Nuevo perfil", sin título de pantalla ni tarjeta): va **después del splash y antes de "Nuevo perfil"**, sin contraseña. Paso correo: título de sección "Tu correo", campo **Correo electrónico *** (`type="email"`, icono `Mail`, placeholder "Ej.: ana@gmail.com"), ayuda `text-sm text-gray-500` "Te enviaremos un código de 6 números. No necesitas contraseña." y primario "Enviarme el código". Paso código (header "Escribe el código", flecha "Cambiar el correo"): "Lo enviamos a **correo**" (`break-all`), campo **Código de 6 números ***: **seis cuadros** en `grid grid-cols-6 gap-2` (cada uno `h-14 rounded-2xl border-gray-200 text-center text-2xl font-bold`, `inputMode="numeric"`, `aria-label` "Número N de 6"; el primero con `autoComplete="one-time-code"`). Al escribir, el foco pasa al siguiente; Borrar en un cuadro vacío vuelve al anterior; **pegar el código (o que el teléfono lo sugiera) llena los seis**, aunque venga con texto o espacios ("Tu código es 739 214"). Solo acepta números; con el error, los cuadros vacíos se marcan en rojo, botón de texto "Reenviar el código" (`text-sm text-[#0bc4a0]`, gris y deshabilitado con cuenta regresiva de 30 s) y primario "Continuar". **Provisional hasta Supabase:** aviso ámbar "Versión de prueba: todavía no enviamos el correo. Escribe cualquier código de 6 números."
- **"Nuevo perfil"** (`ProfileCreateScreen`, pantalla completa como "Reclamo en la EPS"): tres pasos que son las tres secciones del Perfil, "Paso N de 3" bajo el título. Cada paso, **sin título de pantalla, sin bajada y sin tarjeta**: solo el título de sección (punto acento) y sus campos directo sobre el fondo (`space-y-5`; en el paso 1, la foto arriba) y, al final de la pantalla (`mt-auto`), un solo primario "Siguiente" (en el último, "Crear perfil" con `Check`). Va después de "Crea tu cuenta" cuando aún no hay perfil, así que **no hay "Cancelar"** y la flecha solo aparece desde el paso 2 (vuelve al anterior sin perder lo escrito). Solo el nombre es obligatorio. Al terminar entra al Horario, en estado vacío hasta el primer plan.
- Formulario de borrador local que se aplica con "Guardar cambios" (primario A con `Check`, debajo `role="status"` "Cambios guardados" en `text-xs text-[#0bc4a0]`). Debajo, **"Borrar todo y empezar de nuevo"** (secundario B con `Trash2`), que pide confirmación con `ConfirmDialog` ("¿Borrar todo?" · "Se borrarán la cuenta, el perfil, los planes, las tomas marcadas y las órdenes de la EPS de este teléfono. No se puede deshacer." · rojo "Sí, borrar todo") y deja la app como recién instalada: vuelve a "Nuevo perfil".
- Tres tarjetas base (`space-y-4`), cada una con **título de sección**: punto `w-2 h-2 rounded-full bg-[#0ee5ba]` + `text-[13px] font-bold tracking-wider text-gray-900 uppercase`.
  1. **Foto + Información básica**: foto `w-28 h-28 rounded-full border-4 border-white ring-1 ring-[#E2E8F0]` con botón de cámara `w-10 h-10` abajo a la derecha (input de archivo `sr-only` con `aria-label`); nombre `text-xl font-bold font-heading`. Campos: nombre completo, fecha de nacimiento, sexo, teléfono, con iconos `User`/`Calendar`/`ChevronDown`/`Phone` a la derecha.
  2. **Información médica**: `grid grid-cols-2 gap-3` con peso (`kg`) y estatura (`m`) como sufijo `text-sm text-gray-400`, grupo sanguíneo y factor RH en `<select>`.
  3. **Notificaciones**: tarjeta sin padding con el título en `px-5 pt-5 pb-4` **sin línea debajo** y `NotificationSettings` en `px-5 pb-5` (ver arriba).
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
- Campos en orden: Nombre del medicamento * · Descripción breve · **Pastillas por toma *** y **Mg por pastilla** (dos steppers; la unidad sale de la dosis: "Cápsulas por toma", "Mg por cápsula") · Hora de toma inicial * · Desde / Hasta · Frecuencia * (stepper "Cada N" + `<select>` horas/días, con la vista previa de las horas que resultan en `text-xs text-[#0bc4a0] font-semibold`: "Tomas: 08:00 AM · 04:00 PM · 12:00 AM", "(el horario cambia cada día)" si la frecuencia no divide el día, "Toma: 08:00 AM, cada 2 días" en días; si Hasta es antes de Desde, error "La fecha final no puede ser antes del inicio") · Indicaciones especiales (`textarea rows={3} resize-none`) · "Guardar plan".
- **Dosis**: se guarda como texto `"N pastillas • X mg"` (mg opcional; los mg suben de 50 en 50). Si la dosis que llega no se cuenta por pieza (ml, gotas…), el campo cae a texto libre para no falsearla.
- **Plan nuevo en dos pasos** (también el escaneado): bajo el título, "Paso 1 de 2" (`text-xs text-gray-500`) y el botón dice **"Siguiente"**. Paso 2, **"Reclamo en la EPS"** (`PlanClaimStep`, "Paso 2 de 2", la flecha vuelve al paso 1 sin perder lo escrito): nombre del medicamento (`text-xl font-bold`) con "Así te recordamos cada mes cuándo reclamarlo.", campos **Lo reclamaste *** (fecha, por defecto hoy, no futura) y **Meses de la orden *** (stepper 1–24, por defecto 6), nota verde "La entrega 1 quedará marcada como reclamada.", y al final de la pantalla (`mt-auto`) primario "Guardar plan" y secundario gris "Cancelar", que descarta el plan nuevo. Editar un plan no tiene paso 2: guarda directo con "Guardar plan".

## 8. Navegación

- **Header**: `bg-white px-5 py-4 border-b border-gray-100 sticky top-0 z-10`. Avatar `w-[50px] rounded-full border-2 border-[#0ee5ba]/20` (sin foto, silueta `User` en `bg-gray-100 text-gray-400`), **solo el primer nombre** del perfil `text-[19px] font-bold`, y la **fecha de hoy** ("Martes, 3 de noviembre", `es-CO`, con el reloj de App) `text-[14px] text-[#0bc4a0] font-semibold`. Se muestra en Horario, Mis planes y Pastas; **no en Perfil**.
  **Campana**: indicador, **no botón** (`role="img"`), siempre `text-[#0bc4a0] bg-[#d0f8ed]` porque los recordatorios siempre están activos; punto `w-2.5 h-2.5 bg-[#ff5f56] ring-2 ring-white animate-pulse` si hay tomas pendientes; `aria-label` "Recordatorios activos: N tomas pendientes".
- **BottomNav**: `bg-white border-t border-gray-200 px-2 py-2 fixed bottom-0 z-30` + envelope. Botones `py-2 px-0.5`; píldora `px-4 py-1 rounded-full` + label `text-[11px] font-semibold whitespace-nowrap`. Activa `bg-[#d0f8ed] text-[#0bc4a0]`, inactiva `text-gray-400`/`text-gray-500`.
  **Tiene cuatro botones `w-1/4`**: Horario · Mis planes · **Pastas** · Perfil. Los botones temporales (Empty states, Crear perfil, Reclamo, Splash) se quitaron el 2026-11-03: ahora esas pantallas salen en el flujo real. La pestaña **Escanear se quitó** (2026-10-14): escanear se abre desde "Nuevo plan" en Mis planes y desde los estados vacíos, siempre con "Omitir y llenar a mano" al lado.
  - **Pastas** (icono `Pill`) lleva punto `w-2.5 h-2.5 bg-[#ff5f56] ring-2 ring-white motion-safe:animate-pulse` cuando hay que reclamar hoy, mañana o hay atraso; su `aria-label` cambia a "Pastas: hay un reclamo pendiente".

## 9. Overlays

### Alarma (`AlarmShell` + `ReminderAlert` / `ClaimAlert`) — la pantalla más importante de la app
Aparece sola; debe leerse de lejos y resolverse con un toque. `AlarmShell` pone el fondo y las ondas (y la píldora en las versiones 2 y 3); `ReminderAlert` (toma) y `ClaimAlert` (reclamo en la EPS) ponen textos y botones. Compartido en `AlarmShell.tsx`: `ALARM_PRIMARY_BUTTON`, `ALARM_SECONDARY_BUTTON`, `SnoozeControl`, `ALARM_TEXT`, `alarmNameSize`.

**La alarma real es la versión 4** (desde 2026-10-22), en toma y en reclamo:
- Pantalla completa `fixed inset-0 z-50` + envelope, `px-6 pt-16 pb-10`, todo en Nunito Sans (`font-heading` en la raíz). Fondo `radial-gradient(circle at 50% 35%, #2ee6cc 0%, #10d2b8 30%, #00bfa8 62%, #00a693 100%)`. **Sin píldora, sin hora arriba, sin anillos estáticos**: el bloque de texto queda al centro.
- **Ondas** `.alarm-wave-line` en una capa de fondo a pantalla completa centrada en el texto (posición medida con `ResizeObserver`): nacen a 300px alrededor del texto (`TEXT_WAVE_START_PX`) y crecen hasta la esquina más lejana. Sale una cada **0.8 s** (`WAVE_GAP_S`), cada una tarda **8 s** (`WAVE_DURATION_S`, igual que el CSS), diez en total, 2–3 visibles; opacidad 0.9 → 0.4 → 0.1 → 0, invisibles desde el 70 %. Línea blanca de borde 5px que ya nace del tamaño final y **solo anima `transform: scale` + `opacity`** (animar `width`/`height` las hacía intermitentes con el tiempo); medido a 61 fps. `pointer-events-none`; con "reducir movimiento" no se ven.
- **Escala de texto común** (`ALARM_TEXT`), igual en toma y reclamo (2026-10-22: un 10 % más pequeña que la primera versión):
  | Rol | Toma | Reclamo | Clases |
  |---|---|---|---|
  | Cuándo (solo reclamo) | — | "HOY" / "MAÑANA" / "AÚN" | `text-[1.26rem] font-extrabold uppercase tracking-wide text-[#0f5a4e]` |
  | Línea blanca | "1 pastilla - 850 mg" | "22 de octubre" | `text-[1.17rem] font-bold text-white` |
  | Etiqueta | "Toma:" | "debes reclamar:" | `text-[1.125rem] font-medium text-[#0f5a4e]` |
  | Nombre | Metformina | Metformina | `text-[2.25rem] font-extrabold text-[#0f5a4e]` (`text-[1.8rem]` si tiene más de 13 letras: `alarmNameSize`) |
  | Nota | indicación del plan | "Entrega 3 de 6" | `text-[0.9rem] font-medium text-white`, `max-w-[17rem]` (14.4px: no bajar más) |
- **Orden y espacios.** Toma: "Toma:" → 4px → nombre → 8px → dosis → 8px → indicación. Reclamo (estructura de la referencia): "HOY" → 8px → fecha del día en que debe reclamar → 8px → "debes reclamar:" → 4px → nombre → 8px → "Entrega 3 de 6".
- **Botones** grandes y del mismo alto (`py-4 rounded-full text-[1.1rem] font-bold`, `gap-3`):
  - Primario blanco con texto `#009688`, icono `CheckCircle2 w-6`, sombra `shadow-[0_10px_30px_-8px_rgba(0,70,64,0.35)]`: "Marcar como tomada" (toma) · "Ya lo reclamé" (reclamo hoy o atrasado) · "Entendido" (reclamo la víspera, todavía no se puede reclamar).
  - **Posponer** (`SnoozeControl`): `[ − ] Recordar en N min [ + ]`, círculos `w-12 h-12 bg-[#00695e]/30` con `Minus`/`Plus` `w-6` a los lados (`gap-2.5`) y botón central `bg-[#00695e]/30` blanco, sin icono y **siempre en una línea** (`whitespace-nowrap`; por debajo de 380px letra `text-base` y `gap-1.5`, para que "Recordar en 12 horas" quepa a 320px). En la toma va **de 5 en 5 minutos, de 5 a 60**: el "−" se desactiva (`opacity-40`) en 5 y el "+" en 60; la app pospone exactamente esos minutos (`snooze(minutes)`). En el reclamo, "Recordar en N horas" de 1 en 1 (1–12, por defecto 2).
- **Obligatorio**: `role="alertdialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`.

**Tono de color** (`tone` en `AlarmShell`, **en prueba desde 2026-10-23**): para distinguir a simple vista los dos avisos, el de reclamo usa `tone="reclamo"` (azul `#19CDFF`; antes rosado) y el de toma `tone="toma"` (el verde de siempre). Mismo diseño; solo cambian variables CSS en la raíz de la alarma: `--alarm-ink` (textos oscuros), `--alarm-action` (texto del botón blanco), `--alarm-soft` / `--alarm-soft-hover` (posponer y sus − / +) y el fondo.
| Tono | Fondo | `--alarm-ink` | `--alarm-action` | `--alarm-soft` |
|---|---|---|---|---|
| toma | radial `#2ee6cc` → `#00a693` | `#0f5a4e` | `#009688` | `rgba(0,105,94,.3)` |
| reclamo | radial `#52dcff` 0% → `#19cdff` 30% → `#08b4ea` 62% → `#0597cc` 100% (mismos puntos del degradado que el verde) | `#063a55` | `#0790c4` | `rgba(3,72,112,.32)` |

**Pruebas**: ya no hay alarmas de prueba (se borraron `isTest`, `TEST_MEDICATION` y `buildTestClaim` el 2026-11-03). Para ver una alarma hay que crear un plan real cuya toma o reclamo toque.

**Versiones que quedan en el código sin botón** (para comparar si hace falta): la **2** es la 4 con la píldora (disco sólido `w-[110px] bg-[#00e5cf] border-white/50` en un contenedor `w-[210px]`) y ondas `.alarm-wave` que animan tamaño y borde (2.5px → 1px); la **3** es la 2 con otro fondo (`radial-gradient(circle at 50% 32%, #0cdbc9 0%, #01bcae 42%, #009d90 100%)` + 4 manchas cálidas `blur-3xl` + grano SVG `opacity-40 mix-blend-overlay`) y ondas `.alarm-wave-soft` de luz difusa (solo `transform`/`opacity`). La versión 1 se eliminó el 2026-10-14.

### Confirmación destructiva (`ConfirmDialog`)
Antes de eliminar un plan (Mis planes), de quitar un reclamo (Pastas) y de "Borrar todo" (Perfil). Overlay `fixed inset-0 z-50 bg-black/60 backdrop-blur-sm` + envelope; tarjeta base `p-6 text-center space-y-5`; icono `Trash2 w-6` en círculo `w-14 h-14 bg-red-50 text-red-500`; título `text-xl font-bold font-heading` con el nombre ("¿Eliminar Metformina?"); mensaje `text-sm text-gray-500` que dice **qué se pierde** (si el plan tiene orden de la EPS, también el historial de reclamos) y "No se puede deshacer". Botones: destructivo `bg-red-500 hover:bg-red-600 text-white` con la forma de §3 ("Sí, eliminar") y secundario B "Cancelar". El foco arranca en "Cancelar"; Escape o tocar fuera cancelan. `role="alertdialog"` + `aria-modal` + `aria-labelledby` + `aria-describedby`.

### Otras
- **`LoadingScreen`**: fondo `#f8f9fa`, título "Creando plan…" + 4 pasos en círculos `w-6 h-6`; hecho = acento + `Check` y texto `line-through opacity-80`, actual = acento 20% + `Loader2 animate-spin` en `font-bold`, futuro = `bg-gray-100 text-gray-400` con el número.
- **`CameraScanScreen`**: negro con barras `bg-black/80 backdrop-blur-md`. Marco `max-w-[280px] aspect-[4/3] border-2 border-[#0ee5ba] rounded-2xl shadow-[0_0_20px_rgba(14,229,186,0.3)]` con esquinas `border-4` y línea `animate-ping`. Sin cámara: visor simulado **con el motivo exacto del error** en `text-[11px] text-amber-400/90`. Nunca dejes al usuario sin explicación.
- **Splash** (`SplashScreen`, `z-50`, pantalla completa con el envelope): degradado lineal `172deg` `#00c4a7` 0% → `#0bc9cf` 45% → `#19cdff` 85% (del verde de la toma al azul de los reclamos), cinco anillos concéntricos centrados `border border-white/20` de 74/121/169/216/264 % del ancho, y al centro, en blanco `font-heading`, la pastilla del diseño (SVG propio de `svg pill.svg` en línea, 38px, trazo 3, `currentColor`) en un círculo `w-[90px] h-[90px] rounded-full bg-white/15` y debajo (`mt-6`) "A tiempo" en una línea, `text-[2.4rem] font-light tracking-tight` (por eso `index.html` carga también el peso 300 de Nunito Sans). Toda la pantalla es un botón (`aria-label` "A tiempo. Toca para continuar"). **Sale cada vez que se abre la app**, encima de todo, y sigue sola a los 2 s (o al tocarla): sin cuenta va a "Crea tu cuenta"; sin perfil, a "Nuevo perfil"; con los dos, al Horario.
- **"Hoy no hay tomas"** (Horario con planes pero sin tomas ese día: cada 2 días, aún no empieza o ya terminó): tarjeta neutra como "Ninguna pasta por reclamar" (`bg-white rounded-3xl p-8 border-gray-100`, icono `CalendarCheck` en círculo gris `w-16 h-16`), título `text-lg font-bold` y "Ningún plan tiene tomas para hoy. Puedes revisarlos en Mis planes.", sin botón. No es el estado vacío.
- **Estados vacíos** (`EmptyState`, sin planes): uno solo para Horario, Mis planes y Pastas, **sin tarjeta**: directo sobre el fondo y **centrado en el alto que queda** (`main` y la vista son `flex flex-col`; el estado vacío es `flex-1 justify-center`), ícono de vacío `PackageOpen` (caja abierta, `w-10 h-10 strokeWidth 1.75`) en círculo gris `w-20 h-20 bg-gray-100 text-gray-400`, título `text-xl font-bold font-heading` ("No tienes un horario" / "No tienes un plan" / "No tienes pastas"), bajada `text-sm text-gray-500` "Por favor créalo aquí para empezar." y un solo primario ancho completo **"Crear plan"** (`Plus`), que abre el escáner (allí sigue "Omitir y llenar a mano").

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
3. **Las versiones 2 y 3 de la alarma siguen en el código** sin botón; la 2 anima tamaño en sus ondas (`.alarm-wave`). Si se descartan, borrarlas junto con su CSS.
4. **`motion` v12 instalado y sin usar**: todas las animaciones son Tailwind o CSS propio. O se usa, o sale de `package.json`.
5. **Dos escalas tipográficas** conviviendo (Tailwind + px arbitrarios), más la propia de la alarma. Funciona; si crece, consolidar.
6. **`--color-success` (`#27c93f`)** sigue en `src/index.css` sin uso desde que el Perfil dejó de mostrar "Perfil activo".

Bugs de contenido (fecha inventada en el `Header`, etc.) y los botones temporales de alarma viven en `state/current.md`, no aquí.
