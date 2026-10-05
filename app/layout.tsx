import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Zen_Kaku_Gothic_New, Zen_Old_Mincho } from 'next/font/google';
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

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const DESCRIPTION =
  'A monthly register that checks the papers on every tokenized-stock venue. Scored 0 to 1000 in karat bands. Editorial judgement on public information, not an audit or investment advice.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Veracity register', template: '%s · Veracity register' },
  description: DESCRIPTION,
  applicationName: 'Veracity register',
  openGraph: {
    type: 'website',
    siteName: 'Veracity register',
    title: 'Veracity: most venues launch memecoins. Hanko checks the papers.',
    description: DESCRIPTION,
    url: '/',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veracity: most venues launch memecoins. Hanko checks the papers.',
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: '#070a12',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The head script may add a class before hydration (the stamp moment). That mismatch is intended.
    <html lang="en" className={`${mincho.variable} ${gothic.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: STAMP_HEAD_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-paper">
          Skip to the register
        </a>
        {children}
      </body>
    </html>
  );
}
