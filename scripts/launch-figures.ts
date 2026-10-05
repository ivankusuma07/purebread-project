// Daily volume and pool liquidity for a launchpad that no data provider tracks,
// built from its own on-chain launch records. Reads the asset list written by
// the launch scan, asks DexScreener for every pool those tokens trade in on
// Robinhood Chain, and sums 24h volume and USD liquidity once per pool.
//
//   pnpm tsx scripts/launch-figures.ts <scan.json>
//
// Used for Long.xyz in Edition 01: DefiLlama does not track it. The result is
// recorded in the snapshot with the "dexscreener" source.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

interface Pair {
  chainId: string;
  pairAddress: string;
  dexId: string;
  baseToken: { address: string; symbol: string };
  quoteToken: { address: string; symbol: string };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
}

async function main(): Promise<void> {
  const scanPath = process.argv[2];
  if (!scanPath) throw new Error('usage: tsx scripts/launch-figures.ts <scan.json>');
  const scan = JSON.parse(readFileSync(scanPath, 'utf8')) as { longAssets: string[] };
  const assets = [...new Set(scan.longAssets.map((a) => a.toLowerCase()))];
  const mine = new Set(assets);

  // Pools found so far are checkpointed next to the scan, so a rerun after a
  // dropped connection picks up where it stopped.
  const checkpoint = `${scanPath}.figures-progress.json`;
  const saved = existsSync(checkpoint) ? (JSON.parse(readFileSync(checkpoint, 'utf8')) as { next: number; pools: [string, Pair][] }) : null;
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const pools = new Map<string, Pair>(saved?.pools ?? []);
  let calls = 0;
  for (let i = saved?.next ?? 0; i < assets.length; i += 30) {
    const batch = assets.slice(i, i + 30);
    let pairs: Pair[] = [];
    for (let attempt = 0; ; attempt++) {
      try {
        const res = await fetch(`https://api.dexscreener.com/tokens/v1/robinhood/${batch.join(',')}`, {
          signal: AbortSignal.timeout(20_000),
        });
        if (res.ok) {
          pairs = (await res.json()) as Pair[];
          break;
        }
      } catch {
        // Network blip or timeout: wait and try again.
      }
      if (attempt >= 7) throw new Error(`DexScreener unreachable at batch ${i / 30}`);
      await sleep(3000 * (attempt + 1));
    }
    calls++;
    for (const p of pairs) {
      if (p.chainId !== 'robinhood') continue;
      // Count a pool once, and only when one side is a token this launchpad created.
      if (!mine.has(p.baseToken.address.toLowerCase()) && !mine.has(p.quoteToken.address.toLowerCase())) continue;
      pools.set(p.pairAddress.toLowerCase(), p);
    }
    await sleep(220);
    if (calls % 100 === 0) {
      writeFileSync(checkpoint, JSON.stringify({ next: i + 30, pools: [...pools] }));
      console.error(`${calls} calls, ${pools.size} pools`);
    }
  }

  let volume = 0;
  let liquidity = 0;
  const quotes: Record<string, number> = {};
  for (const p of pools.values()) {
    volume += p.volume?.h24 ?? 0;
    liquidity += p.liquidity?.usd ?? 0;
    const q = mine.has(p.baseToken.address.toLowerCase()) ? p.quoteToken.symbol : p.baseToken.symbol;
    quotes[q] = (quotes[q] ?? 0) + (p.volume?.h24 ?? 0);
  }
  const top = [...pools.values()].sort((a, b) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0)).slice(0, 8);
  console.log(
    JSON.stringify(
      {
        at: new Date().toISOString(),
        tokens: assets.length,
        poolsFound: pools.size,
        dailyVolumeUsd: Math.round(volume),
        liquidityUsd: Math.round(liquidity),
        volumeByQuote: Object.fromEntries(Object.entries(quotes).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => [k, Math.round(v)])),
        top: top.map((p) => `${p.baseToken.symbol}/${p.quoteToken.symbol} ${Math.round(p.volume?.h24 ?? 0)}`),
      },
      null,
      1,
    ),
  );
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
