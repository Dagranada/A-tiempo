# Design System — A Tiempo

Fuente de verdad visual. Documenta lo que la app ya hace: si cambias un componente, actualiza aquí.
Los bloques de clases son **canónicos** (cópialos tal cual). Lo demás describe el patrón y apunta al componente.
Revisado 2026-08-22 contra el código.

## 1. Principios
- **Legibilidad para adultos mayores** por encima de todo: texto grande, contraste alto, áreas táctiles amplias.
- **Homogeneidad**: misma altura, radio y peso para toda acción principal, en todos los flujos.
- **Jerarquía por peso, no por color.** El color acentúa; el rojo se reserva para lo destructivo o urgente.
- **Todo estado resuelto**: vacío, cargando, error y lleno están diseñados. Ninguna pantalla queda en blanco.
- **Envelope de teléfono** también en desktop: la app nunca se estira a pantalla completa.

## 2. Paleta

| Token | Valor | Uso |
|---|---|---|
| Acento | `#0ee5ba` | CTA primario, anillo de foco, marco de cámara, pestaña "Escanear" activa |
| Acento oscuro | `#0bc4a0` | Hover del primario; iconos y texto sobre fondo menta |
| Menta suave | `#d0f8ed` | Píldora de nav activa, círculos de icono, check de toma hecha |
| Canvas | `#f8f9fa` | Fondo de las pantallas (envelope y pantallas completas). Barra superior y `BottomNav` siguen en blanco |
| Superficie | `#ffffff` | Tarjetas y barras |
| **Borde estándar** | `#E2E8F0` | El borde de la app: tarjetas, divisores, píldoras |
| Borde suave | `gray-100` / `gray-200` | Barras superiores, inputs, estados vacíos |
| Hundido | `#fafafa` / `gray-50` | Cajas de instrucciones, píldoras informativas |
| Texto | `#1b1c1c` / `gray-900` · `gray-500`/`600` | Principal · secundario |
| Éxito | `#27c93f` | Check "Perfil activo" (relleno sólido + `stroke-white`) |
| Urgencia | `#ff5f56` | Punto pulsante: campana con pendientes, icono de `ReminderAlert` |
| Error | `red-500` | Borde y mensaje de validación |
| Destructivo | `red-500` + `hover:bg-red-50` | Solo eliminar plan |
| Aviso IA | `amber-50` / `amber-200/80` / `amber-800` | Banner "esto es una sugerencia" |
| Cámara | `#000` + `white/10` | Contexto oscuro de la cámara |
| Alarma | radial `#22e3c8` → `#02897a` + blanco; acción `#009688` | Solo `ReminderAlert` |

También como variables en `src/index.css`. Color huérfano pendiente: ver §11.

## 3. Botones — especificación única

```tsx
// A. Primario — "Guardar plan", "Listo", "Tomar foto", "Listo, ya la tomó"
"w-full bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 px-5 rounded-full text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2"

// B. Secundario — "Crear a mano", "Omitir y llenar a mano", "Recordar en 5 minutos"
"w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-full text-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5"

// C. Secundario sobre cámara
"w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-5 rounded-full text-sm transition-all border border-white/10 active:scale-[0.98] flex items-center justify-center space-x-2"
```
- **Invariantes**: `py-2.5 px-5` · `rounded-full` · `text-sm font-bold` · `active:scale-[0.98]`.
- **Botón de icono** (barra): `p-2 rounded-full hover:bg-gray-100 text-gray-600` (claro) o `bg-white/10 text-white hover:bg-white/20` (oscuro). `aria-label` obligatorio.
- **Acción rápida en tarjeta** (`w-4 h-4`): editar `text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100` · eliminar igual pero `hover:text-red-500 hover:bg-red-50`.
- **Iconos**: solo `lucide-react`. `w-4` en línea · `w-5` en CTA y barras · `w-6` campana · `w-10` círculos de estado.

## 4. Tipografía

**Nunito Sans** para todo, por legibilidad (`Inter` solo en encabezados de sección del horario).

| Rol | Clases |
|---|---|
| Título de pantalla | `text-2xl font-extrabold text-gray-900 font-heading` |
| Título de sección/tarjeta | `text-xl font-bold font-heading` · `text-lg font-bold` |
| Encabezado de lista | `text-[13px] font-bold tracking-wider text-gray-500 uppercase font-inter` |
| Nombre de medicamento | `text-[18px] font-bold text-gray-900` |
| Hora grande | `text-[22px] font-bold leading-none` (pendiente) · `font-medium text-gray-600` (próxima) |
| Etiqueta de campo | `text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5` |
| Detalle | `text-xs`/`text-[13px]`/`text-[14px]` `text-gray-500 font-medium` |
| Label de nav | `text-[11px] font-semibold` |

