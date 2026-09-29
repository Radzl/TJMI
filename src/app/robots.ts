import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * `/robots.txt`. Abierto a todos los buscadores y apuntando al sitemap, que
 * es lo que hace que lo encuentren sin tener que darlo de alta a mano.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
