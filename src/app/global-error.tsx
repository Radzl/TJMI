'use client';

import { useEffect } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * El último recurso: la pantalla que sale cuando se cae el propio `layout`.
 *
 * ## Por qué no se parece al resto de la web
 *
 * Porque **no puede**. Este componente sustituye al documento entero, así que
 * tiene que traer su propio `<html>` y su propio `<body>`, y se renderiza con
 * el layout ya caído: no hay proveedor de idioma, así que no hay
 * traducciones, y no hay garantía de que las fuentes ni los estilos de la
 * casa hayan llegado a cargarse. Por eso los colores van escritos a mano y la
 * tipografía es la del sistema.
 *
 * Dicho de otro modo: esto no es una página de la web, es **la nota que queda
 * cuando la web no está**. Su único trabajo es no ser una pantalla en blanco
 * y dejar un teléfono a la vista.
 *
 * El texto va en español y en inglés, uno debajo del otro, porque sin
 * `next-intl` no hay forma de saber en qué idioma estaba el visitante.
 *
 * Casi nunca se va a ver: el `error.tsx` del idioma atiende todo lo que pasa
 * dentro de una página. Esto solo entra si revienta el layout mismo.
 */
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[global-error]', error.digest ?? '', error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#f7f3ec',
          color: '#11151c',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          lineHeight: 1.6,
        }}
      >
        <main style={{ maxWidth: '34rem' }}>
          <span
            aria-hidden="true"
            style={{
              display: 'block',
              width: '3.5rem',
              height: '2px',
              backgroundColor: '#d03b40',
            }}
          />

          <h1
            style={{
              margin: '1.75rem 0 0',
              fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
            }}
          >
            La web no ha podido cargar
          </h1>

          <p style={{ margin: '1.25rem 0 0', color: '#5c6673' }}>
            Prueba a recargar. Si sigue igual, llámanos al{' '}
            <a href="tel:+34964532400" style={{ color: '#34548a' }}>
              964 53 24 00
            </a>{' '}
            o escríbenos a{' '}
            <a href="mailto:trafico1@transjmi.com" style={{ color: '#34548a' }}>
              trafico1@transjmi.com
            </a>
            .
          </p>

          <p style={{ margin: '0.5rem 0 0', color: '#5c6673' }} lang="en">
            The site failed to load. Please try again, or call us on +34 964 53
            24 00.
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '2rem',
              border: 0,
              borderRadius: '999px',
              padding: '0.85rem 1.75rem',
              backgroundColor: '#34548a',
              color: '#fff',
              fontSize: '0.875rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
