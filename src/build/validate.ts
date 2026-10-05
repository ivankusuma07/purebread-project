import { band, CRITERIA, veracity } from '../scoring/veracity';
import type { Edition, SourceRegistry } from '../types';

const PAIRING_TYPES = ['none', 'tokenized-equity', 'inventory-index', 'collectible', 'synthetic'];
const VERIFIABILITY = ['on-chain', 'public-inventory', 'attestation', 'none'];
const STATUSES = ['active', 'prelaunch', 'paused', 'struck'];
const METRICS = ['cumulativeVolumeUsd', 'dailyVolumeUsd', 'fees24hUsd', 'tvlUsd'] as const;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const EDITION_ID = /^\d{4}-\d{2}$/;

function fail(venue: string, reason: string): never {
  throw new Error(`invalid venue ${venue}: ${reason}`);
}

/**
 * Hard integrity checks. Any failure stops the monthly run before anything is
 * written: bad ranges, empty rationale, unknown sources, scores that don't
 * recompute, or a band that doesn't match its score.
 */
export function validateEdition(edition: Edition, sources: SourceRegistry): void {
  if (!EDITION_ID.test(edition.edition ?? '')) throw new Error('edition id must be YYYY-MM');
  if (!DATE.test(edition.published ?? '') || !DATE.test(edition.dataAsOf ?? '')) {
    throw new Error('published and dataAsOf must be YYYY-MM-DD');
  }
  if (!/^sha256:[0-9a-f]{64}$/.test(edition.snapshotHash ?? '')) throw new Error('snapshotHash must be sha256:<64 hex>');
  if (!Array.isArray(edition.venues) || edition.venues.length === 0) throw new Error('edition has no venues');

  const ids = new Set<string>();
  for (const v of edition.venues) {
    if (ids.has(v.id)) fail(v.id, 'duplicate id');
    ids.add(v.id);
    if (!PAIRING_TYPES.includes(v.pairing?.assetType)) fail(v.id, `pairing.assetType must be one of ${PAIRING_TYPES.join('|')}`);
    if (!VERIFIABILITY.includes(v.pairing?.verifiability)) fail(v.id, `pairing.verifiability must be one of ${VERIFIABILITY.join('|')}`);
    if (typeof v.pairing?.redeemable !== 'boolean') fail(v.id, 'pairing.redeemable must be a boolean');
    if (!STATUSES.includes(v.status)) fail(v.id, `status must be one of ${STATUSES.join('|')}`);
    if (!EDITION_ID.test(v.admittedEdition ?? '')) fail(v.id, 'admittedEdition must be YYYY-MM');
    if (!Array.isArray(v.contracts)) fail(v.id, 'contracts must be an array');
    for (const c of v.contracts) {
      if (typeof c.label !== 'string' || typeof c.address !== 'string' || typeof c.verified !== 'boolean') {
        fail(v.id, 'each contract needs {label, address, verified}');
      }
    }
    if (!Array.isArray(v.facts) || v.facts.some((f) => !Array.isArray(f) || f.length !== 2)) {
      fail(v.id, 'facts must be [figure, note] pairs');
    }
    for (const c of CRITERIA) {
      const s = v.scores?.[c];
      if (!Number.isInteger(s) || s < 0 || s > 10) fail(v.id, `score ${c} must be an integer 0..10`);
      const r = v.rationale?.[c];
      if (typeof r !== 'string' || r.trim().length === 0) fail(v.id, `rationale ${c} must be non-empty`);
    }
    if (typeof v.thesis !== 'string' || v.thesis.trim().length === 0) fail(v.id, 'thesis must be non-empty');
    if (!v.metrics || !Array.isArray(v.metrics.sourceIds)) fail(v.id, 'metrics with sourceIds required');
    for (const id of v.metrics.sourceIds) {
      if (!Object.hasOwn(sources, id)) fail(v.id, `unknown sourceId ${id}`);
    }
    for (const key of METRICS) {
      const n = v.metrics[key];
      if (n !== null && (typeof n !== 'number' || !Number.isFinite(n) || n < 0)) {
        fail(v.id, `metric ${key} must be null or a finite number >= 0`);
      }
    }
    if (v.status === 'prelaunch' && v.rank !== 0) fail(v.id, 'puppies (prelaunch) are unranked, rank 0');
    if (v.status !== 'prelaunch' && (!Number.isInteger(v.rank) || v.rank < 1)) fail(v.id, 'ranked venues need rank >= 1');
    if (veracity(v.scores) !== v.veracity) fail(v.id, 'veracity does not recompute from scores');
    if (band(v.veracity) !== v.band) fail(v.id, 'band does not match veracity');
    if (v.struckDate != null && !DATE.test(v.struckDate)) fail(v.id, 'struckDate must be null or YYYY-MM-DD');
    if ((v.status === 'struck') === (v.struckDate == null)) fail(v.id, 'struck status and struckDate must agree');
    if (v.delta !== undefined) {
      const d = v.delta;
      if (
        typeof d.veracity !== 'number' ||
        typeof d.rank !== 'number' ||
        typeof d.bandChanged !== 'boolean' ||
        typeof d.crossedHallmark !== 'boolean' ||
        typeof d.basis !== 'string' ||
        d.basis.length === 0
      ) {
        fail(v.id, 'delta must be {veracity, rank, bandChanged, crossedHallmark, basis}');
      }
    }
  }

  if (!Array.isArray(edition.corrections)) throw new Error('edition corrections must be an array');
  for (const c of edition.corrections) {
    if (
      !DATE.test(c.date ?? '') ||
      typeof c.note !== 'string' ||
      c.note.trim().length === 0 ||
      typeof c.originalFigure !== 'string' ||
      c.originalFigure.trim().length === 0
    ) {
      throw new Error('each correction needs {date YYYY-MM-DD, note, originalFigure}');
    }
    const signers = (c.signedBy ?? []).filter((s) => typeof s === 'string' && s.trim().length > 0);
    if (signers.length < 2) throw new Error('each correction needs at least two reviewer sign-offs');
  }
}