Escala mixta (Tailwind + px arbitrarios). Reutiliza uno de estos valores; no introduzcas otro.

## 5. Layout

```tsx
// Envelope — lo repite TODA pantalla completa y barra fija, o se desalinea en desktop
"w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl"
```
- Contenedor raíz: envelope + `bg-[#f8f9fa] min-h-screen flex flex-col shadow-2xl border-x border-gray-200`.
- Barras fijas: envelope + `left-1/2 -translate-x-1/2`.
- Vistas: `px-5 py-6`, secciones `space-y-6`/`7`, y **`pb-28` obligatorio** o la `BottomNav` tapa la última tarjeta.
- Capas: contenido/header sticky `z-10` → `BottomNav` `z-30` → pantallas completas y alertas `z-50`.

## 6. Tarjetas

```tsx
// Tarjeta base (plan, toma pendiente, alerta, opciones de perfil)
"bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm"
```

**Principio rector:** lo pendiente es una tarjeta con acción; lo hecho es una fila sin acción. La jerarquía visual baja a medida que la toma deja de requerir atención.

| Estado | Tratamiento (`HorarioView`) |
|---|---|
| **Pendiente** | Tarjeta base + `hover:shadow-md`. Columna de hora `w-20 border-r border-[#E2E8F0] pr-4` con hora `text-[22px] font-bold` y meridiano debajo; detalle en `pl-4 flex-1`; CTA primario ancho completo abajo (`mt-3`). |
| **Próxima** | Igual, atenuado: `shadow-[0_2px_8px_rgba(0,0,0,0.02)] opacity-90`, columna de hora `opacity-70` en `font-medium text-gray-600`, **sin CTA**. Píldora de aviso si hay `nextTakeNotice`. |
| **Ya tomada** | No es tarjeta: fila `py-3` separada por `border-b border-[#E2E8F0]`, check `text-[#0bc4a0] bg-[#d0f8ed] p-1.5 rounded-full`, y hora real en píldora gris a la derecha. |

```tsx
// Píldora informativa (hora programada, próxima toma)
"bg-gray-50 text-gray-600 text-[13px] font-medium rounded-full flex items-center justify-center space-x-2 border border-[#E2E8F0] py-2"
```

- **Tarjeta de plan** (`MisPlanesView`): base + `space-y-4`. Nombre `text-[18px] font-bold`, descripción `text-sm text-gray-500`, encabezado separado del resto con un divisor igual al borde de la tarjeta, de lado a lado (`-mx-5 px-5 pb-4 border-b border-[#E2E8F0]`); editar/eliminar `p-2` con iconos `w-5`. Detalles en `<dl>` de filas `flex justify-between text-sm`: etiqueta `text-gray-500`, valor `font-bold text-gray-900` a la derecha (Dosis · Frecuencia · Hora inicial en 12 h · Vigencia "1 Feb 2026 – 1 Ago 2026"). Instrucciones en `bg-gray-50 px-4 py-3 rounded-2xl text-sm text-gray-600`, sin borde ni itálica.
- **Perfil** (`PerfilView`): **sin `Header`** (la foto y el nombre ya encabezan la vista). Formulario en tarjetas base (`space-y-4`). Cada tarjeta abre con un **título de sección**: punto `w-2 h-2 rounded-full bg-[#0ee5ba]` + `text-[13px] font-bold tracking-wider text-gray-900 uppercase`. Campos con los mismos inputs, etiquetas e iconos derechos que `PlanFormScreen` (§7); unidades `kg`/`m` como sufijo `text-sm text-gray-400`. Foto `w-28` con botón de cámara `w-10` abajo a la derecha (input de archivo `sr-only`).
- **Interruptor** (recordatorios): `role="switch"` + `aria-checked`, pista `w-14 h-8 rounded-full` (`bg-[#0ee5ba]` encendido · `bg-gray-200` apagado), perilla `w-6 h-6 bg-white shadow-sm`. Se aplica al instante, sin esperar a "Guardar cambios"; el copy no promete vibración ni avisos con la app cerrada.

## 7. Formularios (`PlanFormScreen`)

