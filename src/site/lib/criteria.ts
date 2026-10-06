import type { Criterion } from '../../scoring/veracity';

/** `measures` is the two-word gist shown under the column heads of the matrix. */
export const CRITERION_INFO: Record<Criterion, { label: string; short: string; measures: string; question: string }> = {
  asset: {
    label: 'Asset',
    short: 'Asset',
    measures: 'Real backing',
    question: 'What backs the pair, and can you check it?',
  },
  traction: {
    label: 'Traction',
    short: 'Traction',
    measures: 'Volume, fees',
    question: 'Volume, market share, fees and pool depth.',
  },
  transparency: {
    label: 'Transparency',
    short: 'Transp.',
    measures: 'Code, team',
    question: 'Verified contracts, locks, docs and a named operator.',
  },
  compliance: {
    label: 'Compliance',
    short: 'Compl.',
    measures: 'Licences',
    question: 'Licences, a prospectus, honest disclosure.',
  },
  durability: {
    label: 'Durability',
    short: 'Durab.',
    measures: 'Track record',
    question: 'Age, shocks survived, and what it depends on.',
  },
};
