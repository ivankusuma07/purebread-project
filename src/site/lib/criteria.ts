import type { Criterion } from '../../scoring/veracity';

export const CRITERION_INFO: Record<Criterion, { label: string; short: string; question: string }> = {
  asset: {
    label: 'Asset',
    short: 'Asset',
    question: 'What backs the pair, and can you check it?',
  },
  traction: {
    label: 'Traction',
    short: 'Traction',
    question: 'Volume, market share, fees and pool depth.',
  },
  transparency: {
    label: 'Transparency',
    short: 'Transp.',
    question: 'Verified contracts, locks, docs and a named operator.',
  },
  compliance: {
    label: 'Compliance',
    short: 'Compl.',
    question: 'Licences, a prospectus, honest disclosure.',
  },
  durability: {
    label: 'Durability',
    short: 'Durab.',
    question: 'Age, shocks survived, and what it depends on.',
  },
};
