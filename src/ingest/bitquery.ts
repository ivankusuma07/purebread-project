import { cleanMetric, fetchJson } from './http';

export interface BitqueryVolume {
  cumulativeVolumeUsd: number | null;
  dailyVolumeUsd: number | null;
}

const NONE: BitqueryVolume = { cumulativeVolumeUsd: null, dailyVolumeUsd: null };

interface TradesPayload {
  data?: { EVM?: { DEXTradeByTokens?: { volumeUsd?: number | string }[] } };
}

async function sumVolume(key: string, network: string, factories: string[], since?: string): Promise<number | null> {
  const where = since ? `, Block: {Date: {since: "${since}"}}` : '';
  const query = `query($factories: [String!]) {
    EVM(network: ${network}, dataset: combined) {
      DEXTradeByTokens(where: {Trade: {Dex: {SmartContract: {in: $factories}}}${where}}) {
        volumeUsd: sum(of: Trade_Side_AmountInUSD)
      }
    }
  }`;
  const raw = (await fetchJson(process.env.BITQUERY_API_URL || 'https://streaming.bitquery.io/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ query, variables: { factories } }),
  })) as TradesPayload | null;
  const rows = raw?.data?.EVM?.DEXTradeByTokens;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return cleanMetric(Number(rows[0]?.volumeUsd));
}

/**
 * Volume through a venue's factory contracts. Without BITQUERY_API_KEY, or
 * without mapped contracts, every figure stays null instead of failing the run.
 */
export async function fetchBitqueryVolume(
  network: string,
  factories: string[],
  asOf: string,
): Promise<BitqueryVolume> {
  const key = process.env.BITQUERY_API_KEY;
  if (!key || factories.length === 0) return NONE;
  const dayBefore = new Date(Date.parse(`${asOf}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
  const [cumulativeVolumeUsd, dailyVolumeUsd] = await Promise.all([
    sumVolume(key, network, factories),
    sumVolume(key, network, factories, dayBefore),
  ]);
  return { cumulativeVolumeUsd, dailyVolumeUsd };
}
