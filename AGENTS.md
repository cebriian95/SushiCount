# AGENTS.md — SushiCount

## Resumen del proyecto

**SushiCount** es una Single Page Application hecha con Angular donde el usuario cuenta cuántas piezas de sushi (maki de salmón) come pulsando sobre una imagen animada. Incluye sesiones cronometradas, historial persistente, estadísticas y logros desbloqueables. Todo se guarda en `localStorage`, sin backend.

Es un proyecto personal/de diversión para usar con amigos, no está orientado a portfolio ni a aprendizaje de un framework nuevo — el desarrollador ya domina Angular, así que prioriza pragmatismo y velocidad de desarrollo sobre exploración de conceptos nuevos.

---

## Stack técnico

| Área | Tecnología |
|---|---|
| Framework | Angular 17+ (última estable), standalone components (sin NgModules) |
| Estado | Signals (`signal`, `computed`, `effect`) |
| Estilos | Tailwind CSS |
| Animaciones | GSAP |
| Efecto de logros | `canvas-confetti` |
| Iconos | lucide (paquete Angular, ej. `lucide-angular`) |
| Navegación | Sin Angular Router. Cambio de vista mediante un `signal` de estado (ej. `vistaActual: signal<'dashboard' | 'comer' | 'resumen'>`), sin cambiar la URL |
| Persistencia | `localStorage`, sin backend, sin base de datos |
| Idioma UI | Español |

---

## Arquitectura y estructura sugerida

Usar standalone components, con una estructura de carpetas por feature, por ejemplo:

```
src/app/
  core/
    services/
      sushi-store.service.ts     -> Signals de estado global + lógica de localStorage
      timer.service.ts           -> Lógica del cronómetro
  features/
    dashboard/
      dashboard.component.ts
    comer/
      comer.component.ts
      maki-sushi.component.ts    -> componente del maki con animación GSAP
    resumen/
      resumen.component.ts
    historial/
      historial-panel.component.ts
      historial-item.component.ts
  shared/
    ui/
      modal-confirmacion.component.ts
    models/
      sesion.model.ts
      logro.model.ts
  app.component.ts                -> orquesta el cambio de vista por signal
```

El estado global (sesión activa, historial, récord, medias) debe vivir en un servicio único (`SushiStoreService`) inyectado donde haga falta, usando Signals para reactividad. Evitar prop drilling manual: los componentes inyectan el servicio directamente.

---

## Modelo de datos

```ts
interface Sesion {
  id: string;
  nombre: string;        // autogenerado: "Sushi DD-MM-AAAA"
  fechaInicio: number;   // timestamp epoch ms
  piezas: number;
  duracionSegundos: number;
}

interface SesionActiva {
  fechaInicio: number;    // timestamp epoch ms — NO guardar segundos transcurridos
  piezas: number;
}
```

**Claves de localStorage sugeridas:**
- `sushicount_historial` → array de `Sesion[]`
- `sushicount_sesion_activa` → `SesionActiva | null` (se borra al finalizar sesión)

---

## Persistencia de sesión activa (resumir tras refrescar)

Requisito importante: si el usuario refresca la página en medio de una sesión activa (vista "Comer"), la sesión **debe continuar**, no perderse.

Implementación:
1. Al iniciar una sesión, guardar inmediatamente `{ fechaInicio: Date.now(), piezas: 0 }` en `sushicount_sesion_activa`.
2. Cada vez que se pulsa el maki (incrementa `piezas`), actualizar ese mismo registro en localStorage.
3. El cronómetro **nunca** debe calcularse acumulando segundos en una variable que se pierda al refrescar. Debe calcularse siempre como `Date.now() - fechaInicio`, refrescado cada segundo con un `setInterval` o similar. Así, aunque se recargue la página, el tiempo se recalcula correctamente desde el timestamp guardado.
4. Al arrancar la app (`app.component` o un servicio de inicialización), comprobar si existe `sushicount_sesion_activa`. Si existe, restaurar directamente la vista "Comer" con los datos recuperados en lugar de mostrar el Dashboard.
5. Al finalizar sesión (botón "Finalizar" + modal de confirmación), mover los datos de `sushicount_sesion_activa` a un nuevo objeto `Sesion` completo, añadirlo a `sushicount_historial`, y **borrar** `sushicount_sesion_activa`.

---

## Flujo de vistas

### 1. Dashboard (vista inicial)
- Mini dashboard con:
  - Media de piezas comidas (histórico)
  - Media de tiempo comiendo (histórico)
  - Recuadro dorado con icono de corona: sesión con más piezas (número de piezas + tiempo de esa sesión)
