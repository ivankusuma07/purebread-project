import type { Delta, Edition, SourceRegistry } from '../types';
import Book, { type ContentsItem } from './components/Book';
import {
  CorrectionsChapter,
  CustodyChapter,
  DataChapter,
  MatrixChapter,
  NextChapter,
  SourcesChapter,
  StruckChapter,
} from './components/chapters/Ledgers';
import { BandsChapter, FaqChapter, LimitsChapter, MadeChapter, SniffChapter, UsesChapter } from './components/chapters/Story';
import EditionHead from './components/EditionHead';
import Register from './components/Register';
import type { RawWeights } from './weight-url';

/** Chapter order, as the plan's register book. The contents rail is built from this. */
const CHAPTERS: { id: string; label: string }[] = [
  { id: 'register', label: 'Register' },
  { id: 'bands', label: 'Bands' },
  { id: 'sniff-test', label: 'Sniff test' },
  { id: 'how-it-is-made', label: 'How an edition is made' },
  { id: 'uses', label: 'What you can do with it' },
  { id: 'criteria', label: 'Criteria' },
  { id: 'custody', label: 'Custody' },
  { id: 'struck-off', label: 'Struck off' },
  { id: 'limits', label: 'Limits' },
  { id: 'faq', label: 'Questions' },
  { id: 'data', label: 'Data' },
  { id: 'next', label: 'Next edition' },
  { id: 'corrections', label: 'Corrections' },
  { id: 'sources', label: 'Sources' },
  { id: 'archive', label: 'Archive' },
];

const n = (id: string) => String(CHAPTERS.findIndex((c) => c.id === id) + 1);

interface EditionViewProps {
  edition: Edition;
  sources: SourceRegistry;
  deltas: Record<string, Delta>;
  initialRaw: RawWeights;
  isLatest: boolean;
}

/** A whole edition, server-rendered so every venue, score and band reads without JavaScript. */
export default function EditionView({ edition, sources, deltas, initialRaw, isLatest }: EditionViewProps) {
  const contents: ContentsItem[] = CHAPTERS.map((c) => ({ href: `#${c.id}`, label: c.label }));
  return (
    <Book contents={contents} edition={edition.edition}>
      <EditionHead edition={edition} isLatest={isLatest} />
      <Register venues={edition.venues} deltas={deltas} initialRaw={initialRaw} />
      <BandsChapter n={n('bands')} />
      <SniffChapter n={n('sniff-test')} />
      <MadeChapter n={n('how-it-is-made')} />
      <UsesChapter n={n('uses')} />
      <MatrixChapter n={n('criteria')} edition={edition} />
      <CustodyChapter n={n('custody')} edition={edition} />
      <StruckChapter n={n('struck-off')} edition={edition} />
      <LimitsChapter n={n('limits')} />
      <FaqChapter n={n('faq')} />
      <DataChapter n={n('data')} edition={edition} />
      <NextChapter n={n('next')} edition={edition} />
      <CorrectionsChapter n={n('corrections')} edition={edition} />
      <SourcesChapter n={n('sources')} edition={edition} sources={sources} />
    </Book>
  );
}
