'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const COLORS: Record<string, string> = {
  // **El crema bueno es `#f7f3ec`.** Aquí se quedó el anterior (`#f6f4f1`)
  // cuando se cambió el de la marca, así que el fondo que pinta este
  // componente y el del `body` eran dos cremas distintos por dos puntos. No
  // se ve de uno en uno; se ve en el borde donde uno tapa al otro.
  bone: '#f7f3ec',
  night: '#0f1a2e',
};

/**
 * Fondo de toda la página, por detrás de las secciones. Cada sección declara
 * su color con `data-bg` y aquí se pone el de la que cruza el centro de la
 * pantalla.
 *
 * **Cambia de golpe, sin fundido** (2026-11-18, lo pidió el cliente: entre
 * secciones, cambio de color y no difuminado). Hasta entonces fundía en 0,7 s.
 *
 * **Vuelve a buscar las secciones al cambiar de página, y eso era un fallo
 * grave.** Vive en el layout, que no se vuelve a montar al navegar, y antes
 * buscaba las secciones una sola vez, al montarse: en la página siguiente
 * seguía mirando las de la anterior, que ya no existían, y caía siempre al
 * crema. Al entrar desde el menú en Servicios, Nosotros, Contacto, Cobertura
 * o una ficha de servicio, el fondo se quedaba crema y el titular, que en las
 * páginas oscuras es crema, desaparecía. Recargando se veía bien, por eso
 * tardó en cazarse. Ahora además cada página oscura pinta su propio fondo, así
 * que esto ya solo es la red de debajo.
 */
export default function Backdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      // Se buscan en cada pasada: son pocas, y así nunca se mira una sección
      // de otra página.
      const middle = window.innerHeight / 2;
      const active = Array.from(
        document.querySelectorAll<HTMLElement>('[data-bg]'),
      ).find((section) => {
        const box = section.getBoundingClientRect();
        return box.top <= middle && box.bottom >= middle;
      });
      element.style.backgroundColor =
        COLORS[active?.dataset.bg ?? 'bone'] ?? COLORS.bone;
    };

    update();
    // La página nueva puede tardar un fotograma en montar sus secciones.
    const siguiente = requestAnimationFrame(update);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      cancelAnimationFrame(siguiente);
      window.removeEventListener('scroll', update);
    };
  }, [pathname]);

  return <div ref={ref} aria-hidden="true" className="fixed inset-0 -z-10 bg-bone" />;
}
