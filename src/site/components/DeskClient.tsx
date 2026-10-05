'use client';

import { Check, Copy } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { AdmissionFinding } from '../../build/admission';
import type { ScoreMove } from '../../build/score-moves';
import { shortHash } from '../lib/format';

interface DeskClientProps {
  edition: string;
  published: string;
  dataAsOf: string;
  snapshotHash: string;
  basis: string | null;
  venueCount: number;
  moves: ScoreMove[];
  warnings: string[];
  admission: AdmissionFinding[];
  scope: string | null;
  unmapped: string[];
}

const RUNBOOK = [
  { day: 'Day 1', step: 'Data pull runs, snapshot written, hashed and committed' },
  { day: 'Days 2 and 3', step: 'Registration review against the four conditions' },
  { day: 'Days 4 to 6', step: 'Score review: every move cited, two sign-offs' },
  { day: 'Day 7', step: 'Freeze: snapshot hash recorded, deltas computed' },
  { day: 'Day 8', step: 'Publish the page and the JSON, acceptance suite green' },
];

/** A set of ids that survives a reload, per edition. Storage failures just mean a fresh desk. */
function usePersistedSet(key: string) {
  const [set, setSet] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setSet(new Set(JSON.parse(raw) as string[]));
    } catch {
      // fresh desk
    }
  }, [key]);
  function toggle(id: string) {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(key, JSON.stringify([...next]));
      } catch {
        // private mode
      }
      return next;
    });
  }
  return { set, toggle } as const;
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="chapter">
      <h2 className="chapter-title mb-4">{title}</h2>
      {children}
    </section>
  );
}

/** The internal review desk: runbook, review queue, registration findings, sign-off. */
export default function DeskClient(props: DeskClientProps) {
  const { edition } = props;
  const runbook = usePersistedSet(`desk:${edition}:runbook`);
  const approvals = usePersistedSet(`desk:${edition}:approvals`);
  const [reviewerA, setReviewerA] = useState('');
  const [reviewerB, setReviewerB] = useState('');
  const [copied, setCopied] = useState(false);

  const keys = props.moves.map((m) => `${m.id}:${m.criterion}`);
  const approved = keys.filter((k) => approvals.set.has(k)).length;
  const a = reviewerA.trim();
  const b = reviewerB.trim();
  const canSign = approved === keys.length && a.length > 0 && b.length > 0 && a !== b;

  const commit = `edition ${edition}: review sign-off

moves reviewed: ${approved}/${keys.length}
reviewers: ${a || '?'}, ${b || '?'}
basis: ${props.basis ?? 'first edition'}
snapshot: ${props.snapshotHash}`;

  async function copyCommit() {
    try {
      await navigator.clipboard.writeText(commit);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // select it by hand
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
      <header className="pb-6 pt-10">
        <p className="text-sm text-ink-2">
          <Link href="/">Register</Link> / desk (internal, not indexed)
        </p>
        <h1 className="mt-3 text-4xl">Editorial desk</h1>
        <p className="num mt-2 text-ink-2">
          Edition {edition} · published {props.published} · data {props.dataAsOf} · {props.venueCount} venues · snapshot{' '}
          {shortHash(props.snapshotHash)}
        </p>
      </header>

      <Block title="Runbook">
        <ul className="ledger max-w-2xl">
          {RUNBOOK.map((r) => (
            <li key={r.day} className="py-2">
              <label className="flex cursor-pointer items-baseline gap-3">
                <input type="checkbox" checked={runbook.set.has(r.day)} onChange={() => runbook.toggle(r.day)} className="accent-[var(--color-ink)]" />
                <span className="w-28 shrink-0 text-ink-2">{r.day}</span>
                <span className={runbook.set.has(r.day) ? 'text-ink-3 line-through' : 'text-ink'}>{r.step}</span>
              </label>
            </li>
          ))}
        </ul>
      </Block>

      <Block title={`Score moves since ${props.basis ?? 'nothing (first edition)'}`}>
        {props.moves.length === 0 ? (
          <p className="text-ink-2">No score moved. Nothing to approve.</p>
        ) : (
          <table className="table-ledger max-w-3xl">
            <thead>
              <tr>
                <th scope="col">Approve</th>
                <th scope="col">Venue</th>
                <th scope="col">Criterion</th>
                <th scope="col">Move</th>
                <th scope="col">Rationale</th>
              </tr>
            </thead>
            <tbody>
              {props.moves.map((m) => {
                const k = `${m.id}:${m.criterion}`;
                return (
                  <tr key={k}>
                    <td>
                      <input type="checkbox" checked={approvals.set.has(k)} onChange={() => approvals.toggle(k)} aria-label={`Approve ${m.name} ${m.criterion}`} />
                    </td>
                    <td>{m.name}</td>
                    <td>{m.criterion}</td>
                    <td className="num">
                      {m.from} to {m.to}
                    </td>
                    <td className={m.rationaleChanged ? '' : 'text-vermilion-ink'}>{m.rationaleChanged ? 'rewritten' : 'unchanged, check'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {props.warnings.length > 0 && (
          <ul className="mt-4 space-y-1 text-sm text-vermilion-ink">
            {props.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}
      </Block>

      <Block title="Registration review">
        {props.admission.length === 0 ? (
          <p className="text-ink-2">Every venue registered under the standard passes the machine checks.</p>
        ) : (
          <ul className="space-y-3">
            {props.admission.map((f) => (
              <li key={f.id}>
                <p className="font-bold">{f.id}</p>
                <ul className="list-disc pl-5 text-sm text-ink-2">
                  {f.failed.map((r) => (
                    <li key={r}>Condition {r}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
        {props.scope && <p className="mt-4 text-sm">{props.scope}</p>}
      </Block>

      <Block title="Data mappings">
        {props.unmapped.length === 0 ? (
          <p className="text-ink-2">Every venue has a verified data mapping.</p>
        ) : (
          <>
            <p className="measure text-ink-2">
              These venues have no verified provider mapping in <code className="font-gothic">src/ingest/venues.ts</code>, so
              their figures stay &ldquo;not published&rdquo; until one is added and checked.
            </p>
            <p className="mt-2 text-sm">{props.unmapped.join(', ')}</p>
          </>
        )}
      </Block>

      <Block title="Sign-off">
        <div className="grid max-w-xl gap-3 sm:grid-cols-2">
          <label className="text-sm text-ink-2">
            Reviewer one
            <input value={reviewerA} onChange={(e) => setReviewerA(e.target.value)} className="mt-1 block w-full border-b border-ink bg-transparent py-1 text-ink outline-none" />
          </label>
          <label className="text-sm text-ink-2">
            Reviewer two
            <input value={reviewerB} onChange={(e) => setReviewerB(e.target.value)} className="mt-1 block w-full border-b border-ink bg-transparent py-1 text-ink outline-none" />
          </label>
        </div>
        <pre className="num mt-5 max-w-xl overflow-x-auto border-l-2 border-grid bg-paper-deep/60 py-3 pl-4 font-gothic text-sm">{commit}</pre>
        <button type="button" className="btn mt-3" disabled={!canSign} onClick={copyCommit} aria-disabled={!canSign}>
          {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
          {copied ? 'Copied' : 'Copy commit message'}
        </button>
        {!canSign && (
          <p className="mt-2 text-sm text-ink-3">Approve every move and enter two different reviewers to sign off.</p>
        )}
      </Block>
    </main>
  );
}
