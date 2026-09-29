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
- **Las farolas van en la carretera, no en el patio** (`Road.tsx`). En el arranque, con la grúa cargando, estorbaban. Se colocan sobre la propia curva, así que siguen el trazado solas si se cambia, y **se encienden según se dibuja el asfalto**, no antes.
- El recorrido de la carretera ocupa casi media sección (`ROAD_RUN` en `lib/route.ts`) y `RoadIntro` mide 360 svh: son 420 km y con un tramo corto se despachaban en dos golpes de rueda. Si tocas `ROAD_RUN`, mueve también el fundido final (`closing` en `Scene.tsx`) y la salida del texto en `RoadIntro`, que van **detrás** de la llegada.
- El bloque de texto de `RoadIntro` lleva un **velo crema en degradado** que se desvanece hacia la derecha. El trazado pasa por detrás y sobre el asfalto negro el texto en tinta no se lee; en móvil el texto ocupa casi todo el ancho, así que apartar la carretera no es opción. No lo quites sin resolver antes esa lectura.
- El fondo del patio (`TerminalYard.tsx`) son suelo y vallado, y **no es decoración**: sin nada fijo detrás, el camión avanzando ocho metros no se lee como que avanza porque no hay contra qué medirlo.
- Ese vallado viene **en dos piezas**. La lejana (x < −19) se ve siempre. La cercana, la que cruza por detrás del camión, solo se enciende con `quarter < 0.45`: en tres cuartos pasaría por detrás del titular en escritorio, y ahí todavía queda fuera de plano por la derecha, así que encenderla no se nota.
- El suelo del patio usa material **sin luz y con `toneMapped={false}`**. Con la iluminación actual (hemisférica a 2.1 más dos direccionales) cualquier crema se satura a blanco y no se distinguiría del fondo de la página. Es un parche: lo que toca de verdad es revisar la iluminación.
- La carga se posa en **dos tiempos** (`place` y `lower`): primero se sitúa sobre el chasis y solo entonces baja en vertical. En diagonal parecía de juguete.
- Al posarse, el conjunto se hunde y se mece (`LANDING_DIP`). Va exagerado a propósito: los ocho centímetros reales de una suspensión no se ven a esta distancia de cámara. Es animación, no simulación.
- Entre que se posa y que la pluma se separa hay un compás de silencio. Sin esa pausa no se lee "ya está", se lee "salió corriendo".
- **La nave de `Facility` no sirve como fondo del patio**: está modelada para verse desde arriba y, sin perspectiva que la achique, ocupa el plano entero y su franja de marca cruza el titular. Ya se probó.

| # | Escena | Qué pasa | Texto |
|---|--------|----------|-------|
| 1 | Hero – Terminal | Fondo blanco. Empieza en tres cuartos: la grúa portacontenedores (reach stacker) coge un contenedor de una pila de cinco, se acerca y gira a la derecha. La cámara baja a vista lateral y la grúa deposita el contenedor sobre el semirremolque. Idle loop suave antes de hacer scroll. | Logo + claim corto |
| 2 | Carga completa | Al hacer scroll la grúa suelta el contenedor y sale de plano, la cabeza tractora se engancha/arranca. Leve desaturación. | — |
| 3 | En ruta | La sección azul noche sube desde abajo y el camión queda "posado" sobre ella. Después la cámara gira de vista lateral a **cenital** y el camión cruza la pantalla hacia abajo por el lado derecho, con el logo en el techo del contenedor. Titular con efecto ScrambleText. | "Cada día, de Castellón a Madrid." / subtítulo + botón "Sobre nosotros" |
| 4 | Servicios | Ya sin 3D. Sección fijada (pin) con scroll horizontal. Palabra gigante "SERVICIOS" en contorno. Tarjetas de servicio entrando en horizontal. | Servicios reales de TJMI (ver `messages/es.json`) |
| 5 | La ruta (dentro de la intro) | Cámara cenital inclinada. La carretera se dibuja según avanza el camión, que sale de una nave y entra en otra, con las ruedas girando y rodadas sobre el asfalto. Cuentakilómetros atado al avance. | "Fiabilidad en cada kilómetro." + 420 km |
| 6 | CTA | Formulario de presupuesto y WhatsApp. | Formulario + WhatsApp |

