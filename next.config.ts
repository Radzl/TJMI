import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const dev = process.env.NODE_ENV === 'development';

/**
 * Política de seguridad de contenido.
 *
 * **Se puede apretar tanto porque esta web casi no tiene terceros**, y eso no
 * es casualidad: la regla del proyecto es que nada de fuera se carga sin
 * consentimiento. Comprobado antes de escribirla:
 *
 * - Las tipografías van por `next/font/google`, que **las descarga en el build
 *   y las sirve desde nuestro dominio**. No hay ni una petición a Google en
 *   tiempo de ejecución, así que `font-src` no necesita abrirse.
 * - El 3D monta su `Environment` con `Lightformer` dentro de la escena, no con
 *   un HDRI descargado.
 * - El único tercero es el **iframe de Google Maps**, y solo existe en el DOM
 *   cuando hay consentimiento. De ahí el `frame-src`.
 *
 * Lo que sí hay que abrir, y conviene saber por qué:
 *
 * - `'unsafe-inline'` en los scripts: Next inyecta scripts en línea para la
 *   hidratación. Quitarlo pide nonces por petición, o sea pasar por el proxy
 *   y renunciar al prerenderizado estático de las 30 páginas. No compensa.
 * - `'unsafe-inline'` en los estilos: Tailwind y Next escriben estilos en
 *   línea; es lo normal y el riesgo es mucho menor que en scripts.
 * - `blob:` en imágenes, trabajadores **y conexiones**: el 3D genera texturas
 *   en lienzo (`curtainSkin.ts`, las sombras de contacto) y los cargadores de
 *   drei levantan trabajadores desde blobs.
 *
 *   **Lo de `connect-src` costó una comprobación y es el que menos se ve
 *   venir.** Con `connect-src 'self'` a secas el 3D **no arranca**:
 *   `GLTFLoader` saca las texturas de los GLB creando un blob por cada una y
 *   pidiéndolas con `fetch`, así que el navegador las bloquea una a una
 *   —«Couldn't load texture blob:...»— y el lienzo se queda sin montar. Se
 *   vio leyendo la consola, no mirando la página: la portada seguía
 *   pintándose entera y el fallo era que detrás no había nada.
 * - En desarrollo hacen falta además `'unsafe-eval'` y `ws:`, que son el
 *   recargado en caliente. **En producción no se abren.**
 *
 *   **`'wasm-unsafe-eval'` sí, y en producción también: sin ella no hay 3D.**
 *   Es el segundo fallo de esta misma cabecera que no se ve venir, y es
 *   hermano del de `connect-src`. `truck.glb` **requiere**
 *   `EXT_meshopt_compression` —lo declara en su propio `extensionsRequired`—
 *   y ese descompresor es **WebAssembly**, así que el navegador lo bloquea:
 *   «Could not load /models/truck.glb: WebAssembly.instantiate() violates the
 *   following Content Security policy directive». Sin camión no hay escena, y
 *   la página se iba al modo «sin 3D» en producción.
 *
 *   **Y se coló porque la comprobación se hizo en desarrollo**, donde
 *   `'unsafe-eval'` está abierto y por tanto el wasm pasa. La cabecera de
 *   producción no se había mirado nunca con la escena delante.
 *
 *   La directiva que hace falta es la estrecha, no `'unsafe-eval'`:
 *   `'wasm-unsafe-eval'` permite compilar WebAssembly y **nada más** —en
 *   particular no permite `eval()` de cadenas de JavaScript, que es el
 *   riesgo de verdad—. La entienden Chrome 97+, Firefox 102+ y Safari 16.4+;
 *   un navegador más viejo la ignora, no abre wasm y cae en el respaldo
 *   `sin3d`, que para eso está.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${dev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "worker-src 'self' blob:",
  `connect-src 'self' blob:${dev ? ' ws: wss:' : ''}`,
  'frame-src https://maps.google.com https://www.google.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const nextConfig: NextConfig = {
  // Quita el distintivo flotante de Next en desarrollo: tapaba la esquina y
  // se confundía con un elemento de la propia web.
  devIndicators: false,

  /**
   * AVIF antes que WebP.
   *
   * Las ocho fotos de la casa son JPEG y pesan 6,5 MB en disco. `next/image`
   * ya las reconvierte, pero por defecto solo a WebP; añadiendo AVIF sirve el
   * formato que más comprime a quien lo admite, que hoy es prácticamente
   * todo el mundo, y cae a WebP en el resto. No hay que tocar ni un archivo.
   */
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  /**
   * Cabeceras de seguridad.
   *
   * **No había ninguna.** Este archivo tenía once líneas y solo apagaba el
   * distintivo de desarrollo. Sin `frame-ancestors` cualquiera puede meter
   * esta web dentro de un iframe y hacerla pasar por suya, que es el fraude
   * más barato que existe con una web de empresa.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          // Redundante con `frame-ancestors` para navegadores viejos, y no
          // estorba.
          { key: 'X-Frame-Options', value: 'DENY' },
          // Sin esto, un archivo servido con el tipo equivocado puede
          // ejecutarse como otra cosa.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Al salir a otro dominio solo se manda el origen, no la ruta
          // completa: la página concreta que estaba mirando el visitante es
          // suya, no del destino.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Esta web no usa cámara, micrófono ni ubicación. Decirlo evita que
          // un script de terceros los pida algún día.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Dos años, subdominios incluidos. Solo lo aplica el navegador
          // cuando ya ha entrado por HTTPS, así que en local no estorba.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
