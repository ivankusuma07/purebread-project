import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchDefillamaStats } from './defillama';

const ts = (d: string) => Date.parse(`${d}T00:00:00Z`) / 1000;

/** A fake DefiLlama: per-slug fee and volume series broken down by chain. */
function mockLlama(data: Record<string, { fees: [string, Record<string, number>][]; vol?: [string, Record<string, number>][]; tvl?: Record<string, number> }>) {
  vi.stubGlobal('fetch', async (url: string) => {
    const slug = decodeURIComponent(url.split('/').pop()!.split('?')[0]);
    const d = data[slug];
    const breakdown = (rows: [string, Record<string, number>][] = []) =>
      rows.map(([day, byChain]) => [ts(day), Object.fromEntries(Object.entries(byChain).map(([c, v]) => [c, { [slug]: v }]))]);
    const chart = (rows: [string, Record<string, number>][] = []) =>
      rows.map(([day, byChain]) => [ts(day), Object.values(byChain).reduce((a, b) => a + b, 0)]);
    let body: unknown = null;
    if (!d) return new Response('not found', { status: 404 });
    if (url.includes('/summary/fees/')) body = { totalDataChart: chart(d.fees), totalDataChartBreakdown: breakdown(d.fees) };
    else if (url.includes('/summary/dexs/')) body = d.vol ? { totalDataChart: chart(d.vol), totalDataChartBreakdown: breakdown(d.vol) } : null;
    else if (url.includes('/protocol/')) body = { currentChainTvls: d.tvl ?? {}, tvl: [{ date: 0, totalLiquidityUSD: Object.values(d.tvl ?? {}).reduce((a, b) => a + b, 0) }] };
    return body ? new Response(JSON.stringify(body)) : new Response('none', { status: 400 });
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('DefiLlama provider', () => {
  it('counts only the chosen chain and skips the partial day at the cut', async () => {
    mockLlama({
      flap: {
        fees: [
          ['2026-10-03', { BSC: 1000, 'Robinhood Chain': 20 }],
          ['2026-10-04', { BSC: 1100, 'Robinhood Chain': 30 }],
          ['2026-10-05', { BSC: 50, 'Robinhood Chain': 1 }],
        ],
        vol: [
          ['2026-10-03', { BSC: 9000, 'Robinhood Chain': 100 }],
          ['2026-10-04', { BSC: 9900, 'Robinhood Chain': 200 }],
          ['2026-10-05', { BSC: 10, 'Robinhood Chain': 5 }],
        ],
        tvl: { BSC: 5000, 'Robinhood Chain': 700 },
      },
    });
    const s = await fetchDefillamaStats(['flap'], '2026-10-05', 'Robinhood Chain');
    expect(s).toEqual({ fees24hUsd: 30, dailyVolumeUsd: 200, cumulativeVolumeUsd: 300, tvlUsd: 700 });
  });

  it('sums several slugs, and treats a zero TVL as untracked', async () => {
    mockLlama({
      v1: { fees: [['2026-10-04', { 'Robinhood Chain': 10 }]], tvl: { 'Robinhood Chain': 0 } },
      v2: { fees: [['2026-10-04', { 'Robinhood Chain': 90 }]], vol: [['2026-10-04', { 'Robinhood Chain': 1000 }]], tvl: { 'Robinhood Chain': 0 } },
    });
    const s = await fetchDefillamaStats(['v1', 'v2'], '2026-10-05', 'Robinhood Chain');
    expect(s).toEqual({ fees24hUsd: 100, dailyVolumeUsd: 1000, cumulativeVolumeUsd: 1000, tvlUsd: null });
  });

  it('returns nulls, never zeros, when nothing is published', async () => {
    mockLlama({});
    expect(await fetchDefillamaStats(['missing'], '2026-10-05')).toEqual({
      fees24hUsd: null,
      tvlUsd: null,
      dailyVolumeUsd: null,
      cumulativeVolumeUsd: null,
    });
  });
});
