import { expect } from 'vitest';
import { PriceBar } from '../src/price/price-bar';
import { detectCandlePatternMatches } from '../src/indicators/kinds/candles/candle-indicator';

/**
 * Golden-fixture helpers for candlestick patterns.
 *
 * Unlike candle-builders.ts (which injects pre-classified CandleMetrics), these
 * build raw OHLC bars and run them through the REAL pipeline
 * (`detectCandlePatternMatches` -> `computeCandleMetrics` -> every predicate).
 * That is the only way a fixture can catch a wrong threshold, a misclassified
 * body, or a bad trend sign.
 *
 * Because classification is relative to a 10-bar average body and trend is a
 * 10-period EMA, every fixture must be preceded by a `context(...)` warm-up run
 * of at least ~12 bars, or `smaBody`/`trend` come out degenerate (smaBody 0 =>
 * everything classifies 'Long', trend 0 => no reversal fires).
 */

/** One OHLC bar. date/volume are unused by the candle pipeline, so they are stubbed. */
export function bar(open: number, high: number, low: number, close: number): PriceBar {
  return { date: '', open, high, low, close, volume: 0 };
}

/**
 * A warm-up run of `bars` candles trending `dir`, ending just above/below
 * `end` (the price zone the pattern will occupy). Earlier bars sit further from
 * `end`, so the 10-period EMA lands on the correct side of the pattern and the
 * `trend` metric gets the right sign (down => trend<0, up => trend>0). `body`
 * seeds `smaBody`: keep pattern "long" bodies >~1.5x this and "doji" <~0.1x.
 */
export function context(
  dir: 'up' | 'down',
  end: number,
  { bars = 14, step = 2, body = 1 }: { bars?: number; step?: number; body?: number } = {},
): PriceBar[] {
  const out: PriceBar[] = [];
  const sign = dir === 'down' ? 1 : -1; // down => earlier prices are higher
  for (let i = bars; i >= 1; i--) {
    const base = end + sign * step * i;
    const open = dir === 'down' ? base + body / 2 : base - body / 2;
    const close = dir === 'down' ? base - body / 2 : base + body / 2;
    const high = Math.max(open, close) + body * 0.1;
    const low = Math.min(open, close) - body * 0.1;
    out.push(bar(open, high, low, close));
  }
  return out;
}

function summarize(matches: { name: string; endIndex: number }[]): string {
  return matches.length ? matches.map((m) => `${m.name}@${m.endIndex}`).join(', ') : 'none';
}

/** Asserts `name` matches with the pattern ending on the LAST bar of `bars`. */
export function expectPattern(name: string, bars: PriceBar[]): void {
  const matches = detectCandlePatternMatches(bars);
  const last = bars.length - 1;
  const hit = matches.some((m) => m.name === name && m.endIndex === last);
  expect(hit, `expected "${name}" to match ending at bar ${last}; got: ${summarize(matches)}`).toBe(
    true,
  );
}

/** Asserts `name` does NOT match ending on the last bar (near-miss / discrimination check). */
export function expectNoPattern(name: string, bars: PriceBar[]): void {
  const matches = detectCandlePatternMatches(bars);
  const last = bars.length - 1;
  const hit = matches.some((m) => m.name === name && m.endIndex === last);
  expect(
    hit,
    `expected "${name}" NOT to match at bar ${last}; matches: ${summarize(matches)}`,
  ).toBe(false);
}
