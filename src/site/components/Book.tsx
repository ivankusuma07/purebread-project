import { BookOpen, ChevronDown, Menu } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { LATEST_EDITION } from '../editions';
import { SOCIAL_LINKS } from './BrandIcons';
import Footer from './Footer';
import HankoMargin from './HankoMargin';
import Wordmark from './Wordmark';

export interface ContentsItem {
  href: string;
  label: string;
}

/** The register's own pages, in the top bar on every page. */
export const SITE_PAGES: ContentsItem[] = [
  { href: '/#register', label: 'Register' },
  { href: '/venues', label: 'Venues' },
  { href: '/method', label: 'Method' },
  { href: '/fee-router', label: 'Fee router' },
];

function OnThisPage({ items }: { items: ContentsItem[] }) {
  if (items.length === 0) return null;
  return (
    <details className="group relative hidden lg:block">
      <summary className="btn list-none [&::-webkit-details-marker]:hidden">
        <BookOpen size={15} aria-hidden /> On this page
        <ChevronDown size={14} aria-hidden className="transition-transform group-open:rotate-180" />
      </summary>
      <nav aria-label="On this page" className="panel absolute right-0 top-full mt-3 max-h-[70dvh] w-64 overflow-y-auto p-3 shadow-2xl shadow-black/60">
        <ol className="space-y-0.5 text-sm">
          {items.map((item, i) => (
            <li key={item.href}>
              <a href={item.href} className="flex items-baseline gap-3 rounded-lg px-3 py-1.5 text-ink-2 no-underline hover:bg-white/5 hover:text-ink">
                <span className="mono w-5 text-xs text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}

interface BookProps {
  contents: ContentsItem[];
  children: ReactNode;
  edition?: string;
  hanko?: boolean;
}

/**
 * Every page sits in this shell: a sticky glass top bar, the page, the footer
 * with the archive. The section list for the current page lives under
 * "On this page"; on phones everything folds into one menu that works without
 * JavaScript.
 */
export default function Book({ contents, children, edition, hanko = true }: BookProps) {
  return (
    // overflow-x-clip keeps full-bleed backgrounds from scrolling sideways without breaking the sticky header.
    <div className="relative overflow-x-clip">
      <div aria-hidden className="vault-grid pointer-events-none absolute inset-x-0 top-0 h-[1400px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-paper/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6">
          <Wordmark />
          <nav aria-label="Register pages" className="hidden items-center gap-1 md:flex">
            {SITE_PAGES.map((p) => (
              <Link key={p.href} href={p.href} className="rounded-full px-3.5 py-1.5 text-sm text-ink-2 no-underline transition-colors hover:bg-white/5 hover:text-ink">
                {p.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ul className="hidden items-center gap-1 sm:flex">
              {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a href={href} aria-label={label} className="grid size-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-white/5 hover:text-ink">
                    <Icon size={17} />
                  </a>
                </li>
              ))}
            </ul>
            <OnThisPage items={contents} />
            <Link href={`/editions/${LATEST_EDITION.edition}.json`} className="btn btn-gold hidden no-underline sm:inline-flex">
              Edition {LATEST_EDITION.edition}
            </Link>
            <details className="group relative md:hidden">
              <summary className="btn list-none px-3 [&::-webkit-details-marker]:hidden" aria-label="Menu">
                <Menu size={18} aria-hidden />
              </summary>
              <nav aria-label="Menu" className="panel absolute right-0 top-full mt-3 max-h-[75dvh] w-72 overflow-y-auto p-3 shadow-2xl shadow-black/60">
                <ul className="space-y-0.5">
                  {SITE_PAGES.map((p) => (
                    <li key={p.href}>
                      <Link href={p.href} className="block rounded-lg px-3 py-2 text-ink no-underline hover:bg-white/5">
                        {p.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                {contents.length > 0 && (
                  <>
                    <p className="mono mt-3 border-t border-white/10 px-3 pt-3 text-xs uppercase tracking-widest text-ink-3">On this page</p>
                    <ol className="mt-1 space-y-0.5 text-sm">
                      {contents.map((item) => (
                        <li key={item.href}>
                          <a href={item.href} className="block rounded-lg px-3 py-1.5 text-ink-2 no-underline hover:bg-white/5">
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </>
                )}
                <ul className="mt-3 flex gap-1 border-t border-white/10 px-1 pt-3">
                  {SOCIAL_LINKS.map(({ href, name, Icon }) => (
                    <li key={href}>
                      <a href={href} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-2 no-underline hover:bg-white/5 hover:text-ink">
                        <Icon size={15} /> {name}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6">
        <main id="main">{children}</main>
        <Footer current={edition} />
      </div>
      {hanko && <HankoMargin />}
    </div>
  );
}
