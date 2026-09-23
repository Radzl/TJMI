import { setRequestLocale } from 'next-intl/server';
import ExperienceCanvas from '@/components/3d/ExperienceCanvas';
import Cta from '@/components/sections/Cta';
import Hero from '@/components/sections/Hero';
import InRoute from '@/components/sections/InRoute';
import Route from '@/components/sections/Route';
import Services from '@/components/sections/Services';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ExperienceCanvas />
      <Hero />
      <InRoute />
      <Services />
      <Route />
      <Cta />
    </>
  );
}
