/**
 * Datos de la empresa en forma estructurada, para el marcado de buscadores.
 *
 * Están aquí y no en `messages` porque una dirección o un teléfono no se
 * traducen: son los mismos en español y en inglés. Los textos de pantalla
 * siguen en `messages`; esto es el mismo dato partido en campos, que es como
 * lo necesita Google.
 *
 * No hay coordenadas a propósito: no las tenemos medidas y es mejor no
 * ponerlas que ponerlas mal. Si algún día se sacan de Google Maps, se añaden
 * aquí como `geo` y se recogen en `BusinessJsonLd`.
 */

export type OpeningBlock = { opens: string; closes: string };

export type BusinessSite = {
  /** Ancla para el `@id` del marcado. */
  id: string;
  /** Cómo se llama esta sede, para distinguirla de la otra. */
  name: string;
  streetAddress: string;
  postalCode: string;
  addressLocality: string;
  addressRegion: string;
  telephone: string;
  /** Tramos de apertura de lunes a viernes. */
  hours: OpeningBlock[];
};

export const BUSINESS_SITES: BusinessSite[] = [
  {
    id: 'almazora',
    name: 'Transportes José María Ibáñez — Almazora (Castellón)',
    streetAddress: 'Partida Ramonet S/N',
    postalCode: '12550',
    addressLocality: 'Almazora',
    addressRegion: 'Castellón',
    telephone: '+34964532400',
    hours: [
      { opens: '09:00', closes: '13:00' },
      { opens: '15:00', closes: '19:00' },
    ],
  },
  {
    id: 'fuenlabrada',
    name: 'Transportes José María Ibáñez — Fuenlabrada (Madrid)',
    streetAddress: 'Av. de la Industria, 13',
    postalCode: '28947',
    addressLocality: 'Fuenlabrada',
    addressRegion: 'Madrid',
    telephone: '+34916423095',
    hours: [
      { opens: '08:00', closes: '14:00' },
      { opens: '15:00', closes: '17:00' },
    ],
  },
];

export const BUSINESS_EMAIL = 'trafico1@transjmi.com';
/** La sede principal, la que representa a la empresa entera. */
export const HEAD_OFFICE = BUSINESS_SITES[0];
