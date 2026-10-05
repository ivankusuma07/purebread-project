import Link from 'next/link';
import type { ReactNode } from 'react';
import AnimatedContent from '../reactbits/AnimatedContent';

interface PageHeadProps {
  /** Breadcrumb after "Register", e.g. [['venues', '/venues'], ['papers']]. */
  crumbs: [string, string?][];
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Shown on the right on wide screens: a score, a seal, a status. */
  aside?: ReactNode;
}

/** The top of every inner page: breadcrumb, tag, big title, a warm glow behind. */
export default function PageHead({ crumbs, kicker, title, lede, aside }: PageHeadProps) {
  return (
    <header className="relative isolate pb-12 pt-12 lg:pt-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[420px] w-screen -translate-x-1/2 bg-[radial-gradient(50%_60%_at_30%_0%,rgba(242,193,78,0.16),transparent_70%),radial-gradient(40%_50%_at_80%_10%,rgba(255,90,69,0.12),transparent_70%)]"
      />
      <AnimatedContent distance={30}>
        <nav aria-label="Breadcrumb" className="mono text-xs uppercase tracking-[0.14em] text-ink-3">
          <Link href="/" className="no-underline hover:text-ink">
            Register
          </Link>
          {crumbs.map(([label, href]) => (
            <span key={label}>
              <span className="mx-2 text-gold/50">/</span>
              {href ? (
                <Link href={href} className="no-underline hover:text-ink">
                  {label}
                </Link>
              ) : (
                <span className="text-ink-2">{label}</span>
              )}
            </span>
          ))}
        </nav>
        <div className="mt-6 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="chapter-tag mb-4">{kicker}</p>
            <h1 className="text-[clamp(2.4rem,1.6rem+3vw,4.2rem)] leading-[1.05]">{title}</h1>
            {lede && <div className="measure mt-4 text-lg text-ink-2">{lede}</div>}
          </div>
          {aside}
        </div>
      </AnimatedContent>
    </header>
  );
}
