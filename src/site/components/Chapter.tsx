import type { ReactNode } from 'react';

interface ChapterProps {
  id: string;
  /** Chapter number in the contents, shown like a ledger tab. */
  number?: string;
  title: string;
  lede?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** One chapter of the register book: a plain heading, then text and tables. */
export default function Chapter({ id, number, title, lede, children, className = '' }: ChapterProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`chapter ${className}`}>
      <header className="mb-6">
        <h2 id={`${id}-title`} className="chapter-title flex items-baseline gap-3">
          {number && <span className="num font-gothic text-base font-normal text-ink-3">{number}</span>}
          <span>{title}</span>
        </h2>
        {lede && <div className="measure mt-3 text-ink-2">{lede}</div>}
      </header>
      {children}
    </section>
  );
}
