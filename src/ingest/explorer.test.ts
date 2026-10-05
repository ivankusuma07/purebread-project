import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchContractVerification } from './explorer';

const API = 'https://explorer.test/api';

describe('fetchContractVerification', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reads verified and unverified source from the explorer', async () => {
    vi.stubGlobal('fetch', async (url: string) =>
      new Response(JSON.stringify({ result: [{ SourceCode: url.includes('0x' + 'a'.repeat(40)) ? 'contract X {}' : '' }] })),
    );
    expect(await fetchContractVerification('0x' + 'a'.repeat(40), API)).toBe(true);
    expect(await fetchContractVerification('0x' + 'b'.repeat(40), API)).toBe(false);
  });

  it('never asks about a non-EVM address', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    expect(await fetchContractVerification('6GmAFSYs4gk3FDao5FzzySQpPZaWsa4rUJHacpMpUNgx', API)).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});
