import type { MetadataRoute } from 'next';
import { COMPANY_NAME } from '@/lib/site';

/**
 * El manifiesto, en `/manifest.webmanifest`.
 *
 * ## Qué faltaba
 *
 * No había ninguno, así que «añadir a la pantalla de inicio» —que en un móvil
 * es lo que hace un cliente que va a volver— guardaba un acceso con **el
 * título de la pestaña recortado y una captura de la página** en vez del
 * nombre y el logo de la empresa. Para un negocio B2B al que se le escribe
 * por WhatsApp desde el teléfono, ese acceso directo es un contacto guardado.
 *
 * ## Las decisiones
 *
 * - **`start_url: '/'`, no `/es`.** La raíz redirige al idioma que toque, así
 *   que así el acceso directo respeta el idioma de quien lo guarda. Poner
 *   `/es` dejaría a los clientes europeos abriendo siempre en español.
 * - **`name` en español y no traducido.** Un manifiesto es uno solo para todo
 *   el sitio; Next no genera uno por idioma. El nombre de la empresa no se
 *   traduce y la descripción corta va en el idioma por defecto, que es el del
 *   mercado principal.
 * - **`theme_color` en el azul de marca y `background_color` en el crema.** El
 *   primero tiñe la barra del sistema mientras la web está abierta y el
 *   segundo es lo que se ve mientras arranca: el crema es el papel de esta
 *   web, así que el arranque no da un flash blanco.
 * - **`display: 'standalone'`** y no `browser`: guardada en la pantalla de
 *   inicio, se abre sin la barra de direcciones y parece una aplicación. No
 *   cambia nada para quien la visita por el navegador.
 * - **Los iconos van en `public/` y son cuadrados**, generados con
 *   `node scripts/gen-iconos.mjs` a partir de `public/logo.png`. El logo de la
 *   casa es apaisado (420 × 286) y un icono rectangular sale aplastado; ahí
 *   está escrito el porqué de cada tamaño.
 *
 * El proxy de idiomas no toca esta ruta porque su filtro deja fuera todo lo
 * que lleva un punto en el nombre, igual que con `sitemap.xml` y `robots.txt`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: COMPANY_NAME,
    short_name: 'TJMI',
    description:
      'Transporte terrestre de mercancía paletizada. Ruta diaria Castellón ⇄ Madrid, entrega en 24 horas.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f3ec',
    theme_color: '#34548a',
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
