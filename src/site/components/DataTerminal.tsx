'use client';

import { RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import CopyButton from './CopyButton';

/** A run of code in one colour. */
type Seg = [text: string, className: string];

interface Snippet {
  id: string;
  label: string;
  prompt: string;
  /** Command lines, typed character by character. */
  input: Seg[][];
  /** Output lines, streamed one at a time after the command. */
  output: Seg[][];
}

export interface TerminalRow {
  rank: number;
  name: string;
  veracity: number;
  band: string;
}

interface DataTerminalProps {
  url: string;
  file: string;
  rows: TerminalRow[];
  /** jq's output for `.venues[0] | {name, rank, veracity, band, scores}`, in that key order. */
  first: unknown;
}

const TYPE_MS = 20;
const LINE_MS = 55;
const PAUSE_MS = 380;
const NEXT_TAB_MS = 4200;

const plain = (text: string, cls = 'text-ink-2'): Seg[] => [[text, cls]];

/** Colours one line of pretty-printed JSON. */
function jsonLine(line: string): Seg[] {
  const out: Seg[] = [];
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?)|\b(true|false|null)\b|([{}[\],])/g;
  let last = 0;
  for (let m = re.exec(line); m; m = re.exec(line)) {
    if (m.index > last) out.push([line.slice(last, m.index), 'text-ink-2']);
    if (m[1]) {
      out.push([m[1], m[2] ? 'text-k18' : 'text-k14']);
      if (m[2]) out.push([m[2], 'text-ink-3']);
    } else if (m[3]) out.push([m[3], 'text-gold']);
    else if (m[4]) out.push([m[4], 'text-k22']);
    else out.push([m[5], 'text-ink-3']);
    last = re.lastIndex;
  }
  if (last < line.length) out.push([line.slice(last), 'text-ink-2']);
  return out;
}

function snippets(url: string, rows: TerminalRow[], first: unknown): Snippet[] {
  const tick = '`';
  return [
    {
      id: 'curl',
      label: 'curl',
      prompt: '$',
      input: [
        [
          ['curl', 'text-k18'],
          [' -s ', 'text-ink-3'],
          [url, 'text-gold'],
          [' | ', 'text-ink-3'],
          ['jq', 'text-k18'],
          [" '.venues[0] | {name, rank, veracity, band, scores}'", 'text-k14'],
        ],
      ],
      output: JSON.stringify(first, null, 2).split('\n').map(jsonLine),
    },
    {
      id: 'js',
      label: 'JavaScript',
      prompt: '>',
      input: [
        [
          ['const', 'text-k22'],
          [' edition = ', 'text-ink'],
          ['await', 'text-k22'],
          [' fetch(', 'text-ink'],
          [`'${url}'`, 'text-gold'],
          [').then((r) => r.', 'text-ink'],
          ['json', 'text-k18'],
          ['());', 'text-ink'],
        ],
        [
          ['edition.venues.', 'text-ink'],
          ['map', 'text-k18'],
          ['((v) => ', 'text-ink'],
          [tick + '$' + '{v.rank}. $' + '{v.name} $' + '{v.veracity}' + tick, 'text-k14'],
          [');', 'text-ink'],
        ],
      ],
      output: [
        plain('[', 'text-ink-3'),
        ...rows.map((r, i): Seg[] => [
          ['  ', 'text-ink-2'],
          [`'${r.rank}. ${r.name} ${r.veracity}'`, 'text-k14'],
          [i < rows.length - 1 ? ',' : '', 'text-ink-3'],
        ]),
        plain(']', 'text-ink-3'),
      ],
    },
    {
      id: 'python',
      label: 'Python',
      prompt: '>>>',
      input: [
        [
          ['import', 'text-k22'],
          [' requests', 'text-ink'],
        ],
        [
          ['ed = requests.', 'text-ink'],
          ['get', 'text-k18'],
          ['(', 'text-ink'],
          [`"${url}"`, 'text-gold'],
          [').', 'text-ink'],
          ['json', 'text-k18'],
          ['()', 'text-ink'],
        ],
        [
          ['for', 'text-k22'],
          [' v ', 'text-ink'],
          ['in', 'text-k22'],
          [' ed[', 'text-ink'],
          ['"venues"', 'text-k14'],
          [']: ', 'text-ink'],
          ['print', 'text-k18'],
          ['(v[', 'text-ink'],
          ['"rank"', 'text-k14'],
          ['], v[', 'text-ink'],
          ['"name"', 'text-k14'],
          ['], v[', 'text-ink'],
          ['"veracity"', 'text-k14'],
          ['], v[', 'text-ink'],
          ['"band"', 'text-k14'],
          ['])', 'text-ink'],
        ],
      ],
      output: rows.map((r): Seg[] => [
        [String(r.rank), 'text-gold'],
        [` ${r.name} `, 'text-ink'],
        [String(r.veracity), 'text-gold'],
        [` ${r.band}`, 'text-k14'],
      ]),
    },
  ];
}

