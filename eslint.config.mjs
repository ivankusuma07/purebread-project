import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const config = [
  ...nextVitals,
  ...nextTs,
  // Vendored React Bits components, kept as published apart from an attribution line.
  { ignores: ['.next/', 'next-env.d.ts', 'e2e/results/', 'e2e/report/', 'src/site/reactbits/HoldButton.tsx', 'src/site/reactbits/StatusMark.tsx'] },
];

export default config;
