import type { ReactNode } from 'react';

type Props = {
  title: string;
  lead?: ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
};

/**
 * Cabecera de sección: el titular, y nada más.
 *
 * Llevaba **número, filete rojo y antetítulo en versales**. Las tres se han
 * quitado, y conviene dejar escrito el porqué para que no vuelvan solas:
 *
 *  - El **número** (`01`, `02`, `03`) decía algo que no era verdad. Numerar
 *    afirma que hay una secuencia, y Servicios, Cobertura y Sedes no son pasos
 *    de nada: se pueden leer en cualquier orden. Un marcador numérico solo se
 *    gana su sitio cuando el contenido de verdad va en orden.
 *  - El **antetítulo** repetía el titular con otras palabras. Una etiqueta
 *    encima de un encabezado que no añade información es ruido con aspecto de
 *    jerarquía.
 *  - El **filete** acompañaba a los dos anteriores. Sin ellos, se queda
 *    decorando.
 *
 * Y se ha ido también la entrada línea a línea (`RevealHeading`). No porque
 * estuviera mal hecha, sino por dónde estaba: repetida en todas las secciones,
 * una misma entrada deja de ser un momento y pasa a ser un tic. Esta página ya
 * tiene su momento orquestado, y es la intro 3D. Lo demás se calla.
 *
 * Lo que queda es el titular haciendo el trabajo con tamaño y condensación,
 * que es para lo que se eligió una condensada robusta.
 */
export default function SectionHeading({
  title,
  lead,
  tone = 'light',
  className = '',
}: Props) {
  const dark = tone === 'dark';

  return (
    <header className={className}>
      <h2
        className={`font-display text-display-md uppercase ${
          dark ? 'text-white' : 'text-ink'
        }`}
      >
        {title}
      </h2>

      {lead && (
        <p
          className={`mt-6 max-w-xl text-lg leading-relaxed ${
            dark ? 'text-white/70' : 'text-muted'
          }`}
        >
          {lead}
        </p>
      )}
    </header>
  );
}
