# Transportes José María Ibáñez — Web inmersiva

Lee este archivo entero antes de tocar código. Es la fuente de verdad del proyecto.

## Contexto
- Cliente: Transportes José María Ibáñez (transportesjosemariaibanez.es).
- Negocio: transporte terrestre B2B por carretera. Ruta diaria Castellón ⇄ Madrid. Carga principal: azulejos y material de construcción en palés.
- Objetivo de la web: que deje de ser una web promedio. Intro 3D ligada al scroll + captación de leads (presupuesto, email, WhatsApp) + blog.
- Idiomas: español (por defecto) e inglés.
- El propietario trabaja en modo "vibe coding": explica siempre qué has cambiado y cómo probarlo, en español y sin jerga innecesaria.

## Marca
- Azul corporativo: `#34548a` · Rojo corporativo: `#d03b40`.
- Mucho espacio en blanco. Azul y rojo solo como acentos, bordes y detalles, nunca como fondos masivos.
- Sección "oscura" (la que sube desde abajo en la intro): usar un azul noche derivado del corporativo (p. ej. `#0f1a2e`), no negro puro.
- Tipografía: sans geométrica robusta para titulares (condensada, mayúsculas), sans neutra para texto.

## Stack
Next.js (App Router) + React + TypeScript · Tailwind CSS · Three.js + @react-three/fiber + @react-three/drei · @react-three/postprocessing · GSAP + ScrollTrigger + ScrambleText/SplitText (GSAP es gratuito, incluidos los plugins) · Motion (animaciones de UI) · Lenis (scroll suave) · Zustand (estado compartido scroll ↔ 3D) · next-intl · react-hook-form + zod · Vercel.

