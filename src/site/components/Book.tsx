import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Footer from './Footer';
import HankoMargin from './HankoMargin';
import Wordmark from './Wordmark';

export interface ContentsItem {
  href: string;
  label: string;
  /** Indented under the item above, like a sub-entry in a ledger index. */
  sub?: boolean;
}

/** The register's own pages, listed under the chapters on every page. */
export const SITE_PAGES: ContentsItem[] = [
  { href: '/venues', label: 'All venues' },
  { href: '/method', label: 'Method' },
  { href: '/fee-router', label: 'Fee router' },
];

function ContentsList({ items }: { items: ContentsItem[] }) {
  return (
    <ol className="space-y-1.5 text-[0.9375rem]">
      {items.map((item) => (
        <li key={item.href} className={item.sub ? 'pl-4' : ''}>
          <Link href={item.href} className="text-ink-2 no-underline hover:text-ink hover:underline">
            {item.label}
          </Link>
        </li>
      ))}
    </ol>
  );
}

interface BookProps {
  contents: ContentsItem[];
  children: ReactNode;
  /** Edition id for the footer archive highlight. */
  edition?: string;
  hanko?: boolean;
}

/**
 * The bound register: a sticky contents rail on the left (like the tabs on a
 * ledger), the pages on the right. On phones the rail folds into a
 * "Contents" sheet that works without JavaScript.
 */
export default function Book({ contents, children, edition, hanko = true }: BookProps) {
  return (
    <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10">
      {/* phone and tablet header */}
      <header className="sticky top-0 z-30 -mx-4 flex items-center justify-between border-b border-grid bg-paper px-4 py-3 min-[1200px]:hidden sm:-mx-6 sm:px-6">
        <Wordmark />
        <details className="group relative">
          <summary className="btn list-none [&::-webkit-details-marker]:hidden">
            <BookOpen size={16} aria-hidden />
            Contents
          </summary>
          <nav
            aria-label="Contents"
            className="absolute right-0 top-full mt-2 max-h-[70dvh] w-64 overflow-y-auto border border-ink bg-paper p-4"
          >
            <ContentsList items={contents} />
            <div className="mt-4 border-t border-grid pt-3">
              <ContentsList items={SITE_PAGES} />
            </div>
          </nav>
        </details>
      </header>

      <div className="min-[1200px]:grid min-[1200px]:grid-cols-[200px_1fr] min-[1200px]:gap-12">
        <aside className="hidden min-[1200px]:block">
          <div className="sticky top-0 flex max-h-dvh flex-col gap-8 overflow-y-auto py-10">
            <Wordmark />
            <nav aria-label="Contents">
              <p className="mb-3 flex items-center gap-2 text-sm text-ink-3">
                <BookOpen size={15} aria-hidden /> Contents
              </p>
              <ContentsList items={contents} />
            </nav>
            <nav aria-label="Register pages" className="border-t border-grid pt-4">
              <ContentsList items={SITE_PAGES} />
            </nav>
          </div>
        </aside>

        <div className="min-w-0 min-[1200px]:margin-rule min-[1200px]:pl-10">
          <main id="main">{children}</main>
          <Footer current={edition} />
        </div>
      </div>
      {hanko && <HankoMargin />}
    </div>
  );
}
