import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { SERVICE_PATHS } from '@/content/services';
import { COMPANY_NAME, SITE_URL } from '@/lib/site';

/**
 * Todas las rutas fijas de la web, sin el prefijo de idioma.
 *
 * Es la lista que alimenta el sitemap. Si añades una página, añádela aquí o
 * Google no se enterará de que existe.
 */
export const SITE_PATHS = [
  '',
  '/servicios',
  // Las seis páginas de servicio salen de `content/services.ts`, así que
  // añadir un servicio allí lo mete en el sitemap sin tocar nada aquí.
  ...SERVICE_PATHS,
  '/nosotros',
  '/cobertura',
  '/blog',
  '/faq',
  '/contacto',
  '/cookies',
  '/privacidad',
  '/aviso-legal',
];

/**
 * **Los identificadores del grafo de entidades, en un solo sitio.**
 *
 * Esto no es manía de ordenar: estaban escritos a mano en dos archivos y **no
 * coincidían**. `BusinessJsonLd` declaraba la empresa como `#organizacion` y
 * las seis páginas de servicio decían que su proveedor era `#empresa`, que no
 * existe en ninguna parte. O sea que el enlace entre un servicio y la empresa
 * que lo presta —que es justo lo que ese marcado está para decir— llevaba
 * roto desde que se escribió, sin dar ningún error y con la documentación
 * afirmando que funcionaba.
 *
 * Una referencia por `@id` a un nodo que no existe no es medio correcta: para
 * Google es un servicio sin proveedor conocido.
 */
export const ORGANIZATION_ID = `${SITE_URL}/#organizacion`;
export const WEBSITE_ID = `${SITE_URL}/#web`;

/**
 * Open Graph pide el idioma en formato `idioma_TERRITORIO`, no el código de
 * dos letras. Estaba saliendo `es` a secas, que es inválido y los lectores
 * —WhatsApp y LinkedIn, que es por donde se comparte esto— se lo saltan.
 */
export const OG_LOCALE: Record<string, string> = {
  es: 'es_ES',
  en: 'en_GB',
};

/**
 * La imagen que se ve al pegar un enlace en WhatsApp, LinkedIn o Slack.
 *
 * **No había ninguna en toda la web**, así que cada enlace compartido salía
 * como un recuadro de texto gris. Para una empresa que se vende por carretera
 * y cuyo cliente comparte presupuestos por WhatsApp, eso es tirar el canal.
 *
 * Es la foto del camión de verdad y no una imagen generada: 1500 × 843
 * (relación 16:9) cumple de sobra el mínimo de 600 px de ancho y queda cerca
 * del 1200 × 630 ideal. Cuando el cliente mande una foto apaisada a 1200 × 630
 * se cambia aquí y se arreglan las 32 páginas a la vez.
 */
export const DEFAULT_OG_IMAGE = {
  url: '/media/camion-01.jpg',
  width: 1500,
  height: 843,
};

/**
 * Dónde corta Google el título en los resultados.
 *
 * El corte real es por píxeles (unos 580) y no por caracteres, pero en texto
 * latino 60 caracteres es la equivalencia que se usa y la que se puede
 * comprobar con un número.
 */
const TITLE_MAX = 60;

/**
 * Canonical y hreflang de una página.
 *
 * El canonical le dice a Google cuál es la dirección buena de esta página, y
 * el hreflang que la versión en español y la inglesa son la misma página en
 * dos idiomas, no contenido duplicado. `x-default` es a cuál mandar a quien
 * no encaje en ninguno de los dos.
 *
 * Las URL van relativas: el `metadataBase` del layout les pone el dominio.
 */
export function pageAlternates(locale: string, path = '') {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(
        routing.locales.map((code) => [code, `/${code}${path}`]),
      ),
      'x-default': `/${routing.defaultLocale}${path}`,
    },
  };
}

type PageMetaInput = {
  locale: string;
  /** Ruta sin idioma, empezando por `/`. La portada es `''`. */
  path?: string;
  /** El nombre corto de la página. La portada no lo pasa. */
  title?: string;
  description: string;
  /** `article` solo para las entradas del blog. */
  type?: 'website' | 'article';
  publishedTime?: string;
  /** Imagen propia. Si no se pasa, va la del sitio. Las medidas son una
      ayuda para el lector, no un requisito: una portada de artículo puede
      venir sin ellas. */
  image?: { url: string; width?: number; height?: number };
  imageAlt: string;
};