## Arquitectura de la experiencia 3D (no cambiar sin consultar)
1. Un único `<Canvas>` fijo a pantalla completa detrás del contenido (`position: fixed; inset: 0; z-index: 0`). Nunca varios Canvas.
2. El Canvas se carga con `dynamic(() => import(...), { ssr: false })`. Todo lo 3D es `'use client'`.
3. Las secciones HTML van encima (`z-index` superior) y son las que generan la altura de scroll.
4. Una timeline maestra de GSAP con `ScrollTrigger` (`scrub: true`) escribe el progreso (0 → 1) y el progreso de cada escena en un store de Zustand.
5. Los componentes R3F leen ese store dentro de `useFrame` (con `getState()`, no con hooks reactivos) y mueven cámara, modelos y materiales. Nada de `setState` por frame.
6. Cámara ortográfica en vista lateral para las escenas 1–4 (look "maqueta" limpio), transición a vista cenital en la escena 5.
7. Lenis sincronizado con ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)` y `gsap.ticker`).

## Guion de escenas (storyboard)
Referencia de ritmo: intro de scroll tipo "maqueta lateral" (grúa carga contenedor → camión → sección oscura sube → servicios en scroll horizontal → vista cenital de la carretera). Contenido 100 % propio de TJMI.

Decisiones cerradas:
- La escena de apertura es **grúa portacontenedores + contenedor**, no carretilla con palés.
- El **logo de TJMI va como textura en el lateral del contenedor** (y pequeño en la puerta de la tractora). Es el requisito de marca de la intro.
- Los modelos 3D salen de **stock gratuito** (CC0/CC-BY, créditos en el aviso legal). Si el resultado no da el nivel, se valorará comprar modelos.
- Los modelos se **retexturizan**: se quitan los logos del fabricante, se ajustan los colores a la marca y se pega el logo de TJMI.
- Trato al cliente: **tuteo** en todos los textos.
- **La intro 3D son 4 pantallas**: terminal, carga, sección azul noche y carretera. Cuando el camión termina el recorrido se acaba el 3D y empieza la web normal. Nada de globo terráqueo ni de escenas marítimas, TJMI no transporta por barco.
- El giro a **vista cenital** ocurre en la escena de la carretera, y no mira a plomo: va inclinada unos 16° para que el camión tenga volumen.
- La carretera es **3D**, una cinta que se dibuja según avanza el camión, con una **nave de salida y una nave de llegada** en los extremos. El trazado es una curva libre, no el mapa de España.
- El fondo de la página lo controla `Backdrop` con `data-bg` por sección: los cambios de color son fundidos, nunca un bloque opaco entrando.
- Escala de la grúa calibrada con las ruedas del propio GLB (1,5 m de diámetro): no tocar a ojo.
- La intro abre con un **acto previo**: la grúa coge su contenedor de una pila de cinco, viene hacia el espectador y gira a la derecha hasta quedar de perfil delante del camión. Va ligado al scroll, como todo lo demás.
- Ese acto se ve desde una **cámara en tres cuartos** que está en la misma dirección que la vista de perfil, solo que en alto (unos 30°). Pasar a perfil es bajar la cámara, no girarla: por eso no se nota el corte. Con cámara ortográfica es la única forma de que un avance en profundidad se lea (baja por la pantalla).
- El encuadre de ese acto (`quarterDrop`, `quarterShift`, `quarterWidth` en `Scene.tsx`) deja la maniobra en la franja baja y, en escritorio, en la columna izquierda: el titular nunca debe quedar sobre el 3D oscuro.
- El patio se llena con torres de contenedores (`PILE_ROWS`, una rejilla de `slot` × `row`). Dos reglas al tocarlo: nada por encima de `x ≈ -19`, o asomaría por la izquierda en la vista de perfil; y como mucho dos filas de fondo, porque cuanto más atrás está algo más sube en pantalla y acaba detrás del titular.
- **La nave de `Facility` no sirve como fondo del patio**: está modelada para verse desde arriba y, sin perspectiva que la achique, ocupa el plano entero y su franja de marca cruza el titular. Ya se probó.

| # | Escena | Qué pasa | Texto |
|---|--------|----------|-------|
| 1 | Hero – Terminal | Fondo blanco. Empieza en tres cuartos: la grúa portacontenedores (reach stacker) coge un contenedor de una pila de cinco, se acerca y gira a la derecha. La cámara baja a vista lateral y la grúa deposita el contenedor sobre el semirremolque. Idle loop suave antes de hacer scroll. | Logo + claim corto |
| 2 | Carga completa | Al hacer scroll la grúa suelta el contenedor y sale de plano, la cabeza tractora se engancha/arranca. Leve desaturación. | — |
| 3 | En ruta | La sección azul noche sube desde abajo y el camión queda "posado" sobre ella. Después la cámara gira de vista lateral a **cenital** y el camión cruza la pantalla hacia abajo por el lado derecho, con el logo en el techo del contenedor. Titular con efecto ScrambleText. | "Cada día, de Castellón a Madrid." / subtítulo + botón "Sobre nosotros" |
| 4 | Servicios | Ya sin 3D. Sección fijada (pin) con scroll horizontal. Palabra gigante "SERVICIOS" en contorno. Tarjetas de servicio entrando en horizontal. | Servicios reales de TJMI (ver `messages/es.json`) |
| 5 | La ruta (dentro de la intro) | Cámara cenital inclinada. La carretera se dibuja según avanza el camión, que sale de una nave y entra en otra, con las ruedas girando y rodadas sobre el asfalto. Cuentakilómetros atado al avance. | "Fiabilidad en cada kilómetro." + 420 km |
| 6 | CTA | Formulario de presupuesto y WhatsApp. | Formulario + WhatsApp |

## Cookies y consentimiento (obligatorio)
- **Nada de terceros se carga antes del consentimiento.** Si añades un servicio externo (analítica, píxel, vídeo incrustado, fuentes de terceros), va detrás del gate, no suelto.
- El estado vive en `src/lib/consent.ts`: cookie propia `tjmi_consent` (12 meses) con la fecha y la versión. Se lee con `useConsent()` (usa `useSyncExternalStore`, no `useState` en efectos).
- Categorías actuales: `necesarias` (no configurable) y `maps`. Al añadir una categoría o un servicio nuevo hay que **subir `CONSENT_VERSION`**: eso invalida los consentimientos antiguos y vuelve a preguntar, que es lo que exige la AEPD.
- Para incrustar algo de terceros se usa el patrón de `src/components/legal/MapEmbed.tsx`: si no hay permiso, el iframe **no existe en el DOM** (ni oculto ni con `src` vacío) y en su lugar va una alternativa útil.
- El banner no lleva aspa de cerrar y "Aceptar" y "Rechazar" tienen el mismo peso visual. No tocar eso: es justo lo que se sanciona.
- Las páginas legales viven en `/cookies`, `/privacidad` y `/aviso-legal`, con los textos en `messages/*.json`. Los huecos marcados `[PENDIENTE: ...]` son datos societarios reales que faltan.
- Los créditos de los modelos 3D con licencia CC-BY van en el aviso legal.

## Rendimiento y accesibilidad (obligatorio)
- Modelos GLB optimizados: Draco o Meshopt, texturas ≤ 1024 px (KTX2/WebP), objetivo < 2 MB total de 3D.
- `dpr={[1, 1.5]}`, sombras baratas (`ContactShadows` o sombras horneadas), postprocesado mínimo.
- `prefers-reduced-motion`: **el 3D no llega a montarse**. `ExperienceCanvas` devuelve `null` (ni Canvas ni `ScrollChoreography`) y las secciones de la Home se apañan solas con la variante `motion-reduce:` de Tailwind: Hero y RoadIntro dejan de medir 300 svh y sueltan el `sticky`, e InRoute se pinta su propio fondo azul noche porque ya no tiene detrás el suelo 3D que se lo daba. Si añades una sección que dependa del 3D para su fondo o su altura, **dale su fallback `motion-reduce:`**.
- Los componentes animados (`ScrollFade`, `RevealHeading`, `RouteOdometer`, `RouteProgress`, `CountUp`) ya salen por `prefersReducedMotion()` dejando su estado final en el HTML. Mantén ese patrón: nunca escondas algo en el marcado y lo enseñes solo por animación.
- Móvil: misma historia, escena simplificada (menos objetos, sin postprocesado). Probar en móvil real antes de cerrar cada fase.
- Preloader con progreso real (`useProgress` de drei) y máximo ~2 s percibidos.
- Lighthouse objetivo: Performance ≥ 80 en móvil, Accesibilidad ≥ 95.
- Todo el texto importante existe en HTML (SEO), nunca solo dentro del Canvas.

## Páginas de error
- El 404 propio vive en `src/app/[locale]/not-found.tsx` y **necesita la ruta comodín** `src/app/[locale]/[...rest]/page.tsx`, que solo llama a `notFound()`. Sin ella, cualquier URL inventada cae en la pantalla de error por defecto de Next, sin navbar, sin pie y sin idioma. No borres esa carpeta.

## Estructura
```
src/
  app/[locale]/(layout, page, servicios, nosotros, contacto, blog)
  components/3d/        Experience.tsx, Scene.tsx, models/, scenes/
  components/sections/  Hero, InRoute, Services, Route, Cta
  components/ui/        botones, tarjetas, inputs
  components/layout/    Navbar, Footer, WhatsAppButton, SmoothScroll
  lib/                  gsap.ts, store.ts (zustand), utils.ts
  messages/             es.json, en.json
public/models/          *.glb
```

## Forma de trabajar (para el agente)
- Trabaja por fases (ver abajo). Antes de programar una fase, propone un plan breve y espera confirmación.
- Cambios pequeños y verificables. Al terminar: qué has hecho, qué archivos, cómo probarlo (`npm run dev` + qué mirar).
- No refactorices ni cambies dependencias fuera del alcance de la tarea.
- Si falta un modelo 3D, usa placeholders (cajas/cilindros con las proporciones reales) y déjalo marcado con `// TODO: modelo`.
- `npm run build` y `npm run lint` deben pasar antes de dar una fase por cerrada.

## Fases
- [ ] F0 Setup: proyecto, dependencias, Git, Vercel conectado.
- [ ] F1 Esqueleto: layout, i18n ES/EN, navbar, footer, secciones HTML con textos reales, sin 3D.
- [ ] F2 Coreografía con placeholders: Canvas fijo, store, timeline maestra, las 6 escenas con cajas.
- [ ] F3 Modelos reales: GLB optimizados, gltfjsx, materiales, luces, sombras.
- [ ] F4 Tipografía animada y servicios horizontales (ScrambleText, pin, Motion en UI).
- [ ] F5 Escena ruta cenital Castellón → Madrid con hitos.
- [ ] F6 Conversión: formulario de presupuesto, email, WhatsApp flotante, blog (MDX), SEO.
- [ ] F7 Pulido: móvil, reduced-motion, rendimiento, Lighthouse, deploy a producción.
