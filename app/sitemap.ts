import type { MetadataRoute } from 'next';
import { SITE } from '../src/site/config';
import { allVenueIds, EDITIONS, LATEST_EDITION } from '../src/site/editions';

/** Every public page, built from the editions on disk. The desk is left out. */
export default function sitemap(): MetadataRoute.Sitemap {
  const latest = new Date(`${LATEST_EDITION.published}T00:00:00Z`);
  const page = (path: string, priority: number, lastModified = latest): MetadataRoute.Sitemap[number] => ({
    url: `${SITE.url}${path}`,
    lastModified,
    changeFrequency: 'monthly',
    priority,
  });
  return [
    page('/', 1),
    page('/venues', 0.8),
    page('/method', 0.6),
    page('/fee-router', 0.5),
    ...EDITIONS.map((e) => page(`/editions/${e.edition}`, 0.7, new Date(`${e.published}T00:00:00Z`))),
    ...allVenueIds().map((id) => page(`/venues/${id}`, 0.6)),
  ];
}
