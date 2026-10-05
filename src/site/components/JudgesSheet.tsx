'use client';

import { Minus, Plus, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { useRef } from 'react';
import { CRITERIA, normalise } from '../../scoring/veracity';
import { CRITERION_INFO } from '../lib/criteria';
import { pct } from '../lib/format';
import ElasticSlider from '../reactbits/ElasticSlider';
import { HOUSE_RAW, PRESETS, type RawWeights } from '../weight-url';

interface JudgesSheetProps {
  raw: RawWeights;
  onChange: (raw: RawWeights) => void;
  isHouse: boolean;
}

const same = (a: RawWeights, b: RawWeights) => CRITERIA.every((c) => a[c] === b[c]);

/**
 * The judge's sheet: five sliders and four presets. Moving a slider re-sorts
 * the register and rewrites the link, so a ranking can be shared as-is.
 * On phones it opens as a bottom sheet.
 */
export default function JudgesSheet({ raw, onChange, isHouse }: JudgesSheetProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const weights = normalise(raw);

  return (
    <details ref={detailsRef} className="judges-sheet mt-6 border-t border-ink pt-3" data-testid="judges-sheet">
      <summary className="flex cursor-pointer list-none items-center gap-2 py-1 text-ink [&::-webkit-details-marker]:hidden">
        <SlidersHorizontal size={17} aria-hidden />
        <span className="font-mincho text-lg font-bold">Judge&apos;s sheet</span>
        <span className="num text-sm text-ink-2">
          {isHouse ? 'house weights' : 'your weights'} · {CRITERIA.map((c) => Math.round(weights[c] * 100)).join(' ')}
        </span>
      </summary>

      <div className="judges-body pt-4">
        <div className="mb-4 flex items-center justify-between min-[810px]:hidden">
          <span className="font-mincho text-lg font-bold">Judge&apos;s sheet</span>
          <button type="button" className="btn" onClick={() => detailsRef.current?.removeAttribute('open')}>
            <X size={15} aria-hidden /> Close
          </button>
        </div>

        <p className="measure mb-5 text-sm text-ink-2">
          Weigh the five criteria your way. The scores stay the editors&apos;; only the weighting is yours. Deltas are
          always measured at house weights.
        </p>

        <div className="grid gap-x-10 gap-y-1 lg:grid-cols-[1fr_15rem]">
          <div className="space-y-1">
            {CRITERIA.map((c) => (
              <ElasticSlider
                key={c}
                id={`w-${c}`}
                value={raw[c]}
                onChange={(n) => onChange({ ...raw, [c]: n })}
                min={0}
                max={10}
                label={
                  <>
                    {CRITERION_INFO[c].label}
                    <span className="num block text-xs text-ink-3">{pct(weights[c])} of the score</span>
                  </>
                }
                valueText={`${pct(weights[c])} of the score`}
                leftIcon={<Minus size={13} />}
                rightIcon={<Plus size={13} />}
              />
            ))}
          </div>

          <fieldset className="mt-4 lg:mt-0">
            <legend className="mb-2 text-sm text-ink-2">Presets</legend>
            <ul className="space-y-1.5">
              {PRESETS.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    aria-pressed={same(raw, p.values)}
                    onClick={() => onChange({ ...p.values })}
                    className="btn w-full justify-between"
                  >
                    <span>{p.label}</span>
                    <span className="text-xs opacity-75">{p.note}</span>
                  </button>
                </li>
              ))}
            </ul>
            {!same(raw, HOUSE_RAW) && (
              <button type="button" className="btn mt-3" onClick={() => onChange({ ...HOUSE_RAW })}>
                <RotateCcw size={14} aria-hidden /> Reset to house weights
              </button>
            )}
          </fieldset>
        </div>
      </div>
    </details>
  );
}