const lineLength = (line: Seg[]) => line.reduce((n, [t]) => n + t.length, 0);
const lineText = (line: Seg[]) => line.map(([t]) => t).join('');

/** The first `n` characters of a line, colours kept. */
function sliceLine(line: Seg[], n: number): ReactNode[] {
  const out: ReactNode[] = [];
  let left = n;
  for (const [i, [text, cls]] of line.entries()) {
    if (left <= 0) break;
    out.push(
      <span key={i} className={cls}>
        {text.slice(0, left)}
      </span>,
    );
    left -= text.length;
  }
  return out;
}

const Caret = () => <span className="caret ml-px inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] bg-gold" aria-hidden />;

/** Everything a snippet shows when it has finished. Also sizes the frame so nothing jumps. */
function Finished({ s }: { s: Snippet }) {
  return (
    <>
      {s.input.map((line, i) => (
        <span key={`i${i}`} className="block">
          <span className="select-none text-k14">{s.prompt} </span>
          {sliceLine(line, Infinity)}
        </span>
      ))}
      <span className="block h-3" />
      {s.output.map((line, i) => (
        <span key={`o${i}`} className="block">
          {sliceLine(line, Infinity)}
        </span>
      ))}
      <span className="mt-3 block text-xs text-ink-3">
        <span className="text-k14">●</span> 200 OK · application/json · CORS open · no key
      </span>
      <span className="block">
        <span className="select-none text-k14">{s.prompt} </span>
      </span>
    </>
  );
}

const REDUCED = '(prefers-reduced-motion: reduce)';
function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/**
 * A terminal that types a real request for the edition file and streams the
 * real response. Starts when scrolled into view and loops curl, JavaScript and
 * Python for as long as it is on screen; picking a tab jumps there and the loop
 * carries on. Hovering or focusing it holds the current snippet for reading.
 * Without JavaScript, or with reduced motion, it shows the finished state.
 */
