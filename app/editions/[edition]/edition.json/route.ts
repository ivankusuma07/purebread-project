import { editionFile, KNOWN_EDITION_IDS } from '../../../../src/site/editions';

export function generateStaticParams() {
  return KNOWN_EDITION_IDS.map((edition) => ({ edition }));
}

export const dynamicParams = false;

/** The frozen edition file, byte for byte. Open CORS, no key. Served at /editions/:id.json by a rewrite. */
export async function GET(_request: Request, { params }: { params: Promise<{ edition: string }> }) {
  const { edition } = await params;
  if (!KNOWN_EDITION_IDS.includes(edition)) return new Response('Not found', { status: 404 });
  return new Response(editionFile(edition), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=300, s-maxage=86400',
    },
  });
}
