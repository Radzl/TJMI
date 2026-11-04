'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * La pantalla que sale cuando algo se cae dentro del idioma.
 *
 * ## Por qué existe
 *
 * Sin este archivo, cualquier excepción en una página la atiende Next con su
 * pantalla por defecto: fondo blanco, texto en inglés, **sin menú, sin pie y
 * sin forma de contactar**. O sea que el peor momento de la visita es
 * justamente el único en el que la web deja de ser la web de la empresa.
 *
 * Este reemplazo mantiene navbar y pie —van en el `layout`, que no se cae con
 * la página— y, sobre todo, **deja a mano las dos salidas que de verdad
 * sirven**: reintentar y hablar con alguien. Un transportista pierde el
 * pedido si el cliente no encuentra el teléfono.
 *
 * ## El botón de reintentar no recarga la página
 *
 * `reset()` vuelve a renderizar solo el trozo que falló. Si el fallo era
 * pasajero —una petición que no llegó, un recurso que tardó— la página se
 * recompone sin perder el scroll ni volver a descargar nada. Recargar entero
 * sería lo contrario de lo que se quiere aquí.
 *
 * ## El error se registra, no se enseña
 *
 * El mensaje técnico no sale en pantalla: a quien está delante no le dice
 * nada y a veces filtra rutas internas. Va a la consola con su `digest`, que
 * es lo que permite cruzarlo con los registros del servidor. **Este es el
 * sitio donde engancharía un servicio de avisos** (Sentry o el de Vercel) el
 * día que se añada: junto con `Canvas3DBoundary`, son los dos únicos puntos
 * por los que pasa un fallo de esta web.
 */
export default function Error({ error, reset }: Props) {
  const t = useTranslations('pages.error');

  useEffect(() => {
    console.error('[error]', error.digest ?? '', error);
  }, [error]);

  return (
    <section className="flex min-h-[70svh] items-center py-24">
      <Container>
        <p className="flex items-center gap-4 font-display text-xs uppercase tracking-[0.18em] text-muted sm:tracking-[0.3em]">
          <span className="h-px w-10 bg-brand-red" aria-hidden="true" />
          {t('code')}
        </p>

        <h1 className="mt-6 max-w-3xl font-display text-4xl uppercase leading-[0.96] tracking-tight text-ink sm:text-5xl lg:text-6xl">
          {t('title')}
        </h1>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
          {t('intro')}
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-7 py-3 font-display text-sm uppercase tracking-widest text-white transition-colors hover:bg-brand-blue-dark"
          >
            {t('retry')}
          </button>
          <Button href="/" variant="outline">
            {t('home')}
          </Button>
          <Button href="/contacto" variant="outline">
            {t('contact')}
          </Button>
        </div>
      </Container>
    </section>
  );
}
