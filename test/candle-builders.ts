import { CandleMetrics } from '../src/indicators/kinds/candles/candle-metrics';
import { CandleAt } from '../src/indicators/kinds/candles/candle-pattern';

/**
 * A complete CandleMetrics with neutral defaults. Pattern predicates only read
 * the fields they name, so a test sets just those and lets the rest default.
 */
const NEUTRAL_METRICS: CandleMetrics = {
  color: 'White',
  open: 0,
  high: 0,
  low: 0,
  close: 0,
  body: 0,
  bodyTop: 0,
  bodyBottom: 0,
  bodyMid: 0,
  highLow: 0,
  upperShadow: 0,
  lowerShadow: 0,
  upperShadowHl: 0,
  lowerShadowHl: 0,
  bodyDay: 'Short',
  bodyType: 'Short',
  baseBody: '',
  trend: 0,
  smaBody: 0,
};

/** Builds one bar's metrics from neutral defaults plus the fields a test cares about. */
export function makeMetrics(overrides: Partial<CandleMetrics> = {}): CandleMetrics {
  return { ...NEUTRAL_METRICS, ...overrides };
}

/**
 * Builds the `at` accessor a pattern receives. `bars[0]` is the current bar, so
 * `at(0)` returns it, `at(1)` the previous bar, and so on — matching CandleAt.
 */
export function makeAt(bars: readonly CandleMetrics[]): CandleAt {
  return (daysAgo) => {
    const metrics = bars[daysAgo];
    if (metrics === undefined) {
      throw new RangeError(`No metrics at ${daysAgo} days ago (have ${bars.length} bars).`);
    }
    return metrics;
  };
}
