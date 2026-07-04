import { Indicator, singleSeries } from '../indicator';
import { columnValues } from '../../price/price-column';
import { PriceBar } from '../../price/price-bar';
import { NumericSeriesValue } from '../../price/series-value';
import { FibParams } from '../params';
import { fibLevels } from '../math/fibonacci';

/** Reduces any date string (ISO or YYYYMMDD) to its digits for order comparison. */
const dateDigits = (date: string): string => date.replace(/\D/g, '');

/**
 * Fibonacci retracement crossing signal. The 7 levels are fixed over the tested
 * window (0% = lowest LOW, 100% = highest HIGH), so the band spans the full price
 * range. The emitted series flags a CLOSE crossing any level, anticipating a
 * retracement in the opposite direction: `+1` when price fell through a level
 * (support → expect a bounce up), `-1` when it rose through one (resistance →
 * expect a pullback down), `0` otherwise.
 */
export const fib: Indicator<FibParams> = {
  kind: 'FIB',
  lookback: () => 0,
  compute: (bars, { startDate, endDate }) => {
    const closes = columnValues(bars, 'CLOSE');
    const lows = columnValues(bars, 'LOW');
    const highs = columnValues(bars, 'HIGH');
    const { low, high } = rangeWithinWindow(bars, lows, highs, startDate, endDate);
    const levels = fibLevels(low, high);
    return singleSeries('fib', crossingSignal(closes, levels));
  },
};

/**
 * The lowest LOW and highest HIGH inside [startDate, endDate]; falls back to the
 * full series when no bar falls in the window.
 */
function rangeWithinWindow(
  bars: readonly PriceBar[],
  lows: readonly number[],
  highs: readonly number[],
  startDate: string,
  endDate: string,
): { low: number; high: number } {
  const start = dateDigits(startDate);
  const end = dateDigits(endDate);
  const scopedLows: number[] = [];
  const scopedHighs: number[] = [];
  bars.forEach((bar, i) => {
    const day = dateDigits(bar.date);
    if (day >= start && day <= end) {
      scopedLows.push(lows[i]!);
      scopedHighs.push(highs[i]!);
    }
  });
  return {
    low: Math.min(...(scopedLows.length > 0 ? scopedLows : lows)),
    high: Math.max(...(scopedHighs.length > 0 ? scopedHighs : highs)),
  };
}

/** Per bar: +1 when CLOSE fell through any level, -1 when it rose through one, else 0. */
function crossingSignal(
  closes: readonly number[],
  levels: readonly number[],
): NumericSeriesValue[] {
  return closes.map((current, i) =>
    i === 0 ? 0 : crossingDirection(closes[i - 1]!, current, levels),
  );
}

/** +1 when CLOSE fell through any level, -1 when it rose through one, else 0. */
function crossingDirection(previous: number, current: number, levels: readonly number[]): number {
  for (const level of levels) {
    if (previous < level && current >= level) {
      return -1;
    }
    if (previous > level && current <= level) {
      return 1;
    }
  }
  return 0;
}
