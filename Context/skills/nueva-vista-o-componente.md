# Skill · Agregar o editar una vista/componente

**Cargar antes:** `../design.md` (solo la sección que aplique) + el componente hermano más parecido.

1. **Copia el patrón, no lo inventes.** Busca el componente equivalente en `src/components/` y reutiliza sus clases. Botones: siempre la especificación exacta de `../design.md` §3, con **un solo primario verde por pantalla** (las demás acciones verdes, secundario menta D). Acción destructiva → `ConfirmDialog`.
2. **Sin estado de dominio dentro del componente.** Props + callbacks; el estado vive en `App.tsx`. Estado puramente visual (abierto/cerrado, hover) sí puede ser local.
3. **Tipa las props** con una `interface <Nombre>Props` encima del componente, y exporta con `export const X: React.FC<XProps>`.
4. **Iconos:** solo `lucide-react`, tamaño `w-4 h-4` (en línea) o `w-5 h-5` (botones de barra).
5. **Estado vacío obligatorio** si la vista lista algo: mira `HorarioView` / `MisPlanesView` con `isEmptyState`.
6. **Accesibilidad:** `aria-label` en todo botón que solo tenga icono. Texto mínimo `text-xs`; el contenido importante, `text-sm` o más.
7. **Si es pantalla completa** (`scan`, `loading`, `plan_form`): repite el envelope `w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto` para que no se desalinee en desktop.
8. Registra la vista en `ScreenView`/`NavTab` (`src/types.ts`) y en el render de `App.tsx`.
9. Si la pantalla tiene textos que deben ir en una línea o en columnas, pruébala a 386 y 320 px con el caso más largo (`verificar-en-navegador.md` §5).
10. Cierra con `npm run lint` + `../skills/verificar-en-navegador.md`.
