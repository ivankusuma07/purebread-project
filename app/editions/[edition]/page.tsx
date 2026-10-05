import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { deltasFor, findEdition, KNOWN_EDITION_IDS, LATEST_EDITION, SOURCES } from '../../../src/site/editions';
import EditionView from '../../../src/site/EditionView';
import { parseRawSliders } from '../../../src/site/weight-url';

type Params = Promise<{ edition: string }>;
type SearchParams = Record<string, string | string[] | undefined>;

export function generateStaticParams() {
  return KNOWN_EDITION_IDS.map((edition) => ({ edition }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { edition } = await params;
  return {
    title: `Edition ${edition}`,
    description: `The frozen record of the Veracity register for edition ${edition}. Scores are editorial judgements on public information.`,
  };
}

/** A permanent edition page. Unknown editions are a 404. */
export default async function EditionPage({ params, searchParams }: { params: Params; searchParams: Promise<SearchParams> }) {
  const { edition: id } = await params;
  const edition = findEdition(id);
  if (!edition) notFound();
  const { w } = await searchParams;
  const token = Array.isArray(w) ? w[0] : w;
  return (
    <EditionView
      edition={edition}
      sources={SOURCES}
      deltas={deltasFor(edition)}
      initialRaw={parseRawSliders(token ? `?w=${token}` : '')}
      isLatest={edition.edition === LATEST_EDITION.edition}
    />
  );
}
