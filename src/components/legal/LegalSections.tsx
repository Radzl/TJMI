export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

/** Cuerpo de las páginas legales: bloques de titular + párrafos. */
export default function LegalSections({
  sections,
}: {
  sections: LegalSection[];
}) {
  return (
    <div className="flex flex-col gap-12">
      {sections.map((section) => (
        <section key={section.heading}>
          <h2 className="font-display text-xl uppercase tracking-tight text-ink sm:text-2xl">
            {section.heading}
          </h2>

          <div className="mt-5 flex flex-col gap-4">
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="max-w-3xl text-base leading-relaxed text-muted"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * Aviso de que el documento está a medias. Se ve a propósito: es para que no
 * se publique sin rellenar los datos de la empresa.
 */
export function PendingNotice({ children }: { children: string }) {
  return (
    <p className="mb-12 max-w-3xl rounded-2xl border-l-4 border-brand-red-ink bg-white p-6 text-sm leading-relaxed text-ink">
      {children}
    </p>
  );
}