## Iluminación del 3D
- El Canvas va con `shadows="soft"`. **Hay sombras reales**: la grúa, los contenedores y el camión proyectan sobre el patio.
- La luz que proyecta **viaja con el punto que mira la cámara**. Solo se traslada, nunca cambia de dirección, así que la escena se ilumina igual siempre; lo que se mueve es el recuadro donde se calcula la sombra, para no gastar resolución en vacío. En móvil el mapa de sombras va a la mitad.
- Los reflejos vienen de un `Environment` montado con `Lightformer` **dentro de la escena**. Nada de HDRI descargado: sería una petición a un tercero y va contra la regla de no cargar nada de fuera sin consentimiento. `frames={1}` lo calcula una vez.
- La exposición es baja a propósito. La de antes (hemisférica a 2.1) saturaba a blanco cualquier crema.
- **El suelo del patio son dos planos y no es capricho.** El pavimento ocupa todo el encuadre, así que su tono *es* el fondo de la escena y tiene que quedarse pegado al crema de la página; con un material iluminado no se puede, por mucho que se aclare. Así que el pavimento va sin luz con el color exacto, y encima hay un plano invisible (`shadowMaterial`) que solo pinta las sombras que recibe. Si tocas uno, mira el otro.
- Postprocesado: sigue sin usarse. Oclusión ambiental y viñeta quedan pendientes; el salto grande ya lo dan las sombras.

## Detalles de acabado
- **Grano de papel** sobre toda la página (`body::after` en `globals.css`). El crema plano se lee como pantalla; con la textura se lee como papel. No captura clics y no se imprime.
- El menú marca la **página activa** con `aria-current` y un subrayado rojo.
- Cada artículo del blog tiene **portada** (`cover` en `content/blog.ts`), y sale también en Open Graph y en el marcado para buscadores: es lo que hace que al compartir el enlace por WhatsApp o LinkedIn aparezca la foto.

## Secciones con efecto (cómo están montadas)
- **Servicios en horizontal** (`ServicesTrack.tsx`): el bloque se fija y la fila de tarjetas se desplaza lo que sobresale por la derecha. La sección que lo contiene **no puede llevar `overflow-hidden`**: recorta el `position: sticky` con el que ScrollTrigger fija, y el efecto deja de funcionar sin dar ningún error.
- **Nosotros** abre con el vídeo corporativo a pantalla completa (`VideoHero.tsx`). Arranca mudo porque ningún navegador deja reproducir solo con sonido, y como en el vídeo habla alguien hay un botón para activarlo. El contenido sube por encima con el borde redondeado.
- `RevealText` usa **IntersectionObserver y no ScrollTrigger** a propósito: encima hay un vídeo a pantalla completa que cambia la altura de la página al cargar, y un disparador calculado antes de eso deja el texto invisible para siempre. Ya pasó.
- **Formulario de presupuesto en tres pasos** (`QuoteForm.tsx`): qué mueves → de dónde a dónde → cómo te llamamos, con barra de avance. Los campos que no están en pantalla siguen registrados, así que al volver atrás no se pierde nada. El submit está interceptado para que Intro en un paso intermedio avance en vez de enviar. **Sigue sin enviar de verdad**: abre WhatsApp o el correo.
- **Mapa de la ruta** (`RouteMap.tsx`): la silueta de la península es un trazado **simplificado a mano**, proyectando longitud y latitud de los puntos de costa reconocibles sobre el lienzo. No es cartografía y no hace falta que lo sea: pesa unos cientos de bytes en vez de los cientos de kB de un SVG real.

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

## SEO
- `src/app/sitemap.ts` genera `/sitemap.xml` y `src/app/robots.ts` el `/robots.txt`. Van fuera de `[locale]` a propósito: el proxy de idiomas no las toca porque su filtro deja fuera todo lo que lleva punto en el nombre.
- **Si añades una página, añádela a `SITE_PATHS` en `src/lib/seo.ts`** o no entrará en el sitemap. Los artículos del blog se sacan solos de `content/blog.ts`.
- Cada página declara su **canonical y su hreflang** con `pageAlternates(locale, ruta)`. El canonical dice cuál es la dirección buena; el hreflang, que la versión española y la inglesa son la misma página traducida y no contenido duplicado. Incluye `x-default`, que apunta al español.
- El layout define `title.template`, así que **cada página solo declara su nombre corto** y se le añade " | Transportes José María Ibáñez". La portada usa `title.default`. Antes todas las páginas compartían el mismo título, que para buscadores es como no tener ninguno.
- Los artículos del blog llevan además Open Graph con su portada y marcado `Article` para buscadores.
- El marcado de empresa (`BusinessJsonLd.tsx`) va en la portada y en contacto. Es un grafo de tres nodos —la empresa y sus dos naves— enlazados por `@id`, para que Google entienda que son la misma empresa y no tres negocios. Es lo que alimenta la ficha lateral.
- Los datos societarios estructurados viven en `src/lib/business.ts`, **no en `messages`**: una dirección o un teléfono no se traducen. Si cambia una dirección, un teléfono o un horario, hay que tocarlo en los dos sitios (ahí y en `messages`, que es lo que se ve en pantalla).
- **No hay coordenadas a propósito.** No las tenemos medidas y es peor ponerlas mal que no ponerlas. Si se sacan de Google Maps, se añaden como `geo` en `business.ts`.
- Falta `priceRange`, que Google recomienda para negocios locales. No se ha puesto para no inventárselo.

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
