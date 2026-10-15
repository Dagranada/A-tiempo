# 0008 · Reclamos mensuales en la EPS (pestaña "Pastas")

**Fecha:** 2026-10-14 · **Estado:** Vigente · **Pidió:** la persona a cargo del producto, con las reglas de su EPS.

## Contexto
Algunos medicamentos no se compran: se reclaman en la EPS cada mes mientras dure la orden médica (3, 6, 8… meses). Si un mes no se reclama, esa entrega se pierde y no se acumula. Olvidarlo es el problema que se quiere evitar.

## Reglas (implementadas en `src/lib/claims.ts`, `getClaimSchedule`)
1. Una orden tiene una **fecha de primer reclamo** y una **duración en meses** (= número de entregas).
2. Se reclama **una vez por mes calendario**: desde "su día" hasta el último día de ese mes. **No se puede antes de su día.**
3. "Su día" empieza siendo el del primer reclamo. **Si reclama tarde, su día pasa a ser el día en que reclamó** y así sigue el resto de la orden (los atrasos se acumulan).
4. En meses cortos, si su día no existe (29–31), le toca el último día del mes **sin perder su día** (31 → 28 feb → 31 mar).
5. Si termina el mes sin reclamar, la entrega se **pierde**, cuenta dentro de la orden y el mes siguiente le toca el mismo día del último reclamo.
6. La orden **termina al completar sus N meses**, contando los perdidos; entonces se pide una orden nueva al médico y se registra de nuevo.

## Decisión de producto
- Un reclamo pertenece a un plan de Mis planes (`MedicationPlan.claim`), y se registra desde la pestaña **"Pastas"** (no desde el formulario del plan, que lo conserva al editar).
- "Marcar como reclamada" solo registra la fecha de hoy; no hay cantidad ni farmacia.
- Avisos (`useClaimReminders`): **12:00 del día anterior** ("Mañana toca reclamar", con "Entendido") y **8:00 del día de reclamar y de cada día de atraso** ("Hoy toca reclamar" / "Sigue pendiente", con "Ya lo reclamé"). Ambos se pueden posponer de 1 a 12 horas con − / +.
- Como los avisos solo suenan con la app abierta (ADR 0004), además hay un recuadro arriba del Horario y un punto en la pestaña cuando toca reclamar hoy, mañana o hay atraso.

## Consecuencias
- Las fechas siempre las pone la persona; la app solo calcula y recuerda (invariante 1).
- Un estado mal calculado ("le toca el 17" cuando es el 16) es un bug de seguridad (invariante 5): cualquier cambio en `claims.ts` debe re-probar los casos de esta lista.
- Sin servidor no hay aviso con el teléfono bloqueado.
