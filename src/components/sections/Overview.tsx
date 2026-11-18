import { useTranslations } from 'next-intl';
import { sortedPosts } from '@/content/blog';
import { INDEX_PHOTOS, INDEX_VIDEO } from '@/content/media';
import IndicePaneles, { type Destacado, type Panel } from './IndicePaneles';

/**
 * El índice de la portada: entre el hero y la salida del camión, las cinco
 * secciones de la web en paneles que se abren. El movimiento vive en
 * `IndicePaneles`; esto solo reúne los textos y las fotos.
 *
 * ## El problema que resuelve, con los números delante
 *
 * Se midió la portada en pantallas completas y el reparto era este:
 *
 *   portada entera ............ 19,4 pantallas (23,6 en móvil)
 *   intro 3D .................. de la 0 a la 11,4
 *   primer servicio nombrado .. pantalla 11,4
 *   formulario / cierre ....... pantalla 18 de 19,4
 *
 * O sea que la intro se llevaba el **59 % de la página**, y en una web B2B la
 * mitad de la gente no pasa del 50-60 % de scroll: había un porcentaje grande
 * de visitas que **nunca llegaba a leer qué vende la empresa**. La intro es el
 * encargo y se queda; lo que no puede ser es que sea el único camino.
 *
 * ## De mosaico a paneles
 *
 * Fue un mosaico de cuatro tarjetas con mezcla de cosas —los seis servicios, los
 * metros de almacén, un recuento de preguntas, otro de artículos— bajo el
 * titular «El camión sale igual». El cliente lo vio con razón como información
 * que no venía a cuento: placas solares, recuentos y una frase sobre agosto en
 * el sitio donde tenía que decirse qué hay en la web.
 *
 * Ahora son **cinco paneles, uno por sección** —Servicios, Cobertura,
 * Nosotros, Blog y Preguntas—, cada uno con su foto (Nosotros, con un clip del
 * vídeo; Servicios y Preguntas, con el hueco preparado hasta que llegue la
 * suya), una línea y a dónde lleva, y al pie el botón de presupuesto y el
 * teléfono. Lo eligió el cliente entre tres propuestas («paneles que se
 * abren»).
 *
 * ## Por qué justo aquí
 *
 * Va **entre el hero y la salida del camión**: el camión acaba de cargarse, hay
 * un compás, y después arranca. Los disparadores de `ScrollChoreography`
 * cuelgan de `[data-scene]` y esta sección no lo lleva, así que no descoloca
 * ninguna escena aunque ahora se quede fija un rato.
 *
 * Lleva fondo **opaco** y su `data-bg`: si fuera transparente se vería el 3D
 * congelado detrás, que es justo lo que no se quiere enseñar.
 */
export default function Overview() {
  const t = useTranslations('overview');
  const tContact = useTranslations('contact');

  // La foto del blog es la portada de un artículo que **no** sale entre los
  // tres últimos: esos tres ya están en la franja del final de la portada, y
  // la misma foto dos veces en la misma página se lee como que no hay más.
  const articulos = sortedPosts();
  const fotoBlog = articulos[3]?.cover ?? articulos[0]?.cover ?? null;

  const paneles: Panel[] = [
    {
      id: 'services',
      href: '/servicios',
      foto: INDEX_PHOTOS.servicios.src,
      posicion: INDEX_PHOTOS.servicios.position,
    },
    {
      id: 'coverage',
      href: '/cobertura',
      foto: INDEX_PHOTOS.cobertura.src,
      posicion: INDEX_PHOTOS.cobertura.position,
    },
    { id: 'blog', href: '/blog', foto: fotoBlog },
    {
      id: 'faq',
      href: '/faq',
      foto: INDEX_PHOTOS.faq.src,
      posicion: INDEX_PHOTOS.faq.position,
    },
  ].map((panel) => ({
    ...panel,
    nombre: t(`panels.${panel.id}.name`),
    texto: t(`panels.${panel.id}.text`),
    cta: t(`panels.${panel.id}.cta`),
  }));

  // Nosotros va aparte, en una banda con diez segundos del vídeo de la casa en
  // bucle (ver `INDEX_VIDEO` y la banda en `IndicePaneles`).
  const destacado: Destacado = {
    href: '/nosotros',
    video: INDEX_VIDEO.src,
    nombre: t('panels.about.name'),
    texto: t('panels.about.text'),
    cta: t('panels.about.cta'),
  };

  return (
    <IndicePaneles
      titulo={t('title')}
      paneles={paneles}
      destacado={destacado}
      ctaPrevio={t('ctaLead')}
      cta={t('cta')}
      telefono={tContact('sites.0.phone')}
      telefonoHref={tContact('sites.0.phoneHref')}
    />
  );
}
