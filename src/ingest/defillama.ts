import { cleanMetric, fetchJson } from './http';

export interface DefillamaStats {
  fees24hUsd: number | null;
  tvlUsd: number | null;
  dailyVolumeUsd: number | null;
  cumulativeVolumeUsd: number | null;
}

const NONE: DefillamaStats = { fees24hUsd: null, tvlUsd: null, dailyVolumeUsd: null, cumulativeVolumeUsd: null };

/** [unix seconds, value] or, with a chain breakdown, [unix seconds, { chain: { protocol: value } }]. */
type Point = [number, number | Record<string, Record<string, number>>];

interface Summary {
  totalDataChart?: [number, number][];
  totalDataChartBreakdown?: Point[];
}

interface Protocol {
  tvl?: { date: number; totalLiquidityUSD?: number }[];
  currentChainTvls?: Record<string, number>;
}

const day = (unix: number) => new Date(unix * 1000).toISOString().slice(0, 10);

/** The value of one day's point, for one chain when given, else the total. */
function valueOf(point: Point, chain?: string): number | null {
  const [, v] = point;
  if (typeof v === 'number') return chain ? null : v;
  if (!v || typeof v !== 'object') return null;
  const chains = chain ? (v[chain] ? { [chain]: v[chain] } : {}) : v;
  let sum = 0;
  let seen = false;
  for (const byProtocol of Object.values(chains)) {
    for (const n of Object.values(byProtocol ?? {})) {
      if (typeof n === 'number') {
        sum += n;
        seen = true;
      }
    }
  }
  return seen ? sum : null;
}

/** Points from a summary, by chain when asked. Only complete days before the cut count. */
function series(summary: Summary | null, chain: string | undefined, asOf: string): Point[] {
  const points: Point[] = chain ? (summary?.totalDataChartBreakdown ?? []) : (summary?.totalDataChart ?? []);
  return points.filter((p) => day(p[0]) < asOf);
}

/** Latest complete day and the running total, for one slug. */
function dailyAndTotal(summary: Summary | null, chain: string | undefined, asOf: string) {
  const pts = series(summary, chain, asOf);
  if (pts.length === 0) return { daily: null, total: null };
  const values = pts.map((p) => valueOf(p, chain));
  const total = values.reduce<number | null>((a, v) => (v == null ? a : (a ?? 0) + v), null);
  return { daily: values[values.length - 1] ?? null, total };
}

const add = (a: number | null, b: number | null) => (a == null ? b : b == null ? a : a + b);

/**
 * Fees, TVL and volume from DefiLlama for one venue, summed over its slugs and
 * limited to one chain when the venue is multichain. Daily figures are the last
 * complete day before the data cut, never a partial day. Null when unpublished.
 */
export async function fetchDefillamaStats(slugs: string | string[], asOf: string, chain?: string): Promise<DefillamaStats> {
  const list = Array.isArray(slugs) ? slugs : [slugs];
  if (list.length === 0) return NONE;
  let fees: number | null = null;
  let tvl: number | null = null;
  let daily: number | null = null;
  let cumulative: number | null = null;
  for (const slug of list) {
    const s = encodeURIComponent(slug);
    const [feesRaw, volRaw, protoRaw] = await Promise.all([
      fetchJson(`https://api.llama.fi/summary/fees/${s}?dataType=dailyFees`),
      fetchJson(`https://api.llama.fi/summary/dexs/${s}?dataType=dailyVolume`),
      fetchJson(`https://api.llama.fi/protocol/${s}`),
    ]);
    fees = add(fees, dailyAndTotal(feesRaw as Summary | null, chain, asOf).daily);
    const vol = dailyAndTotal(volRaw as Summary | null, chain, asOf);
    daily = add(daily, vol.daily);
    cumulative = add(cumulative, vol.total);
    const proto = protoRaw as Protocol | null;
    const lastTvl = chain ? proto?.currentChainTvls?.[chain] : proto?.tvl?.[proto.tvl.length - 1]?.totalLiquidityUSD;
    // A TVL of exactly zero on a launchpad means DefiLlama does not track it, not that it is empty.
    tvl = add(tvl, typeof lastTvl === 'number' && lastTvl > 0 ? lastTvl : null);
  }
  return {
    fees24hUsd: cleanMetric(fees),
    tvlUsd: cleanMetric(tvl),
    dailyVolumeUsd: cleanMetric(daily),
    cumulativeVolumeUsd: cleanMetric(cumulative),
  };
}
