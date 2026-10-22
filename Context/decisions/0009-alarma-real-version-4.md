# 0009 · La alarma real es la versión 4 (sin píldora, texto al centro)

**Fecha:** 2026-10-22 · **Estado:** Vigente · **Pidió:** la persona a cargo del diseño, tras comparar las versiones con botones de prueba en el teléfono.

## Contexto
La alarma a pantalla completa (`ReminderAlert`, la pantalla más importante de la app) pasó por varias propuestas entre el 2026-10-14 y el 2026-10-22, comparadas con botones temporales en el menú: v1 (verde con píldora y caja de dosis, eliminada), v2 (fondo verde agua, píldora y ondas de línea), v3 (la 2 con manchas cálidas, grano y ondas difusas) y v4 (la 2 sin píldora, con el texto al centro).

## Decisión
- **La versión 4 es la alarma real** para tomas y para avisos de reclamo en la EPS (`ClaimAlert`). Detalle visual en `../design.md` §9.
- **Posponer editable**: `[ − ] Recordar en N min [ + ]` de 5 en 5 minutos (5–60); el "−" se desactiva en 5 porque menos rompería el paso. La app pospone exactamente lo elegido (`snooze(minutos)`). En reclamos, de 1 a 12 horas.
- **Una sola escala de texto** (`ALARM_TEXT`) para toma y reclamo, para que se lean igual.
- Las versiones 2 y 3 quedan en el código sin botón por si se quiere volver a comparar.

## Alternativas descartadas
- v2/v3 como real: la píldora quitaba protagonismo al nombre del medicamento y la dosis.
- Posponer fijo de 5 minutos (decía "5" aunque la referencia pedía otro número): no dejaba elegir.
- Ondas que animan tamaño: se veían intermitentes con el tiempo; la v4 anima solo escala y opacidad.

## Consecuencias
- Los botones de prueba ("Alarma 4", "Reclamo", "Mañana") siguen en el menú hasta el lanzamiento (ADR 0006).
- Borrar las versiones 2 y 3 si no se vuelven a usar (`../state/current.md`).
