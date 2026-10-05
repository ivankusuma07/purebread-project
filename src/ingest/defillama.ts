import { cleanMetric, fetchJson } from './http';

export interface DefillamaStats {
  fees24hUsd: number | null;
  tvlUsd: number | null;
}

interface FeesSummary {
  total24h?: number;
}

interface Protocol {
  tvl?: { totalLiquidityUSD?: number }[];
}

/** Fees (last 24h) and TVL for one DefiLlama protocol slug. Nulls when unpublished. */
export async function fetchDefillamaStats(slug: string): Promise<DefillamaStats> {
  const s = encodeURIComponent(slug);
  const [fees, protocol] = await Promise.all([
    fetchJson(`https://api.llama.fi/summary/fees/${s}?dataType=dailyFees`),
    fetchJson(`https://api.llama.fi/protocol/${s}`),
  ]);
  const series = (protocol as Protocol | null)?.tvl;
  const lastTvl = Array.isArray(series) && series.length > 0 ? series[series.length - 1]?.totalLiquidityUSD : null;
  return {
    fees24hUsd: cleanMetric((fees as FeesSummary | null)?.total24h),
    tvlUsd: cleanMetric(lastTvl),
  };
}
