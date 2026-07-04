import { NumericSeriesValue } from '../../price/series-value';

const EMA_SMOOTHING_NUMERATOR = 2;

/** Simple moving average. Undefined until the first full window (index period-1). */
export function rollingMean(values: readonly number[], period: number): NumericSeriesValue[] {
  const out: NumericSeriesValue[] = new Array(values.length).fill(undefined);
  let windowSum = 0;
  for (let i = 0; i < values.length; i++) {
    windowSum += values[i]!;
    if (i >= period) {
      windowSum -= values[i - period]!;
    }
    if (i >= period - 1) {
      out[i] = windowSum / period;
    }
  }
  return out;
}

/**
 * Exponential moving average seeded by the SMA of the first full window, using
 * k = 2 / (period + 1). Accepts series with leading `undefined` cells (e.g. the
 * MACD line) and only begins once `period` consecutive defined values exist.
 */
export function emaSeries(
  values: readonly NumericSeriesValue[],
  period: number,
): NumericSeriesValue[] {
  const out: NumericSeriesValue[] = new Array(values.length).fill(undefined);
  const firstDefined = values.findIndex((value) => value !== undefined);
  if (firstDefined < 0 || firstDefined + period > values.length) {
    return out;
  }

  let runningEma = 0;
  for (let i = firstDefined; i < firstDefined + period; i++) {
    runningEma += values[i] as number;
  }
  runningEma /= period;

  const seedIndex = firstDefined + period - 1;
  out[seedIndex] = runningEma;

  const k = EMA_SMOOTHING_NUMERATOR / (period + 1);
  for (let i = seedIndex + 1; i < values.length; i++) {
    const value = values[i];
    if (value === undefined) {
      continue;
    }
    runningEma = (value - runningEma) * k + runningEma;
    out[i] = runningEma;
  }
  return out;
}