```tsx
// Input estándar — rounded-2xl, NO rounded-full: los campos no son botones
"w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 h-12 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba] transition-all flex items-center"
```
- Error: borde `border-red-500` + `<p className="text-xs text-red-500 mt-1 font-medium">`. Se limpia al escribir, no al reenviar. Mensajes en imperativo amable ("Ingresa el nombre del medicamento").
- Etiqueta encima (§4) con `*` si es obligatorio. Placeholders con ejemplos reales: `"Ej.: 1 pastilla • 500mg, 10ml"`. Campos separados `space-y-5`; fechas Desde/Hasta en `grid grid-cols-2 gap-3`.
- **Hora y fechas**: el indicador nativo se estira invisible sobre el campo (`[&::-webkit-calendar-picker-indicator]:opacity-0 ... inset-0 w-full h-full`) para que **todo el campo sea táctil**, no solo el iconito.
- **Stepper numérico** (`Stepper` en `PlanFormScreen`): caja `h-12 rounded-2xl border-gray-200 px-1.5` con `focus-within:ring-2 focus-within:ring-[#0ee5ba]`, botones `w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100` con `Minus`/`Plus` `w-4` y `aria-label` "Disminuir/Aumentar …", valor `text-sm font-medium` como cualquier input (prefijo/sufijo `text-sm text-gray-400`), editable a mano; cada stepper lleva su propia etiqueta de campo (§4), sin subetiquetas. Se usa en dosis (cantidad + mg) y frecuencia ("Cada N").
- **Dosis**: se guarda como texto `"N pastillas • X mg"` (mg opcional). Si la dosis que llega no encaja (ml, gotas…), el campo cae a texto libre para no falsearla.
- **Iconos en campos**: `Clock`/`Calendar`/`ChevronDown` `w-4 text-gray-400 absolute right-4 pointer-events-none` + `pr-10` en el input; el `<select>` usa `appearance-none`.
- **Banner de sugerencia IA**: `bg-amber-50 border border-amber-200/80 p-3.5 rounded-2xl text-xs`, cerrable. La IA nunca guarda sola: prellena y la persona confirma.

## 8. Navegación

- **Header**: `bg-white px-5 py-4 border-b border-gray-100 sticky top-0 z-10`. Avatar `w-[50px] rounded-full border-2 border-[#0ee5ba]/20`, nombre `text-[19px] font-bold`, fecha `text-[14px] text-[#0bc4a0] font-semibold`.
  **Campana** con dos estados: activa `text-[#0bc4a0] bg-[#d0f8ed]` · inactiva `text-gray-500 hover:bg-gray-50`; punto `w-2.5 h-2.5 bg-[#ff5f56] ring-2 ring-white animate-pulse` si hay tomas pendientes; `aria-label` que cambia con el estado.
- **BottomNav**: `bg-white border-t border-gray-200 px-2 py-2 fixed bottom-0 z-30` + envelope. Cinco botones `w-1/5` (Horario · Mis planes · Escanear · **Alarma** · Perfil): píldora `px-4 py-1 rounded-full` + label `text-[11px] font-semibold`. Activa `bg-[#d0f8ed] text-[#0bc4a0]`, inactiva `text-gray-400`/`text-gray-500`.
  **"Alarma" es temporal (2026-10-14)**: no es pestaña, nunca queda activa; dispara la alerta de prueba (`ReminderAlert isTest`, con medicamento ficticio; no marca tomas). Cuando se quite, la nav vuelve a `w-1/4`.
  **Excepción "Escanear"**: acento sólido `bg-[#0ee5ba] text-gray-950 scale-105`, porque es la acción principal de la app y no una vista más.

## 9. Overlays