- Copa (icono) arriba a la derecha con el número de la puntuación más alta (récord de piezas).
- Botón "Empezar a comer" → inicia sesión activa y navega a la vista "Comer".
- Si al cargar la app hay una sesión activa en localStorage, saltar este dashboard e ir directo a "Comer" (ver sección de persistencia).

### 2. Vista Comer
- Centro: maki de salmón. Al pulsar (click/tap):
  - Se dispara animación GSAP tipo "mordisco" (a definir en fase de implementación: escalar, mover, desvanecer y volver a aparecer, o similar — sin efecto de sonido).
  - Incrementa el contador de piezas (+1).
  - Se actualiza `sushicount_sesion_activa` en localStorage.
- Subtítulo bajo el maki indicando la acción (ej. "Pulsa por cada pieza comida").
- Arriba centro: cronómetro en formato `mm:ss`, calculado en base al timestamp de inicio (ver sección de persistencia).
- Arriba derecha: icono de copa + número del récord histórico (best).
- Abajo izquierda: botón que abre el panel lateral de historial.
- Arriba izquierda: botón "Finalizar sesión" → abre modal de confirmación ("¿Estás seguro de que ya no puedes más?"). Si se confirma:
  - Se guarda la sesión en el historial.
  - Se borra la sesión activa de localStorage.
  - Se navega a la vista Resumen.

### 3. Vista Resumen (post-sesión)
- Muestra las estadísticas de la sesión recién finalizada:
  - Piezas comidas en esta sesión.
  - Tiempo total de esta sesión.
  - Comparación con la media histórica de piezas (cuánto por encima/debajo, en número y/o porcentaje).
  - Comparación con la media histórica de tiempo (cuánto por encima/debajo).
- Debe ofrecer una forma de volver al Dashboard.

### 4. Historial (panel lateral)
- Se abre como menú lateral (drawer/sidebar) desde la vista Comer (y opcionalmente también accesible desde el Dashboard).
- Lista todas las sesiones guardadas, sin límite de cantidad.
- La primera sesión mostrada es siempre la de **más piezas** (mejor sesión histórica), destacada con:
  - Borde dorado con efecto tipo resplandor/luz.
  - Icono de copa centrado en el borde superior de esa tarjeta.
- Orden por defecto: número de piezas (descendente).
- Botón para alternar el orden a: tiempo de sesión, de menor a mayor.
- Cada sesión de la lista tiene botón de eliminar → modal de confirmación antes de borrar.
- Sin límite de sesiones almacenadas (el límite práctico de localStorage, ~5-10MB según navegador, permite decenas de miles de sesiones — no es una preocupación real para este proyecto).

---

## Sistema de logros

Se desbloquean logros al alcanzar los siguientes números de piezas **acumuladas** (a confirmar si es acumulado histórico total o por sesión individual — **preguntar al usuario en la fase de implementación de logros**):

- 5, 10, 15, 20, 30, 50, 70, 100 piezas.

**⚠️ IMPORTANTE PARA EL AGENTE:** Los nombres de estos 8 logros aún no están definidos. Cuando llegue la fase de implementación del sistema de logros, el agente debe **detenerse y preguntar al usuario** los nombres antes de continuar, en lugar de inventarlos o usar placeholders genéricos.

Al desbloquear un logro:
- Se dispara un efecto de confeti/partículas usando `canvas-confetti`.
- (Detalles de UI del toast/modal de logro desbloqueado: a definir en fase de implementación.)

---

## Consideraciones de estilo (Tailwind)

- Diseño **mobile-first** (la app se usa principalmente desde el móvil).
- Paleta y estética: libre, pero el elemento "dorado" (mejor sesión, corona, borde de logro top del historial) debe ser visualmente distintivo (dorado/amarillo con brillo o resplandor sutil vía Tailwind + posible apoyo de GSAP para el glow).
- Iconografía consistente con lucide en toda la app (copa, corona, historial, cerrar, confirmar, etc.)

---

## Notas de proceso para el agente

- El desarrollador prefiere entender el "por qué" de las decisiones técnicas relevantes, no solo recibir código sin explicación — cuando se tomen decisiones de arquitectura no cubiertas aquí, es preferible explicar brevemente el motivo.
- No introducir dependencias adicionales no mencionadas en este documento sin comentarlo antes (ej. no añadir Angular Router, no añadir librerías de estado tipo NgRx, no añadir librerías de sonido).
- No se requiere soporte offline/PWA explícito más allá de lo que da `localStorage` de forma nativa.
- No hay backend, no hay autenticación, no hay multi-usuario.
