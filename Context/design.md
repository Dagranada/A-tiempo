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
| Canvas | `#f8f9fa` | Fondo de la app |
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
| Cámara | `#000` + `white/10` | Único contexto oscuro |

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

- **Tarjeta de plan** (`MisPlanesView`): base + `space-y-3.5 hover:border-gray-200`, acciones rápidas en el encabezado, detalles en `grid grid-cols-2 gap-2 text-xs`, e instrucciones en `bg-[#fafafa] p-2.5 rounded-xl border border-gray-200 text-xs italic`.
- **Fila de opción** (`PerfilView`): tarjeta base sin padding + `overflow-hidden`, filas `p-4 hover:bg-gray-50/80 border-b`, icono en círculo `w-12 h-12 bg-gray-50`, `ChevronRight` a la derecha.

## 7. Formularios (`PlanFormScreen`)

```tsx
// Input estándar — rounded-2xl, NO rounded-full: los campos no son botones
"w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 h-12 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba] transition-all flex items-center"
```
- Error: borde `border-red-500` + `<p className="text-xs text-red-500 mt-1 font-medium">`. Se limpia al escribir, no al reenviar. Mensajes en imperativo amable ("Ingresa el nombre del medicamento").
- Etiqueta encima (§4) con `*` si es obligatorio. Placeholders con ejemplos reales: `"Ej.: 1 pastilla • 500mg, 10ml"`. Campos separados `space-y-5`; fechas Desde/Hasta en `grid grid-cols-2 gap-3`.
- **Hora y fechas**: el indicador nativo se estira invisible sobre el campo (`[&::-webkit-calendar-picker-indicator]:opacity-0 ... inset-0 w-full h-full`) para que **todo el campo sea táctil**, no solo el iconito.
- **Banner de sugerencia IA**: `bg-amber-50 border border-amber-200/80 p-3.5 rounded-2xl text-xs`, cerrable. La IA nunca guarda sola: prellena y la persona confirma.

## 8. Navegación

- **Header**: `bg-white px-5 py-4 border-b border-gray-100 sticky top-0 z-10`. Avatar `w-[50px] rounded-full border-2 border-[#0ee5ba]/20`, nombre `text-[19px] font-bold`, fecha `text-[14px] text-[#0bc4a0] font-semibold`.
  **Campana** con dos estados: activa `text-[#0bc4a0] bg-[#d0f8ed]` · inactiva `text-gray-500 hover:bg-gray-50`; punto `w-2.5 h-2.5 bg-[#ff5f56] ring-2 ring-white animate-pulse` si hay tomas pendientes; `aria-label` que cambia con el estado.
- **BottomNav**: `bg-white border-t border-gray-200 px-2 py-2 fixed bottom-0 z-30` + envelope. Cuatro pestañas `w-1/4`: píldora `px-4 py-1 rounded-full` + label `text-[11px] font-semibold`. Activa `bg-[#d0f8ed] text-[#0bc4a0]`, inactiva `text-gray-400`/`text-gray-500`.
  **Excepción "Escanear"**: acento sólido `bg-[#0ee5ba] text-gray-950 scale-105`, porque es la acción principal de la app y no una vista más.

## 9. Overlays

- **`ReminderAlert` — la pantalla más importante de la app.** Aparece sola; debe leerse de lejos y resolverse con un toque.
  Overlay `fixed inset-0 z-50 bg-black/60 backdrop-blur-sm` + envelope; tarjeta base con `p-8 text-center space-y-5`; icono `w-20 h-20 bg-[#d0f8ed] rounded-full shadow-inner` con punto de urgencia; título `text-2xl font-extrabold`; **medicamento y dosis en `font-bold text-gray-900`** dentro del cuerpo gris; píldora de hora; y dos acciones apiladas (primaria + secundaria).
  **Obligatorio**: `role="alertdialog"`, `aria-modal`, `aria-labelledby`.
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