export default function DataTerminal({ url, file, rows, first }: DataTerminalProps) {
  const all = useMemo(() => snippets(url, rows, first), [url, rows, first]);
  const [tab, setTab] = useState(0);
  const [run, setRun] = useState(0);
  // The server, and readers without JavaScript, get the finished terminal.
  const animate = useSyncExternalStore(
    subscribeMotion,
    () => !window.matchMedia(REDUCED).matches,
    () => false,
  );
  // Progress belongs to one tab and one run; anything else reads as not started.
  const key = `${tab}:${run}`;
  const [progress, setProgress] = useState({ key, chars: 0, lines: 0 });
  const chars = progress.key === key ? progress.chars : 0;
  const lines = progress.key === key ? progress.lines : 0;
  const [inView, setInView] = useState(false);
  // True while the pointer is over the terminal or focus is inside it.
  const [held, setHeld] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  const s = all[tab];
  const total = s.input.reduce((n, l) => n + lineLength(l), 0);
  const typing = animate && chars < total;
  const done = !animate || (chars >= total && lines >= s.output.length);

  useEffect(() => {
    const el = frame.current;
    if (!animate || !el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [animate]);

  // Type the command, pause, stream the output.
  useEffect(() => {
    if (!animate || !inView) return;
    let c = 0;
    let l = 0;
    let timer: ReturnType<typeof setTimeout>;
    const type = () => {
      c += 1;
      setProgress({ key, chars: c, lines: 0 });
      timer = setTimeout(c < total ? type : stream, c < total ? TYPE_MS : PAUSE_MS);
    };
    const stream = () => {
      l += 1;
      setProgress({ key, chars: total, lines: l });
      if (l < s.output.length) timer = setTimeout(stream, LINE_MS);
    };
    timer = setTimeout(type, 300);
    return () => clearTimeout(timer);
  }, [animate, inView, key, total, s.output.length]);

  // Loop: once a snippet finishes, move to the next one, unless it is held.
  const waiting = animate && inView && done && !held;
  useEffect(() => {
    if (!waiting) return;
    const t = setTimeout(() => setTab((i) => (i + 1) % all.length), NEXT_TAB_MS);
    return () => clearTimeout(t);
  }, [waiting, all.length]);

  const pick = (i: number) => {
    setTab(i);
    setRun((r) => r + 1);
  };

  // Where the caret sits while typing: which input line, and how far along it.
  const typed: number[] = [];
  let before = 0;
  for (const line of s.input) {
    typed.push(Math.min(lineLength(line), Math.max(0, chars - before)));
    before += lineLength(line);
  }
  const activeLine = typed.findIndex((n, i) => n < lineLength(s.input[i]));

  return (
    <div
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#05070d] shadow-2xl shadow-black/50"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false);
      }}
    >
      <div className="relative flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
        {/* Fills while a finished snippet waits for the next one. Restarts after a hold. */}
        {waiting && (
          <span
            key={`${key}:${held}`}
            aria-hidden
            className="loop-bar absolute inset-x-0 bottom-0 h-px origin-left bg-gold/70"
            style={{ animationDuration: `${NEXT_TAB_MS}ms` }}
          />
        )}
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-3 rounded-full bg-vermilion/80" />
          <span className="size-3 rounded-full bg-gold/80" />
          <span className="size-3 rounded-full bg-k14/80" />
        </span>
        <div role="tablist" aria-label="Fetch the edition with" className="flex gap-1">
          {all.map((x, i) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={i === tab}
              onClick={() => pick(i)}
              className={`mono rounded-md px-2.5 py-1 text-xs transition-colors ${
                i === tab ? 'bg-white/10 text-ink' : 'text-ink-3 hover:bg-white/5 hover:text-ink-2'
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>
        <span className="mono ml-auto hidden truncate text-xs text-ink-3 sm:inline">{held && animate && done ? 'paused' : file}</span>
        {animate && (
          <button
            type="button"
            onClick={() => setRun((r) => r + 1)}
            className="text-ink-3 hover:text-ink"
            aria-label="Replay"
            title="Replay"
          >
            <RotateCcw size={14} aria-hidden />
          </button>
        )}
        <CopyButton value={s.input.map(lineText).join('\n')} what={`${s.label} snippet`} className="no-underline" />
      </div>

      <div ref={frame} className="grid">
        {/* Sizer: the finished snippet, invisible, so the frame never jumps. */}
        <pre aria-hidden className="mono invisible p-5 text-[0.8125rem] leading-relaxed [grid-area:1/1] wrap-anywhere whitespace-pre-wrap">
          <Finished s={s} />
        </pre>
        <pre className="mono p-5 text-[0.8125rem] leading-relaxed [grid-area:1/1] wrap-anywhere whitespace-pre-wrap" aria-live="off">
          <code>
            {!animate ? (
              <Finished s={s} />
            ) : (
              <>
                {s.input.map((line, i) =>
                  typed[i] > 0 || i === 0 ? (
                    <span key={`i${i}`} className="block">
                      <span className="select-none text-k14">{s.prompt} </span>
                      {sliceLine(line, typed[i])}
                      {typing && i === activeLine && <Caret />}
                    </span>
                  ) : null,
                )}
                {lines > 0 && <span className="block h-3" />}
                {s.output.slice(0, lines).map((line, i) => (
                  <span key={`o${i}`} className="block">
                    {sliceLine(line, Infinity)}
                  </span>
                ))}
                {done && (
                  <>
                    <span className="mt-3 block text-xs text-ink-3">
                      <span className="text-k14">●</span> 200 OK · application/json · CORS open · no key
                    </span>
                    <span className="block">
                      <span className="select-none text-k14">{s.prompt} </span>
                      <Caret />
                    </span>
                  </>
                )}
              </>
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}
