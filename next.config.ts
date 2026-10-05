import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Editions are read from disk at request time (the home page reads ?w=), so
  // the data folder must ship with every server function.
  outputFileTracingIncludes: { '/**': ['./data/**/*'] },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
  async rewrites() {
    // App Router segments can't contain a dot, so /editions/2026-10.json
    // is served by the edition.json route handler.
    return [{ source: '/editions/:edition.json', destination: '/editions/:edition/edition.json' }];
  },
};

export default nextConfig;
