import type { MetadataRoute } from 'next';
import { SITE } from '../src/site/config';

/** Everything is public except the internal desk. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/desk'] }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
