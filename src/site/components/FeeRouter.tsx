'use client';

import { CalendarClock, Database, ExternalLink, Flame, Hourglass, Vault, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPublicClient, createWalletClient, custom, defineChain, formatEther, http, type EIP1193Provider } from 'viem';
import { CHAIN, CONTRACTS, explorerAddress, explorerTx, TOKEN } from '../config';
import { shortHash } from '../lib/format';
import HoldButton from '../reactbits/HoldButton';
import StatusMark, { type StatusMarkStatus } from '../reactbits/StatusMark';
import CopyButton from './CopyButton';

const robinhood = defineChain({
  id: CHAIN.id,
  name: CHAIN.name,
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [CHAIN.rpcUrl] } },
  blockExplorers: { default: { name: 'Explorer', url: CHAIN.explorer } },
});

/** The three permissionless calls on the router. No owner, no withdraw, no keeper. */
const ROUTER_ABI = [
  { type: 'function', name: 'harvest', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { type: 'function', name: 'recordCheckpoint', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { type: 'function', name: 'executeBuyback', stateMutability: 'nonpayable', inputs: [], outputs: [] },
] as const;

const ERC20_ABI = [{ type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] }] as const;

type Call = (typeof ROUTER_ABI)[number]['name'];

const HOUR = 3_600_000;

/** The freeze window opens at 05:00 UTC on the 1st and stays open 72 hours. */
function freezeWindow(now: number) {
  const d = new Date(now);
  const opensAt = (y: number, m: number) => Date.UTC(y, m, 1, 5);
  const opens = opensAt(d.getUTCFullYear(), d.getUTCMonth());
  const closes = opens + 72 * HOUR;
  if (now < opens) return { open: false, target: opens };
  if (now < closes) return { open: true, target: closes };
  const nextMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  return { open: false, target: opensAt(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth()) };
}

function countdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(s / 86_400);
  const h = Math.floor((s % 86_400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${days}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
}

const SAMPLE = {
  routerEth: '1.84',
  vaultEth: '0.92',
  burns: [
    { freeze: '2026-11', eth: '0.61', bought: '18.2M', burned: '18.2M' },
    { freeze: '2026-12', eth: '0.74', bought: '20.9M', burned: '20.9M' },
  ],
  bounties: [
    { id: '01', kind: 'Unsourced figure', amount: '150K', status: 'Timelocked' },
    { id: '02', kind: 'Wrong custodian', amount: '400K', status: 'Paid' },
  ],
};

function Sample() {
  return <span className="ml-1.5 text-xs text-ink-3">sample</span>;
}

function AddressRow({ label, address, note }: { label: string; address: string | null; note?: string }) {
  return (
    <li className="grid grid-cols-[9rem_1fr] items-baseline gap-x-4 py-2">
      <span className="text-ink-2">{label}</span>
      {address ? (
        <span className="flex flex-wrap items-baseline gap-x-3">
          <a href={explorerAddress(address)} className="num" title={address}>
            {shortHash(address)}
          </a>
          <CopyButton value={address} what={`${label} address`} />
        </span>
      ) : (
        <span className="text-ink-3">{note ?? 'not deployed yet'}</span>
      )}
    </li>
  );
}

export default function FeeRouter({ editionId }: { editionId: string }) {
  const live = Boolean(CONTRACTS.router && CONTRACTS.vault);
  const [now, setNow] = useState<number | null>(null);
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [status, setStatus] = useState<Record<Call, StatusMarkStatus>>({
    recordCheckpoint: 'pending',
    executeBuyback: 'pending',
    harvest: 'pending',
  });
  const [log, setLog] = useState<string[]>([
    live ? 'Connect a wallet to call the router.' : 'Preview mode. Calls are simulated, nothing is sent.',
  ]);
  const [reads, setReads] = useState<{ supply?: string; router?: string; vault?: string }>({});

  useEffect(() => {
    // Mounted: start the clock. The server renders without a time so nothing mismatches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!live) return;
    const client = createPublicClient({ chain: robinhood, transport: http() });
    (async () => {
      try {
        const [router, vault, supply] = await Promise.all([
          client.getBalance({ address: CONTRACTS.router! }),
          client.getBalance({ address: CONTRACTS.vault! }),
          CONTRACTS.token ? client.readContract({ address: CONTRACTS.token, abi: ERC20_ABI, functionName: 'totalSupply' }) : null,
        ]);
        setReads({
          router: Number(formatEther(router)).toFixed(4),
          vault: Number(formatEther(vault)).toFixed(4),
          supply: supply == null ? undefined : Math.round(Number(formatEther(supply))).toLocaleString('en-GB'),
        });
      } catch {
        setLog((l) => [...l, 'Could not read the contracts from the RPC. Figures stay empty rather than guessed.']);
      }
    })();
  }, [live]);

  const freeze = useMemo(() => (now == null ? null : freezeWindow(now)), [now]);
  const say = (line: string) => setLog((l) => [...l.slice(-7), line]);

  async function connect() {
    const eth = (window as unknown as { ethereum?: EIP1193Provider }).ethereum;
    if (!eth) {
      say('No browser wallet found. Install one that supports Robinhood Chain.');
      return;
    }
    try {
      const wallet = createWalletClient({ chain: robinhood, transport: custom(eth) });
      const [addr] = await wallet.requestAddresses();
      if ((await wallet.getChainId()) !== CHAIN.id) {
        say(`Asking your wallet to switch to ${CHAIN.name} (${CHAIN.id}).`);
        try {
          await wallet.switchChain({ id: CHAIN.id });
        } catch {
          await wallet.addChain({ chain: robinhood });
        }
      }
      setAccount(addr);
      say(`Connected ${shortHash(addr)} on ${CHAIN.name}.`);
    } catch (e) {
      say(`Wallet declined: ${e instanceof Error ? e.message.split('\n')[0] : String(e)}`);
    }
  }

  async function call(name: Call) {
    if (!live) {
      setStatus((s) => ({ ...s, [name]: 'cancelled' }));
      say(`Preview: ${name}() was not sent. The router is not deployed yet.`);
      return;
    }
    const eth = (window as unknown as { ethereum?: EIP1193Provider }).ethereum;
    if (!account || !eth) {
      say('Connect a wallet first.');
      return;
    }
    setStatus((s) => ({ ...s, [name]: 'running' }));
    try {
      const wallet = createWalletClient({ account, chain: robinhood, transport: custom(eth) });
      if ((await wallet.getChainId()) !== CHAIN.id) throw new Error(`wallet is not on chain ${CHAIN.id}`);
      const hash = await wallet.writeContract({ address: CONTRACTS.router!, abi: ROUTER_ABI, functionName: name });
      say(`${name}() sent: ${shortHash(hash)}`);
      const receipt = await createPublicClient({ chain: robinhood, transport: http() }).waitForTransactionReceipt({ hash });
      const ok = receipt.status === 'success';
      setStatus((s) => ({ ...s, [name]: ok ? 'done' : 'failed' }));
      say(`${name}() ${ok ? 'confirmed' : 'reverted'} in block ${receipt.blockNumber}. ${explorerTx(hash)}`);
    } catch (e) {
      setStatus((s) => ({ ...s, [name]: 'failed' }));
      say(`${name}() failed: ${e instanceof Error ? e.message.split('\n')[0] : String(e)}`);
    }
  }

  const CALLS: { name: Call; when: string }[] = [
    { name: 'recordCheckpoint', when: 'Hourly. Records the delayed reference price the buyback is checked against.' },
    { name: 'executeBuyback', when: 'Only inside the freeze window. Buys within the guards below, burns, and pays the vault share.' },
    { name: 'harvest', when: 'Any time. Pulls creator fees into the router and splits them 50 / 30 / 20.' },
  ];

  return (
    <div className="space-y-0">
      <header className="pb-8 pt-8 min-[1200px]:pt-12">
        <h1 className="text-[clamp(1.9rem,1.4rem+2vw,2.75rem)]">Fee router</h1>
        <p className="measure mt-3 text-lg text-ink-2">
          Every {TOKEN.symbol} creator fee lands in a contract nobody controls. Half is bought back and burned after
          each edition freezes, three tenths pays readers who prove the register wrong, and a fifth pays for the data.
        </p>
        {!live && (
          <p role="note" className="mt-5 max-w-3xl border border-ink px-4 py-3 text-sm" data-testid="preview-banner">
            <strong>Preview mode.</strong> The router and the vault are not deployed yet, so figures marked
            &ldquo;sample&rdquo; are illustrations, not chain data. Calls below are simulated and nothing is sent.
          </p>
        )}
      </header>

      <section aria-labelledby="token-title" className="chapter grid gap-10 md:grid-cols-2">
        <div>
          <h2 id="token-title" className="chapter-title mb-4">
            {TOKEN.symbol}
          </h2>
          <ul className="ledger">
            <AddressRow label="Token" address={CONTRACTS.token} note="not launched yet" />
            <AddressRow label="Pool" address={CONTRACTS.pool} note="not launched yet" />
            <AddressRow label="Creator wallet" address={CONTRACTS.creator} note="not published yet" />
          </ul>
          <p className="mt-3 text-sm text-ink-2">
            {CHAIN.name}, chain {CHAIN.id}. Fixed supply of {TOKEN.supply.toLocaleString('en-GB')}.
            {reads.supply && ` Live total supply: ${reads.supply}.`}
          </p>
          {TOKEN.launchpadUrl && (
            <a href={TOKEN.launchpadUrl} className="mt-2 inline-flex items-center gap-1.5 text-sm">
              Trade on the launchpad <ExternalLink size={14} aria-hidden />
            </a>
          )}
        </div>
        <div>
          <h2 className="chapter-title mb-4 flex items-center gap-2">
            <Hourglass size={20} aria-hidden /> Freeze window
          </h2>
          <p className="text-ink-2">Opens 05:00 UTC on the 1st of each month, for 72 hours. Buybacks run only inside it.</p>
          <p className="num mt-4 font-mincho text-3xl font-bold" data-testid="freeze-countdown">
            {freeze ? countdown(freeze.target - (now ?? 0)) : '…'}
          </p>
          <p className="text-sm text-ink-2">{freeze ? (freeze.open ? 'until the window closes' : 'until the window opens') : 'reading the clock'}</p>
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-3">
            <CalendarClock size={14} aria-hidden /> Last frozen edition: {editionId}
          </p>
        </div>
      </section>

      <section aria-labelledby="split-title" className="chapter">
        <h2 id="split-title" className="chapter-title mb-5">
          Where every fee goes
        </h2>
        <div aria-hidden className="flex h-4 w-full">
          <span className="w-1/2 bg-ink" />
          <span className="w-[30%] bg-shiba" />
          <span className="w-1/5 bg-grid" />
        </div>
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="flex items-center gap-2 text-lg">
              <Flame size={18} aria-hidden /> 50% burned
            </h3>
            <p className="mt-1.5 text-ink-2">Bought back and burned inside the 72 hours after each edition freezes.</p>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-lg">
              <Vault size={18} aria-hidden /> 30% verification vault
            </h3>
            <p className="mt-1.5 text-ink-2">Bought back and held to pay readers who prove an error in the register.</p>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-lg">
              <Database size={18} aria-hidden /> 20% data
            </h3>
            <p className="mt-1.5 text-ink-2">Sent as ETH to the data wallet for the APIs and the RPC the register runs on.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="balances-title" className="chapter grid gap-10 md:grid-cols-2">
        <div>
          <h2 id="balances-title" className="chapter-title mb-4">
            Balances
          </h2>
          <dl className="grid grid-cols-[11rem_1fr] gap-y-2" data-testid="balances">
            <dt className="text-ink-2">Router, waiting</dt>
            <dd className="num">{live ? (reads.router ? `${reads.router} ETH` : 'reading…') : <>{SAMPLE.routerEth} ETH<Sample /></>}</dd>
            <dt className="text-ink-2">Verification vault</dt>
            <dd className="num">{live ? (reads.vault ? `${reads.vault} ETH` : 'reading…') : <>{SAMPLE.vaultEth} ETH<Sample /></>}</dd>
          </dl>
          <h3 className="mt-8 font-gothic text-base font-bold">Contracts</h3>
          <ul className="ledger mt-2">
            <AddressRow label="Fee router" address={CONTRACTS.router} />
            <AddressRow label="Verification vault" address={CONTRACTS.vault} />
            <AddressRow label="Data wallet" address={CONTRACTS.dataWallet} note="not published yet" />
          </ul>
        </div>
        <div>
          <h2 className="chapter-title mb-4">Buyback guards</h2>
          <table className="table-ledger">
            <thead>
              <tr>
                <th scope="col">Guard</th>
                <th scope="col">Limit</th>
                <th scope="col">Stops</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-ink">Delayed reference</td>
                <td>1 to 6 hours old</td>
                <td className="text-ink-2">Pumping the price just before a buyback</td>
              </tr>
              <tr>
                <td className="text-ink">One-sided band</td>
                <td>At most 2% above</td>
                <td className="text-ink-2">Buying into a price pushed up</td>
              </tr>
              <tr>
                <td className="text-ink">Impact cap</td>
                <td>3% of reserves per buy</td>
                <td className="text-ink-2">Large slippage. Unspent ETH waits for the next hour</td>
              </tr>
              <tr>
                <td className="text-ink">Window</td>
                <td>72 hours a month</td>
                <td className="text-ink-2">Surprise buybacks off schedule</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="ledgers-title" className="chapter grid gap-10 md:grid-cols-2">
        <div>
          <h2 id="ledgers-title" className="chapter-title mb-4">
            Burn history
          </h2>
          {live ? (
            <p className="text-ink-2">Each burn appears here with its transaction once the first freeze window closes.</p>
          ) : (
            <table className="table-ledger">
              <thead>
                <tr>
                  <th scope="col">Freeze</th>
                  <th scope="col" className="n">ETH spent</th>
                  <th scope="col" className="n">Bought</th>
                  <th scope="col" className="n">Burned</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE.burns.map((b) => (
                  <tr key={b.freeze}>
                    <td>
                      {b.freeze}
                      <Sample />
                    </td>
                    <td className="n">{b.eth}</td>
                    <td className="n">{b.bought}</td>
                    <td className="n">{b.burned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div>
          <h2 className="chapter-title mb-4">Bounty ledger</h2>
          {live ? (
            <p className="text-ink-2">No bounty has been claimed yet.</p>
          ) : (
            <table className="table-ledger">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Error found</th>
                  <th scope="col" className="n">Paid</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE.bounties.map((b) => (
                  <tr key={b.id}>
                    <td className="num">
                      {b.id}
                      <Sample />
                    </td>
                    <td>{b.kind}</td>
                    <td className="n">{b.amount}</td>
                    <td>{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-3 text-sm text-ink-2">
            One registrar. Every bounty waits 72 hours in public before it pays. At most 25% of the vault can leave in
            any 30 days, and after a year with no activity anyone may burn what is left.
          </p>
        </div>
      </section>

      <section aria-labelledby="run-title" className="chapter">
        <h2 id="run-title" className="chapter-title mb-2">
          Run it yourself
        </h2>
        <p className="measure mb-6 text-ink-2">
          The router has no owner, no withdraw and no keeper. Anyone can make these calls. Hold a button to confirm.
        </p>
        <button type="button" className="btn mb-6" onClick={connect}>
          <Wallet size={16} aria-hidden />
          {account ? `Connected ${shortHash(account)}` : 'Connect wallet'}
        </button>
        <ul className="ledger max-w-3xl">
          {CALLS.map((c) => (
            <li key={c.name} className="grid items-center gap-4 py-4 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="flex items-center gap-2">
                  <StatusMark status={status[c.name]} color="var(--color-ink)" doneColor="var(--color-k14)" errorColor="var(--color-vermilion)" size={18} />
                  <span className="font-mincho text-lg font-bold">{c.name}()</span>
                </p>
                <p className="mt-1 text-sm text-ink-2">{c.when}</p>
              </div>
              <HoldButton
                size="sm"
                radius={0}
                holdTime={1200}
                glow={false}
                backgroundColor="var(--color-paper-deep)"
                fillColor="var(--color-ink)"
                textColor="var(--color-ink)"
                fillTextColor="var(--color-paper)"
                doneLabel={live ? 'Sent' : 'Simulated'}
                onHold={() => void call(c.name)}
              >
                Hold to call
              </HoldButton>
            </li>
          ))}
        </ul>
        <div className="mt-6 max-w-3xl border-l-2 border-grid pl-4" aria-live="polite">
          <p className="mb-1 text-sm text-ink-3">Output</p>
          {log.map((line, i) => (
            <p key={`${i}-${line}`} className="num text-sm text-ink">
              {line}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
