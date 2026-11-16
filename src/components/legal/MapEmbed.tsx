'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { updateConsent, useConsent, useHydrated } from '@/lib/consent';

type Props = {
  src: string;
  title: string;
  /** Enlace a Google Maps, para quien no quiere aceptar las cookies. */
  mapUrl: string;
  /**
   * Foto de la sede. Cuando la haya, es **lo que se ve por defecto** en vez
   * del bloque de texto: así el hueco deja de parecer un error para la
   * mayoría, que es la que no acepta cookies de terceros.
   */
  photo?: string;
  /**
   * Un dibujo propio que va de fondo mientras no hay permiso para el mapa
   * de Google (ver `SiteLocator`). Si hay foto, manda la foto.
   */
  fondo?: ReactNode;
};

/**
 * Mapa de Google que no se carga hasta tener permiso.
 *
 * El iframe no existe en el DOM mientras no haya consentimiento: si estuviera
 * con `src` vacío o escondido, Google podría llegar a poner sus cookies igual.
 * Quien rechaza ve la dirección y un enlace directo a Maps, así que sigue
 * pudiendo llegar a la nave.
 */
export default function MapEmbed({ src, title, mapUrl, photo, fondo }: Props) {
  const t = useTranslations('cookies');
  const consent = useConsent();
  const hydrated = useHydrated();

  if (hydrated && consent?.maps) {
    return (
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-64 w-full border-0"
      />
    );
  }

  const conDibujo = !photo && Boolean(fondo);

  return (
    <div
      className={`relative flex h-64 flex-col gap-4 overflow-hidden bg-bone px-6 ${
        conDibujo
          ? 'items-start justify-end pb-5 text-left'
          : 'items-center justify-center text-center'
      }`}
    >
      {/* **Sin foto, un mapa nuestro.** El párrafo centrado sobre crema se
          leía como un fallo de carga. El dibujo de la zona (`SiteLocator`)
          no carga nada de nadie, así que puede estar desde el primer momento,
          y el aviso y los botones pasan a una franja abajo, sobre un
          degradado del color del papel para que se lean encima del mapa. */}
      {conDibujo && (
        <>
          {fondo}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-bone via-bone/85 to-transparent"
          />
        </>
      )}
      {/* **Con foto, la foto manda.** El bloque de texto centrado sobre crema
          con un botón azul se lee como un error de carga, y lo ve la mayoría:
          casi nadie acepta cookies de terceros. Una foto de la nave hace que
          el hueco sea contenido y no un aviso, y quien quiera el mapa de
          verdad lo tiene a un clic. */}
      {photo && (
        <>
          <span aria-hidden="true" className="absolute inset-0">
            <span className="photo block h-full w-full">
              <Image
                src={photo}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </span>
            <span className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/55 to-night/25" />
          </span>
        </>
      )}

      <p
        className={`relative max-w-sm text-sm leading-relaxed ${
          photo ? 'text-white/85' : 'text-muted'
        }`}
      >
        {t('mapBlocked')}
      </p>

      <div
        className={`relative flex flex-wrap items-center gap-5 ${
          conDibujo ? 'justify-start' : 'justify-center'
        }`}
      >
        <button
          type="button"
          onClick={() => updateConsent({ maps: true })}
          className="inline-flex items-center justify-center rounded-full bg-brand-blue px-6 py-2.5 font-display text-xs uppercase tracking-widest text-white transition-colors hover:bg-brand-blue-dark"
        >
          {t('mapShow')}
        </button>

        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm underline underline-offset-4 ${
            photo ? 'text-white/80 hover:text-white' : 'text-muted hover:text-brand-blue'
          }`}
        >
          {t('mapExternal')}
        </a>
      </div>
    </div>
  );
}
