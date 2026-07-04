import { PriceBar } from '../../../price/price-bar';
import { Indicator, multiSeries } from '../../indicator';
import { SeriesValue } from '../../../price/series-value';
import { CandleParams } from '../../params';
import { CandleMetrics, computeCandleMetrics } from './candle-metrics';
import { CandleAt } from './candle-pattern';
import { CandleConfig, DEFAULT_CANDLE_CONFIG } from './candle-config';
import { ALL_CANDLE_PATTERNS } from './patterns';

const CANDLE_LOOKBACK = 10;

/** One detected candlestick pattern occurrence, ending at bar `endIndex` and spanning `length` bars. */
export interface CandlePatternMatch {
  name: string;
  length: number;
  endIndex: number;
}

/**
 * Candlestick indicator. Outputs three aligned series: `color`, `trend`, and a
 * comma-joined `patterns` string per bar (the set of matched pattern tags).
 */
export const candle: Indicator<CandleParams> = {
  kind: 'CANDLE',
  lookback: () => CANDLE_LOOKBACK,
  compute: (bars) => {
    const metrics = computeCandleMetrics(bars);
    const color: SeriesValue[] = metrics.map((m) => m.color);
    const trend: SeriesValue[] = metrics.map((m) => m.trend);
    const patterns: SeriesValue[] = patternNamesByBar(metrics, DEFAULT_CANDLE_CONFIG);
    return multiSeries([
      ['color', color],
      ['trend', trend],
      ['patterns', patterns],
    ]);
  },
};

/** Every pattern occurrence across `bars`, in (bar, detection) order. */
export function detectCandlePatternMatches(
  bars: readonly PriceBar[],
  config: CandleConfig = DEFAULT_CANDLE_CONFIG,
): CandlePatternMatch[] {
  return matchesFromMetrics(computeCandleMetrics(bars, config), config);
}

function matchesFromMetrics(metrics: CandleMetrics[], config: CandleConfig): CandlePatternMatch[] {
  const matches: CandlePatternMatch[] = [];
  for (let index = 0; index < metrics.length; index++) {
    const at: CandleAt = (daysAgo) => metrics[index - daysAgo]!;
    for (const pattern of ALL_CANDLE_PATTERNS) {
      if (index >= pattern.length - 1 && pattern.matches(at, config)) {
        matches.push({ name: pattern.name, length: pattern.length, endIndex: index });
      }
    }
  }
  return matches;
}

/** The comma-joined pattern names matching each bar (empty string where none match). */
function patternNamesByBar(metrics: CandleMetrics[], config: CandleConfig): string[] {
  const byBar: string[][] = metrics.map(() => []);
  for (const match of matchesFromMetrics(metrics, config)) {
    byBar[match.endIndex]!.push(match.name);
  }
  return byBar.map((names) => names.join(', '));
}
