// Shared fetch helper for providers. It never throws: a network error, a
// timeout, a bad status or an unparsable body all resolve to null, so a gap
// renders as "not published" instead of a made-up figure.

export interface FetchOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
  method?: 'GET' | 'POST';
  body?: string;
}

export async function fetchJson(url: string, options: FetchOptions = {}): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 15_000);
  try {
    const res = await fetch(url, {
      method: options.method ?? 'GET',
      headers: { accept: 'application/json', ...options.headers },
      body: options.body,
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as unknown;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Only finite numbers >= 0 survive. Everything else becomes null. */
export function cleanMetric(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}