- **`ReminderAlert` — la pantalla más importante de la app.** Aparece sola; debe leerse de lejos y resolverse con un toque.
  **Pantalla completa** (2026-10-14, copiada del HTML de referencia): `fixed inset-0 z-50` + envelope, fondo `radial-gradient(circle at 50% 32%, #22e3c8 0%, #00c7af 38%, #00a492 72%, #02897a 100%)`, texto blanco, `px-7 pt-12 pb-10`. Hora `text-[1.15rem] font-bold tracking-wider`; píldora (SVG propio `-rotate-45`) en disco `w-[114px] bg-white/[0.22] border-[1.5px] border-white/[0.55]`, **sin halos estáticos**. Animación en `src/index.css` (todo bajo `prefers-reduced-motion: no-preference`): cuatro ondas `.alarm-ripple` con borde blanco brillante y resplandor, cada 1.25 s, en una **capa de fondo a pantalla completa** centrada en el icono (posición medida con `ResizeObserver`): crecen del tamaño del disco hasta la esquina más lejana (`--ripple-max`, se anima `width`/`height` para controlar el borde) en 5 s; el borde se adelgaza 5px → 3px → 1.5px → 1px y la opacidad cae 0.95 → 0.5 → 0.18 → 0 a medida que se alejan; resplandor `.alarm-glow` que late; disco `.alarm-core` que respira (escala 1→1.07 con halo); píldora `.alarm-pill` que vibra como timbre al inicio de cada ciclo (su giro base de -45° vive en el CSS, no en Tailwind, para que la animación no lo duplique). Nombre `text-[1.85rem] font-extrabold`, descripción `text-[0.95rem]`; **todo el texto en blanco puro**. Dosis en caja de vidrio `bg-white/[0.16] backdrop-blur-xl border-[1.5px] border-white/[0.42] rounded-2xl` con celdas sin etiqueta (`1 pastilla | 850 mg`, `text-[1.1rem] font-bold`). Indicaciones como párrafo `text-[0.95rem]` a la izquierda. Primario blanco con brillo, texto `#009688 text-[1.14rem] font-bold py-4`; snooze como botón ancho de fondo verde oscuro suave `bg-[#00695e]/35` (que no compita con el blanco). **Ambos botones siguen la especificación única (§3)**: `py-2.5 px-5 rounded-full text-sm font-bold active:scale-[0.98] space-x-2`, icono `w-5`; conservan sus colores (blanco con texto `#009688` · verde oscuro suave con texto blanco). Toda la alarma va en Nunito Sans (`font-heading` en la raíz), cuyo número sale de `REMINDER_INTERVAL_MS`.
  Variante `isTest`: los textos exactos de la referencia (`TEST_MEDICATION`: 02:00 PM, Metformina, "Control de glucosa en sangre", 1 pastilla · 850 mg, "Tomar con el almuerzo…"). Sus dos botones solo la cierran. Muestra un medicamento real por excepción explícita al invariante 5 (ADR 0006).
  **Obligatorio**: `role="alertdialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`.
- **`LoadingScreen`**: título "Creando plan…" + 4 pasos en círculos `w-6 h-6`; hecho = acento + `Check` y texto `line-through opacity-80`, actual = acento 20% + `Loader2 animate-spin` en `font-bold`, futuro = `bg-gray-100 text-gray-400` con el número.
- **`CameraScanScreen`**: negro con barras `bg-black/80 backdrop-blur-md`. Marco `max-w-[280px] aspect-[4/3] border-2 border-[#0ee5ba] rounded-2xl shadow-[0_0_20px_rgba(14,229,186,0.3)]` con esquinas `border-4` y línea `animate-ping`. Sin cámara: visor simulado **con el motivo exacto del error** en `text-[11px] text-amber-400/90`. Nunca dejes al usuario sin explicación.
- **Estados vacíos**, dos variantes: *invitación* (icono `w-20 h-20 bg-[#d0f8ed]`, en `HorarioView`) y *neutro* (icono `w-16 h-16 bg-gray-100 text-gray-400`, en `MisPlanesView`). Ambos: tarjeta `rounded-3xl p-8 border-gray-100 text-center`, explicación `text-sm text-gray-500 max-w-xs mx-auto` **que nombra a Alberto**, y las dos salidas siempre juntas (escanear + crear a mano).

## 10. Movimiento y accesibilidad

- `active:scale-[0.98]` en todo botón grande: es el único feedback táctil del sistema. `transition-all`/`transition-colors` sin duración explícita.
- Atención: `animate-pulse` en los puntos `#ff5f56`, `animate-ping` en el láser, `animate-spin` en `Loader2`. **Toda animación en bucle nueva lleva `motion-safe:`** (como hace `ReminderAlert`).
- Sin transiciones de entrada/salida de pantalla: los cambios son instantáneos a propósito.

**Checklist antes de cerrar una pantalla:**
1. Botón solo-icono → `aria-label` descriptivo, que cambia si cambia el estado.
2. Overlay modal → `role` + `aria-modal` + `aria-labelledby`.
3. Nada accionable baja de `text-sm`; `text-xs` solo para etiquetas y metadatos.
4. Foco visible (`focus:ring-2 focus:ring-[#0ee5ba]`); si quitas el outline, pon el anillo.
5. La información nunca depende solo del color (la toma hecha tiene check **y** posición **y** hora).
6. El copy habla de acciones concretas ("Listo, ya la tomó"), no de conceptos.

## 11. Deuda del sistema

Cosas que el código hace y **no** deben replicarse:
1. **`#69E1BC` en `LoadingScreen:66,68`** — verde fuera de paleta, visible solo ahí. **Decisión pendiente**: reemplazar por `#0ee5ba` (recomendado) o adoptarlo como token con nombre.
2. **`motion` v12 instalado y sin usar** — todas las animaciones son utilidades de Tailwind. O se usa, o sale de `package.json`.
3. **Dos escalas tipográficas** conviviendo (Tailwind + px arbitrarios). Funciona; si crece, consolidar.

Bugs de contenido (fecha inventada en el `Header`, etc.) viven en `state/current.md`, no aquí.
