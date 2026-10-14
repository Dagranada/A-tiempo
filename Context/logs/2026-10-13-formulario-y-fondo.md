# 2026-10-13 · Formulario "Revisa el plan" y fondo blanco

- `PlanFormScreen`: steppers de dosis (cantidad + mg) y frecuencia; dosis no contable cae a texto libre. Tipografía unificada: etiquetas `text-xs font-bold uppercase`, todo valor de campo `text-sm font-medium`.
- **Convención cambiada (design.md §2/§5):** el canvas de la app pasa de `#f8f9fa` a blanco, a pedido de la persona. `#f8f9fa` queda solo como fondo exterior en desktop (`App.tsx` contenedor de afuera, `index.html`).
- `MisPlanesView`: tarjetas con filas etiqueta/valor, hora en 12 h y vigencia legible; divisor bajo el encabezado de lado a lado.
- `PerfilView`: rehecha como formulario editable (borrador local → `onSaveProfile` en `App.tsx`). `SeniorProfile` suma `birthDate`, `sex`, `phone`, `weightKg`, `heightM`, `bloodType`, `rhFactor`; `name` es el nombre completo y el `Header` muestra solo el primero. El interruptor de recordatorios usa `handleToggleReminders` (encender pasa por `handleEnableReminders`, que conserva el `unlockAudio()` en el gesto). La referencia decía "con vibración": se omitió porque la app no vibra (invariante 5).
