import { useTranslations } from 'next-intl';
import RouteMap from './RouteMap';

type Stop = { time: string; title: string; detail: string };

/** Puente entre los textos del servidor y el mapa, que es de cliente. */
export default function RouteMapSection() {
  const t = useTranslations('route');
  const stops = t.raw('mapStops') as Stop[];

  return (
    <RouteMap
      title={t('mapTitle')}
      intro={t('mapIntro')}
      origin={t('origin')}
      destination={t('destination')}
      distance={`${t('odometer.value')} ${t('odometer.unit')}`}
      stops={stops}
      legend={t.raw('mapLegend') as { pickup: string; delivery: string; sea: string }}
    />
  );
}
