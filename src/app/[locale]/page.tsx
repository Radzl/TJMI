import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import ExperienceCanvas from '@/components/3d/ExperienceCanvas';
import Cta from '@/components/sections/Cta';
import Hero from '@/components/sections/Hero';
import Overview from '@/components/sections/Overview';
import InRoute from '@/components/sections/InRoute';
import LatestPosts from '@/components/sections/LatestPosts';
import RoadIntro from '@/components/sections/RoadIntro';
import Reviews from '@/components/sections/Reviews';
import Route from '@/components/sections/Route';
import RouteMapSection from '@/components/sections/RouteMapSection';
import Services from '@/components/sections/Services';
import Sites from '@/components/sections/Sites';
import { pageMetadata } from '@/lib/seo';
import BusinessJsonLd from '@/components/seo/BusinessJsonLd';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = await getTranslations({ locale, namespace: 'meta' });

  // Sin `title`: la portada se queda con el del layout, que ya lleva la marca
  // delante. Lo que sí necesita es todo lo demás —Open Graph, la imagen y la
  // tarjeta social—, que antes no tenía ninguna página.
  return pageMetadata({
    locale,
    description: meta('description'),
    imageAlt: meta('ogAlt'),
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <BusinessJsonLd locale={locale} />

      {/* Intro animada: termina cuando el camión acaba el recorrido. */}
      <ExperienceCanvas />
      <Hero />
      {/* **El índice de la casa va aquí, y el sitio es parte de la decisión.**
          La intro se llevaba el 59 % de la portada —medido: el primer servicio
          no se nombraba hasta la pantalla 11,4 de 19,4— y en B2B la mitad de
          las visitas no pasan del 50-60 % de scroll. Esto lo mueve a la 4,2, y
          además enseña que detrás de la intro hay nosotros, blog, calculadora
          y preguntas, que desde la portada no se intuía.

          Encaja con el guion en vez de pelearse con él: el camión acaba de
          cargarse, hay un compás, y después arranca. Y no descoloca ninguna
          escena, porque los disparadores cuelgan de `[data-scene]` y esta
          sección no lo lleva. */}
      <Overview />
      <InRoute />
      <RoadIntro />

      {/* A partir de aquí, página normal sin 3D. */}
      <Services />
      <Route />
      <RouteMapSection />
      <Sites />
      {/* Los tres últimos artículos: lo que conviene saber, justo antes de
          pedir presupuesto. Ver la cabecera de `LatestPosts`. */}
      <LatestPosts />
      {/* **La prueba social cae justo antes de pedir algo**, que es cuando
          sirve: «aquí estamos — esto dicen de nosotros — cuéntanos qué
          necesitas». Más arriba, entre los servicios, sería una interrupción;
          más abajo del cierre, no la lee nadie. Mientras no haya reseñas de
          verdad no se pinta nada en producción. */}
      <Reviews />
      <Cta />
    </>
  );
}
