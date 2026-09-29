import type { MetadataRoute } from 'next';
import { posts } from '@/content/blog';
import { routing } from '@/i18n/routing';
import { SITE_PATHS } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';

/**
 * Sitemap en `/sitemap.xml`.
 *
 * Cada página aparece una vez por idioma, y cada entrada declara sus
 * alternativas: así Google entiende que /es/servicios y /en/servicios son la
 * misma página traducida y no dos páginas compitiendo entre ellas.
 *
 * El proxy de idiomas no toca esta ruta porque su filtro deja fuera todo lo
 * que lleva punto en el nombre.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    ...SITE_PATHS.map((path) => ({
      path,
      lastModified: undefined,
      priority: path === '' ? 1 : 0.7,
    })),
    ...posts.map((post) => ({
      path: `/blog/${post.slug}`,
      lastModified: new Date(post.date),
      priority: 0.6,
    })),
  ];

  return pages.flatMap(({ path, lastModified, priority }) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
      priority,
      changeFrequency: (path === '' || path === '/blog'
        ? 'weekly'
        : 'monthly') as MetadataRoute.Sitemap[number]['changeFrequency'],
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((code) => [code, `${SITE_URL}/${code}${path}`]),
        ),
      },
    })),
  );
}
