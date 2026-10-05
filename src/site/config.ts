// Network and public addresses. Robinhood Chain mainnet, as Fineness.
// Every address is optional: until the token, router and vault exist, the
// fee router page runs in preview mode and says so.

const addr = (v: string | undefined): `0x${string}` | null => (v && /^0x[0-9a-fA-F]{40}$/.test(v) ? (v as `0x${string}`) : null);

export const CHAIN = {
  id: 4663,
  hexId: '0x1237',
  name: 'Robinhood Chain',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.chain.robinhood.com',
  explorer: (process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://robinscan.io').replace(/\/$/, ''),
} as const;

export const CONTRACTS = {
  token: addr(process.env.NEXT_PUBLIC_TOKEN_ADDRESS),
  pool: addr(process.env.NEXT_PUBLIC_POOL_ADDRESS),
  creator: addr(process.env.NEXT_PUBLIC_CREATOR_ADDRESS),
  router: addr(process.env.NEXT_PUBLIC_ROUTER_ADDRESS),
  vault: addr(process.env.NEXT_PUBLIC_VAULT_ADDRESS),
  dataWallet: addr(process.env.NEXT_PUBLIC_DATA_WALLET_ADDRESS),
} as const;

export const TOKEN = {
  symbol: '$VERA',
  supply: 1_000_000_000,
  launchpadUrl: process.env.NEXT_PUBLIC_LAUNCHPAD_URL || null,
} as const;

export const SITE = {
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://veracity-project.vercel.app').replace(/\/$/, ''),
  github: process.env.NEXT_PUBLIC_GITHUB_URL || null,
  x: process.env.NEXT_PUBLIC_X_URL || null,
} as const;

export const explorerAddress = (a: string) => `${CHAIN.explorer}/address/${a}`;
export const explorerTx = (h: string) => `${CHAIN.explorer}/tx/${h}`;
