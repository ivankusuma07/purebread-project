import type { Band, Criterion, Scores, Weights } from './scoring/veracity';

export interface SourceEntry {
  name: string;
  url: string;
  type: 'metrics' | 'contracts' | 'docs' | 'research';
}

export type SourceRegistry = Record<string, SourceEntry>;

export interface ContractRef {
  label: string;
  address: string;
  verified: boolean;
}

export type PairingAssetType = 'none' | 'tokenized-equity' | 'inventory-index' | 'collectible' | 'synthetic';

export type Verifiability = 'on-chain' | 'public-inventory' | 'attestation' | 'none';

/** What sits on the other side of the pool, and how you can check it. */
export interface Pairing {
  assetType: PairingAssetType;
  custodian: string | null;
  /** Where the custodian is regulated. Null when not published. */
  jurisdiction: string | null;
  redeemable: boolean;
  verifiability: Verifiability;
}

/** Null means "not published", never zero. */
export interface VenueMetrics {
  cumulativeVolumeUsd: number | null;
  dailyVolumeUsd: number | null;
  fees24hUsd: number | null;
  tvlUsd: number | null;
  asOf: string;
  sourceIds: string[];
}

export type Rationale = Record<Criterion, string>;

export type VenueStatus = 'active' | 'prelaunch' | 'paused' | 'struck';

/** Movement against the prior edition, at house weights only. */
export interface Delta {
  veracity: number;
  /** Prior rank minus current rank: positive means the venue climbed. */
  rank: number;
  bandChanged: boolean;
  crossedHallmark: boolean;
  basis: string;
}

export interface Venue {
  id: string;
  name: string;
  chain: string;
  /** False for venues off Robinhood Chain. They rank inline with a marker. */
  resident: boolean;
  status: VenueStatus;
  /** Date the venue was struck off, if ever. */
  struckDate: string | null;
  admittedEdition: string;
  thesis: string;
  scores: Scores;
  veracity: number;
  band: Band;
  /** 1-based. 0 for puppies (prelaunch): listed, not ranked. */
  rank: number;
  /** Absent for new admissions and puppies. */
  delta?: Delta;
  rationale: Rationale;
  pairing: Pairing;
  metrics: VenueMetrics;
  contracts: ContractRef[];
  links: { site: string | null; docs: string | null };
  /** [figure, note] pairs shown on the venue papers. */
  facts: [string, string][];
}

export interface CorrectionNote {
  date: string;
  note: string;
  originalFigure: string;
  /** Two reviewer sign-offs. */
  signedBy: string[];
}

export interface EditionHeader {
  edition: string;
  published: string;
  dataAsOf: string;
  snapshotHash: string;
  houseWeights: Weights;
  disclosures: string[];
  /** Dated notes. Original figures stay in place, never edited. */
  corrections: CorrectionNote[];
}

export interface Edition extends EditionHeader {
  venues: Venue[];
}

export interface SnapshotVenue {
  id: string;
  cumulativeVolumeUsd: number | null;
  dailyVolumeUsd: number | null;
  fees24hUsd: number | null;
  tvlUsd: number | null;
  contracts: ContractRef[];
}

export interface Snapshot {
  snapshot: string;
  asOf: string;
  venues: SnapshotVenue[];
}
