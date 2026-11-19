# Transportes José María Ibáñez: instrucciones para agentes de IA

Web corporativa con una intro 3D ligada al scroll. Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Three.js con React Three Fiber, GSAP + ScrollTrigger, Lenis y next-intl.

## Antes de tocar código

- Next.js 16 trae cambios incompatibles con versiones anteriores: consulta la guía en `node_modules/next/dist/docs/` (ver `AGENTS.md`).
- Las notas detalladas del proyecto (decisiones, medidas e historial) están en `CLAUDE.local.md`, que no se versiona. Las notas nuevas van ahí, no aquí.

## Arquitectura de la escena 3D

1. Un único `<Canvas>` fijo detrás del contenido. Nunca varios.
2. Se carga con `dynamic(..., { ssr: false })` y todo lo 3D es `'use client'`.
3. Las secciones HTML van encima y son las que generan la altura del scroll.
4. GSAP ScrollTrigger escribe el progreso de cada escena en un store de Zustand.
5. Los componentes de React Three Fiber lo leen dentro de `useFrame` con `getState()`. Nada de `setState` por fotograma.
6. Lenis va sincronizado con ScrollTrigger.
7. Los tramos de scroll que comparten la escena y los textos están en `src/lib/partitura.ts`. No dupliques fracciones en otros archivos.

## Reglas

- Idiomas: español por defecto e inglés. Los textos de la interfaz van en `src/messages/es.json` y `src/messages/en.json`.
- No se carga nada de terceros (fuentes, HDRI, scripts) sin permiso explícito.
- Un solo sistema de animación: GSAP para lo ligado al scroll y CSS para las microinteracciones. No añadas otra librería.
- La web tiene que funcionar sin WebGL y con movimiento reducido.

## Comprobaciones

- Antes de dar un cambio por terminado: `npm run lint` y `npx next build`.
- Si tocas la escena 3D: `npm run check:3d`, que compara capturas con `tests/visual/baseline`.
- Según lo que toques: `npm run check:seo`, `check:fotos`, `check:formulario` o `check:errores`.

## Al terminar

Explica qué has cambiado y cómo probarlo, en español y sin jerga innecesaria.
