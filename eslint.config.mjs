import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const config = [
  ...nextVitals,
  ...nextTs,
  // Vendored React Bits components, kept as published apart from an attribution line.
  // The adapted ones (ElasticSlider, CountUp, AnimatedContent, SpotlightCard) are linted.
  {
    ignores: ['.next/', 'next-env.d.ts', 'e2e/results/', 'e2e/report/', 'src/site/reactbits/Aurora.tsx', 'src/site/reactbits/DecryptedText.tsx', 'src/site/reactbits/HoldButton.tsx', 'src/site/reactbits/LogoLoop.tsx', 'src/site/reactbits/Magnet.tsx', 'src/site/reactbits/ShinyText.tsx', 'src/site/reactbits/SplitText.tsx', 'src/site/reactbits/StarBorder.tsx', 'src/site/reactbits/StatusMark.tsx'],
  },
];

export default config;
