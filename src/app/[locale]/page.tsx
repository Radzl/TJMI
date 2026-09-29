import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import ExperienceCanvas from '@/components/3d/ExperienceCanvas';
import Cta from '@/components/sections/Cta';
import Hero from '@/components/sections/Hero';
import InRoute from '@/components/sections/InRoute';
import RoadIntro from '@/components/sections/RoadIntro';
import Route from '@/components/sections/Route';
import RouteMapSection from '@/components/sections/RouteMapSection';
import Services from '@/components/sections/Services';
import Sites from '@/components/sections/Sites';
import { pageAlternates } from '@/lib/seo';
import BusinessJsonLd from '@/components/seo/BusinessJsonLd';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  // La portada se queda con el título y la descripción del layout.
  return { alternates: pageAlternates(locale, '') };
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
      <InRoute />
      <RoadIntro />

      {/* A partir de aquí, página normal sin 3D. */}
      <Services />
      <Route />
      <RouteMapSection />
      <Sites />
      <Cta />
    </>
  );
}
