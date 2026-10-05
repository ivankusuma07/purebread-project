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
  if (!base) return null;
  const raw = (await fetchJson(
    `${base}?module=contract&action=getsourcecode&address=${encodeURIComponent(address)}`,
  )) as SourceResponse | null;
  const result = raw?.result;
  if (!Array.isArray(result) || result.length === 0) return null;
  const row = result[0];
  if (typeof row?.SourceCode !== 'string') return null;
  return row.SourceCode.length > 0;
}
