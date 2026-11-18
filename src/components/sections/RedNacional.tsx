import { useTranslations } from 'next-intl';
import MapaRed from './MapaRed';

/**
 * Puente entre los textos del servidor y el mapa de la red, que es de cliente.
 *
 * En la portada va **fijo y atado al scroll**, ocupando el sitio que dejó la
 * carretera en 3D. En `/cobertura` va `estatico`: entero desde el principio y
 * sin fijarse, porque allí el mapa es un dato que se consulta, no un momento.
 * Es el mismo componente en los dos sitios a propósito: así la web tiene un
 * solo mapa y no dos que cuentan cosas distintas.
 */
export default function RedNacional({ estatico = false }: { estatico?: boolean }) {
  const t = useTranslations('route');

  return (
    <MapaRed
      estatico={estatico}
      textos={{
        titulo: t('title'),
        subtitulo: t('subtitle'),
        km: t('odometer.value'),
        unidad: t('odometer.unit'),
        etiqueta: t('odometer.label'),
        red: t('network.line'),
        diaria: t('network.daily'),
        resto: t('network.rest'),
        mapa: t('network.mapLabel'),
      }}
    />
  );
}
