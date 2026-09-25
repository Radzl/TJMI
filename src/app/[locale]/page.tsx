import { setRequestLocale } from 'next-intl/server';
import ExperienceCanvas from '@/components/3d/ExperienceCanvas';
import Cta from '@/components/sections/Cta';
import Hero from '@/components/sections/Hero';
import InRoute from '@/components/sections/InRoute';
import RoadIntro from '@/components/sections/RoadIntro';
import Route from '@/components/sections/Route';
import Services from '@/components/sections/Services';
import Sites from '@/components/sections/Sites';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* Intro animada: termina cuando el camión acaba el recorrido. */}
      <ExperienceCanvas />
      <Hero />
      <InRoute />
      <RoadIntro />

      {/* A partir de aquí, página normal sin 3D. */}
      <Services />
      <Route />
      <Sites />
      <Cta />
    </>
  );
}
