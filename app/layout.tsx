import type { Metadata, Viewport } from 'next';
import { Zen_Kaku_Gothic_New, Zen_Old_Mincho } from 'next/font/google';
import { SITE } from '../src/site/config';
import { STAMP_HEAD_SCRIPT } from '../src/site/components/StampMoment';
import './globals.css';

const mincho = Zen_Old_Mincho({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-zen-mincho',
  display: 'swap',
});

const gothic = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-zen-gothic',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Veracity register', template: '%s · Veracity register' },
  description:
    'A monthly register that checks the papers on every tokenized-stock venue. Scored 0 to 1000 in karat bands. Editorial judgement on public information, not an audit or investment advice.',
};

export const viewport: Viewport = {
  themeColor: '#e9eee8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The head script may add a class before hydration (the stamp moment). That mismatch is intended.
    <html lang="en" className={`${mincho.variable} ${gothic.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: STAMP_HEAD_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2">
          Skip to the register
        </a>
        {children}
      </body>
    </html>
  );
}
