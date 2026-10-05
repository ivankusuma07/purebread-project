// Counts every launch a launchpad made on Robinhood Chain, straight from its
// factory's event logs, and what each launch is paired against. This is the
// evidence behind the stock-pairing shares quoted for Long.xyz and Pons.
//
//   pnpm tsx scripts/launch-scan.ts <scan.json>
//
// The RPC caps getLogs at 10M blocks and 10,000 logs, and viem caps a reply at
// 10 MB, so ranges split in half until they fit. Results are cached in the
// output file as they land: a rerun after a dropped connection resumes. The
// file's `longAssets` feeds scripts/launch-figures.ts.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createPublicClient, defineChain, http, parseAbi, parseAbiItem, type AbiEvent, type Address } from 'viem';

const RPC = 'https://rpc.mainnet.chain.robinhood.com';
const STOCK = /Robinhood Token$/;
const ETH = '0x0000000000000000000000000000000000000000';

const LONG_EVENT = parseAbiItem(
  'event LaunchCreated(address indexed poolOrHook, address indexed asset, address indexed numeraire, address poolInitializer, address launcher, bytes32 tickerKey, uint48 deployedAt, uint48 reservedUntil, string normalizedTicker)',
);
const PONS_EVENT = parseAbiItem(
  'event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)',
);

/** [launched token, what it pairs against, block]. */
type Row = [string, string, number];

interface Cache {
  longLegacy?: Row[];
  longNew?: Row[];
  ponsV2?: Row[];
  syms?: Record<string, string>;
  summary?: unknown;
  longAssets?: string[];
}

const chain = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
});
const client = createPublicClient({ chain, transport: http(RPC, { timeout: 90_000, retryCount: 4, retryDelay: 1500 }) });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function scanRange(address: Address, event: AbiEvent, from: bigint, to: bigint, keys: [string, string], sink: Row[]): Promise<void> {
  for (let attempt = 0; ; attempt++) {
    try {
      const logs = await client.getLogs({ address, event, fromBlock: from, toBlock: to });
      for (const l of logs) {
        const args = l.args as Record<string, unknown>;
        sink.push([String(args[keys[0]]), String(args[keys[1]]), Number(l.blockNumber)]);
      }
      return;
    } catch (err) {
      const e = err as { name?: string; shortMessage?: string; details?: string; message?: string };
      const msg = `${e.name} ${e.shortMessage} ${e.details} ${e.message}`;
      if (/exceeds limit|spans|size limit|TooLarge/i.test(msg) && to - from >= 2n) {
        const mid = (from + to) / 2n;
        await scanRange(address, event, from, mid, keys, sink);
        await scanRange(address, event, mid + 1n, to, keys, sink);
        return;
      }
      if (attempt >= 6) throw err;
      await sleep(3000 * (attempt + 1));
    }
  }
}

async function scanAll(address: Address, event: AbiEvent, start: bigint, latest: bigint, keys: [string, string]): Promise<Row[]> {
  const sink: Row[] = [];
  for (let from = start; from <= latest; from += 2_000_000n) {
    const to = from + 1_999_999n > latest ? latest : from + 1_999_999n;
    await scanRange(address, event, from, to, keys, sink);
  }
  return sink;
}

const minOf = (xs: number[]) => xs.reduce((a, b) => (b < a ? b : a), Infinity);
const maxOf = (xs: number[]) => xs.reduce((a, b) => (b > a ? b : a), -Infinity);

async function main(): Promise<void> {
  const out = process.argv[2];
  if (!out) throw new Error('usage: tsx scripts/launch-scan.ts <scan.json>');
  const cache: Cache = existsSync(out) ? (JSON.parse(readFileSync(out, 'utf8')) as Cache) : {};
  const save = () => writeFileSync(out, JSON.stringify(cache));
  const latest = await client.getBlockNumber();

  // Long.xyz's first launcher was paused on 10 Sep 2026; launches continue
  // through the upgradeable proxy deployed on 6 Sep (around block 56M).
  cache.longLegacy ??= await scanAll('0x22e99278308b393ea1260859b181ad7e78f5eeed', LONG_EVENT, 1n, latest, ['asset', 'numeraire']);
  save();
  cache.longNew ??= await scanAll('0x1Eef016F22A943abC7DD11422EDeE9D235942104', LONG_EVENT, 56_000_000n, latest, ['asset', 'numeraire']);
  save();
  cache.ponsV2 ??= await scanAll('0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e', PONS_EVENT, 1n, latest, ['token', 'pairToken']);
  save();

  const long = [...cache.longLegacy, ...cache.longNew];
  const erc20 = parseAbi(['function symbol() view returns (string)', 'function name() view returns (string)']);
  const syms = (cache.syms ??= {});
  for (const a of new Set([...long, ...cache.ponsV2].map((r) => r[1].toLowerCase()))) {
    if (syms[a]) continue;
    if (a === ETH) {
      syms[a] = 'ETH (native)';
      continue;
    }
    try {
      const address = a as Address;
      const [symbol, name] = await Promise.all([
        client.readContract({ address, abi: erc20, functionName: 'symbol' }),
        client.readContract({ address, abi: erc20, functionName: 'name' }),
      ]);
      syms[a] = `${symbol} | ${name}`;
    } catch {
      syms[a] = '?';
    }
  }
  save();

  const day = async (block: number) =>
    new Date(Number((await client.getBlock({ blockNumber: BigInt(block) })).timestamp) * 1000).toISOString().slice(0, 10);
  const describe = async (rows: Row[]) => {
    const byPair: Record<string, number> = {};
    for (const r of rows) {
      const s = syms[r[1].toLowerCase()] ?? '?';
      byPair[s] = (byPair[s] ?? 0) + 1;
    }
    const stock = Object.entries(byPair).filter(([s]) => STOCK.test(s));
    const stockLaunches = stock.reduce((n, [, c]) => n + c, 0);
    const blocks = rows.map((r) => r[2]);
    return {
      launches: rows.length,
      first: rows.length ? await day(minOf(blocks)) : null,
      last: rows.length ? await day(maxOf(blocks)) : null,
      stockPaired: stockLaunches,
      stockPairedPct: rows.length ? Math.round((1000 * stockLaunches) / rows.length) / 10 : null,
      stockTickers: stock.length,
      ethPaired: byPair['ETH (native)'] ?? 0,
      topPairs: Object.entries(byPair).sort((a, b) => b[1] - a[1]).slice(0, 15),
    };
  };

  cache.summary = {
    latestBlock: Number(latest),
    latestDay: await day(Number(latest)),
    longXyz: await describe(long),
    longXyzCurrentFactory: await describe(cache.longNew),
    ponsV2: await describe(cache.ponsV2),
  };
  cache.longAssets = long.map((r) => r[0]);
  save();
  console.log(JSON.stringify(cache.summary, null, 1));
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
