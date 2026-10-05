import { fetchJson } from './http';

interface SourceResponse {
  result?: { SourceCode?: string; ABI?: string }[] | string;
}

/**
 * Verification status from a Blockscout-compatible explorer API.
 * Null means "couldn't tell": the caller keeps the previous value rather than
 * overwrite it with false.
 */
export async function fetchContractVerification(address: string, apiBase?: string): Promise<boolean | null> {
  const base = (apiBase || process.env.EXPLORER_API_URL || '').replace(/\/$/, '');
  // Solana accounts and other non-EVM addresses have nothing to check here.
  if (!base || !/^0x[0-9a-fA-F]{40}$/.test(address)) return null;
  const raw = (await fetchJson(
    `${base}?module=contract&action=getsourcecode&address=${encodeURIComponent(address)}`,
  )) as SourceResponse | null;
  const result = raw?.result;
  if (!Array.isArray(result) || result.length === 0) return null;
  const row = result[0];
  if (typeof row?.SourceCode !== 'string') return null;
  return row.SourceCode.length > 0;
}
