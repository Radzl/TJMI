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

Decisiones cerradas (2026-09-22):
- La escena de apertura es **grúa portacontenedores + contenedor**, no carretilla con palés.
- El **logo de TJMI va como textura en la lona lateral del remolque** (y pequeño en la puerta de la tractora). Es el requisito de marca de la intro.
- Los modelos 3D salen de **stock optimizado** (licencia CC0/CC-BY revisada), no modelados a medida.
- Trato al cliente: **tuteo** en todos los textos.

| # | Escena | Qué pasa | Texto |
|---|--------|----------|-------|
| 1 | Hero – Terminal | Fondo blanco, vista lateral. Una grúa portacontenedores (reach stacker) coge un contenedor de una pila y lo deposita sobre el semirremolque. Idle loop suave antes de hacer scroll. | Logo + claim corto + indicador "scroll" |
| 2 | Carga completa | Al hacer scroll la grúa suelta el contenedor y sale de plano, la cabeza tractora se engancha/arranca. Leve desaturación. | — |
| 3 | En ruta | El suelo se convierte en línea de horizonte. La sección azul noche sube desde abajo y el camión queda "posado" sobre ella. Titular con efecto ScrambleText. | "Cada día, de Castellón a Madrid." / subtítulo + botón "Sobre nosotros" |
| 4 | Servicios | Sección fijada (pin) con scroll horizontal. Palabra gigante "SERVICIOS" en contorno detrás del camión desplazándose. Tarjetas de servicio entrando en horizontal. | Servicios reales de TJMI (ver `messages/es.json`) |
| 5 | La ruta | La cámara gira a vista cenital. Carretera negra sobre blanco que dibuja la ruta Castellón → Madrid; el camión la recorre con el scroll. Hitos a lo largo del trazado (salida diaria, km, horas, entrega). | "Fiabilidad en cada kilómetro." |
| 6 | Llegada / CTA | El camión llega a destino. Fin del 3D; transición a contenido normal. | Formulario de presupuesto + WhatsApp |

## Rendimiento y accesibilidad (obligatorio)
- Modelos GLB optimizados: Draco o Meshopt, texturas ≤ 1024 px (KTX2/WebP), objetivo < 2 MB total de 3D.
- `dpr={[1, 1.5]}`, sombras baratas (`ContactShadows` o sombras horneadas), postprocesado mínimo.
- `prefers-reduced-motion`: sin scrub; mostrar imágenes estáticas de cada escena.
- Móvil: misma historia, escena simplificada (menos objetos, sin postprocesado). Probar en móvil real antes de cerrar cada fase.
- Preloader con progreso real (`useProgress` de drei) y máximo ~2 s percibidos.
- Lighthouse objetivo: Performance ≥ 80 en móvil, Accesibilidad ≥ 95.
- Todo el texto importante existe en HTML (SEO), nunca solo dentro del Canvas.

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
