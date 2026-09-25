import { notFound } from 'next/navigation';

/**
 * Cualquier URL que no exista dentro de un idioma cae aquí y se manda al 404
 * propio. Sin esta ruta comodín Next enseña su pantalla de error por defecto,
 * sin navbar, sin pie y sin idioma.
 */
export default function CatchAllPage() {
  notFound();
}
