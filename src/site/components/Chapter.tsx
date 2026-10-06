import type { ReactNode } from 'react';
import AnimatedContent from '../reactbits/AnimatedContent';

interface ChapterProps {
  id: string;
  number?: string;
  /** Short label in the tag above the heading. */
  kicker?: string;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Full-bleed art behind the whole chapter, faded at the top and bottom edges. */
  backdrop?: ReactNode;
}

/** A chapter: numbered tag, big heading, lede, then the content easing in on scroll. */
export default function Chapter({ id, number, kicker, title, lede, children, className = '', backdrop }: ChapterProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`chapter ${backdrop ? 'relative isolate' : ''} ${className}`}>
      {backdrop && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_70%,transparent)]"
        >
          {backdrop}
        </div>
      )}
      <AnimatedContent distance={40}>
        <header className="mb-10 max-w-3xl">
          {(number || kicker) && (
            <p className="chapter-tag mb-4">
              {number && <span>{number.padStart(2, '0')}</span>}
              {number && kicker && <span aria-hidden className="text-gold/50">/</span>}
              {kicker && <span>{kicker}</span>}
            </p>
          )}
          <h2 id={`${id}-title`} className="chapter-title">
            {title}
          </h2>
          {lede && <div className="measure mt-4 text-lg text-ink-2">{lede}</div>}
        </header>
      </AnimatedContent>
      <AnimatedContent distance={60} delay={0.1}>
        {children}
      </AnimatedContent>
    </section>
  );
}
