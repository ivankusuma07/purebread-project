import type { Metadata } from 'next';
import { deltasFor, LATEST_EDITION, SOURCES } from '../src/site/editions';
import EditionView from '../src/site/EditionView';
import { parseRawSliders } from '../src/site/weight-url';

export const metadata: Metadata = {
  title: { absolute: `Veracity register · Edition ${LATEST_EDITION.edition}` },
};

type SearchParams = Record<string, string | string[] | undefined>;

/** The latest edition. `?w=` is parsed on the server so a shared ranking renders before first paint. */
export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { w } = await searchParams;
  const token = Array.isArray(w) ? w[0] : w;
  const initialRaw = parseRawSliders(token ? `?w=${token}` : '');
  return (
    <EditionView
      edition={LATEST_EDITION}
      sources={SOURCES}
      deltas={deltasFor(LATEST_EDITION)}
      initialRaw={initialRaw}
      isLatest
    />
  );
}