/**
 * Los metadatos de una página, completos y de una sola pieza.
 *
 * ## El fallo que esto arregla, que no era pequeño
 *
 * Cada página declaraba su `title`, su `description` y sus `alternates`, y
 * **ninguna declaraba `openGraph`**. Los metadatos de Next no se funden campo
 * a campo entre capas: si una página no define `openGraph`, hereda **entero**
 * el del layout. Y el del layout es el de la portada. Medido sobre el HTML
 * servido: **30 de las 32 páginas enseñaban el título y la descripción de la
 * portada al compartirlas**. O sea que mandar por WhatsApp la página de
 * grupaje y mandar la portada se veía exactamente igual.
 *
 * No se arregla pidiéndole a cada página que se acuerde de repetir sus datos
 * en tres sitios —así es como se volvió a romper—, sino construyéndolos aquí
 * una vez. Una página pasa título y descripción y le salen el `<title>`, la
 * descripción, el canonical, los hreflang, Open Graph y la tarjeta de Twitter
 * coherentes entre sí.
 *
 * ## La marca va en el título **mientras quepa**
 *
 * El layout le añade « | Transportes José María Ibáñez» a todo, y eso son 32
 * caracteres de los ~60 que Google enseña. Medido: diez de los dieciséis
 * títulos en español se pasaban, y en los de servicio el corte caía dentro del
 * nombre de la empresa, que es la peor forma de gastarlo.
 *
 * Así que la regla es automática y se mide, no se decide página a página: si
 * el título con la marca pasa de 60, la marca se cae y se queda el título
 * solo. En una página de servicio «Grupaje de palés Castellón ⇄ Madrid» dice
 * mucho más que media marca cortada, y la marca sigue a la vista en el dominio
 * y en la miga de pan del propio resultado.
 */
export function pageMetadata({
  locale,
  path = '',
  title,
  description,
  type = 'website',
  publishedTime,
  image,
  imageAlt,
}: PageMetaInput): Metadata {
  const og = image ?? DEFAULT_OG_IMAGE;
  const full = title ? `${title} | ${COMPANY_NAME}` : COMPANY_NAME;
  const cabe = full.length <= TITLE_MAX;

  return {
    // Sin título, el layout pone el suyo (es el caso de la portada).
    ...(title ? { title: cabe ? title : { absolute: title } } : {}),
    description,
    alternates: pageAlternates(locale, path),
    openGraph: {
      type,
      ...(publishedTime ? { publishedTime } : {}),
      // El de Open Graph es el título ya resuelto, con marca o sin ella: lo
      // que se lee en la tarjeta tiene que ser lo mismo que en Google.
      title: title ? (cabe ? full : title) : undefined,
      description,
      url: `${SITE_URL}/${locale}${path}`,
      siteName: COMPANY_NAME,
      locale: OG_LOCALE[locale] ?? OG_LOCALE.es,
      alternateLocale: routing.locales
        .filter((code) => code !== locale)
        .map((code) => OG_LOCALE[code]),
      images: [{ ...og, alt: imageAlt }],
    },
    twitter: {
      // Con imagen, la tarjeta grande. Estaba en `summary`, que es el recuadro
      // pequeño y se queda igual de soso aunque haya foto.
      card: 'summary_large_image',
      title: title ? (cabe ? full : title) : undefined,
      description,
      images: [og.url],
    },
  };
}

/**
 * La empresa, en la forma mínima para referenciarla desde otra página.
 *
 * No basta con poner `{ '@id': ... }` a secas en una página donde el nodo de
 * la empresa no está declarado —y solo está en la portada y en contacto—:
 * para esa página es una referencia a la nada. Declarando el mismo `@id` con
 * su nombre, Google funde las dos en la misma entidad en vez de inventarse
 * una por página.
 */
export function organizationRef() {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: COMPANY_NAME,
  };
}

/** Un escalón de la miga de pan. */
export type Crumb = { name: string; path: string };

/**
 * Marcado `BreadcrumbList`.
 *
 * Vivía dentro de `PageHeader`, así que lo tenían todas las páginas **menos
 * las entradas del blog**, que son las únicas que no usan esa cabecera. Y son
 * justo las más hondas de la web, que es donde la miga de pan sirve para algo:
 * en el resultado de Google se ve «Inicio › Blog › …» en vez de la dirección
 * cruda.
 */
export function breadcrumbJsonLd(locale: string, trail: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: step.name,
      // La portada es `''` y no `'/'`: con la barra saldría
      // `.../es/`, que es otra dirección que la canónica.
      item: `${SITE_URL}/${locale}${step.path === '/' ? '' : step.path}`,
    })),
  };
}
