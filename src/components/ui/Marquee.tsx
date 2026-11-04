type Props = {
  items: string[];
};

/**
 * Banda de marca en movimiento continuo.
 *
 * Es el gesto más "de transporte" que se le puede poner a una página: una
 * tira rotulada que no para. Cierra la sección oscura y hace de bisagra con la
 * clara, así que el salto de fondo deja de ser un corte.
 *
 * El rojo va en tira fina a propósito: la marca lo quiere como acento, nunca
 * como fondo masivo.
 *
 * Son dos copias idénticas de la lista y la animación desplaza la mitad del
 * conjunto, así que el bucle no tiene costura. La segunda copia va oculta a
 * los lectores de pantalla, que si no leerían todo dos veces. Con movimiento
 * reducido la animación se para sola (ver `globals.css`).
 */
export default function Marquee({ items }: Props) {
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-brand-red py-3.5">
      <div className="animate-marquee flex w-max">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="flex shrink-0 items-center"
            aria-hidden={copy === 1 ? true : undefined}
          >
            {items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-8 whitespace-nowrap px-8 font-display text-sm uppercase tracking-[0.25em] text-white"
              >
                {item}
                <span
                  className="h-1.5 w-1.5 rotate-45 bg-white/60"
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
