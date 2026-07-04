import { CandleMetrics } from './candle-metrics';
import { CandleConfig } from './candle-config';

/**
 * Accessor over recent candle metrics. `at(0)` is the current bar, `at(1)` the
 * previous bar, etc. (n bars ago).
 */
export type CandleAt = (daysAgo: number) => CandleMetrics;

/**
 * A named candlestick pattern. `length` is how many bars it inspects (1–5); the
 * runner only calls `matches` once that many bars are available. `name` carries
 * the reversal/continuation tag (e.g. "Hammer R+"), which rules match against.
 *
 * `matches` receives the active `CandleConfig` as a second argument; patterns
 * that use a tunable threshold (umbrella shadows, the "equal price" tolerance)
 * read it, and the rest simply ignore it.
 */
export interface CandlePattern {
  name: string;
  length: number;
  matches: (at: CandleAt, config?: CandleConfig) => boolean;
}

/**
 * Whether two prices are equal within the configured tolerance (a fraction of
 * `range`, the relevant bar's high-low span). With `equalTolerancePct: 0` this
 * is exact equality. See Morris, Ch. 6, "Equal Values."
 */
export function pricesEqual(a: number, b: number, range: number, config: CandleConfig): boolean {
  return Math.abs(a - b) <= config.equalTolerancePct * range;
}
