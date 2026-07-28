# Design System - App de Gestión de Medicación (Alberto)

Este documento describe el sistema de diseño actualizado y homogenizado para la aplicación móvil y web de gestión de medicación.

---

## 1. Principios de Diseño
- **Accesibilidad y Claridad para Adultos Mayores**: Tipografía legible con excelente contraste, etiquetas claras y botones táctiles diferenciados.
- **Homogeneidad de Interacciones**: Tamaño, relleno (`padding`), grosor de fuente y radios de borde idénticos para todas las acciones principales en todos los flujos de la aplicación.
- **Diseño Responsivo Fluido**: Adaptación progresiva mediante un contenedor central con restricciones dinámicas de ancho máximo (`max-w-md` hasta `max-w-2xl`).

---

## 2. Paleta de Colores

### Colores de Marca y Acento (Menta / Teal)
- **Principal (Primary)**: `#0ee5ba` — Usado en botones primarios, resaltados de navegación y elementos interactivos clave.
- **Principal Hover**: `#0bc4a0` — Estado hover y variante más oscura.
- **Fondo Suave (Light Accent)**: `#d0f8ed` — Usado para insignias, iconos de estado y píldoras activas.

### Neutros y Superficies
- **Fondo General (Canvas)**: `#f8f9fa` — Fondo de pantalla suave e higiénico.
- **Tarjetas y Contenedores**: `#ffffff` — Blanco puro con bordes `#E2E8F0` / `border-gray-200` y sombras suaves (`shadow-sm`).
- **Texto Principal**: `#1b1c1c` / `text-gray-900` — Para títulos y texto destacado.
- **Texto Secundario**: `text-gray-500` / `text-gray-600` — Para detalles, fechas e instrucciones.
- **Modo Oscuro / Escáner de Cámara**: `#000000` con superposiciones translúcidas `bg-white/10` y bordes `border-white/10`.

---

## 3. Estándar Homologado de Botones

Todos los botones grandes de la aplicación comparten una única especificación táctil e iconográfica:

### A. Botón Principal (Primary CTA)
```tsx
className="w-full bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 px-5 rounded-full text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
```
- **Relleno Vertical**: `py-2.5`
- **Radio de Borde**: `rounded-full`
- **Texto**: `text-sm font-bold text-gray-900`
- **Feedback Táctil**: `active:scale-[0.98]`
- **Uso**: "Guardar plan", "Nuevo plan", "Listo" (confirmar toma), "Tomar foto", "Escanear medicamento".

### B. Botón Secundario (Secondary / Alternative CTA)
```tsx
className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-full text-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5"
```
- **Uso**: "Crear a mano", "Omitir y llenar a mano".

### C. Botón Secundario en Cámara (Dark Overlay CTA)
```tsx
className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-5 rounded-full text-sm transition-all border border-white/10 active:scale-[0.98] flex items-center justify-center space-x-2"
```

---

## 4. Tipografía y Jerarquía

- **Títulos de Pantalla e Historial**: `font-heading font-extrabold text-2xl` o `text-xl font-bold text-gray-900`.
- **Etiquetas de Formularios**: `text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5`.
- **Encabezados de Tarjetas**: `text-lg font-bold text-gray-900 font-heading`.
- **Detalles / Subtítulos**: `text-xs text-gray-500 font-medium`.

---

## 5. Tarjetas y Componentes

### Tarjetas de Plan de Medicación ("Mis Planes")
- **Contenedor**: `bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm`.
- **Acciones Rápidas (Encabezado)**:
  - Botón de **Editar**: Icono `Pencil` (`w-4 h-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100`).
  - Botón de **Eliminar**: Icono `Trash2` (`w-4 h-4 text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50`).
- **Grilla de Detalles**: 2 columnas (`grid grid-cols-2 gap-2 text-xs`) para Dosis y Frecuencia.
- **Horarios y Fechas**: Apilados verticalmente con iconos legibles (`Clock` y `Calendar`).
- **Notas de Instrucción**: Caja limpia e itálica (`bg-[#fafafa] p-2.5 rounded-xl border border-gray-200 text-xs text-gray-600 italic`) sin iconos redundantes.

---

## 6. Layout Responsivo

- **Contenedor Principal**:
  ```tsx
  w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-[#f8f9fa] min-h-screen relative flex flex-col shadow-2xl border-x border-gray-200
  ```
- **Navegación Inferior Fija (Bottom Nav)** y **Pestañas Modales**: Alineados con el ancho del contenedor activo utilizando `left-1/2 -translate-x-1/2` y la misma escala de anchura máxima.
