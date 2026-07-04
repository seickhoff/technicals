import { NumericSeriesValue } from '../../price/series-value';

const RSI_SCALE = 100;

/**
 * Wilder's Relative Strength Index. The first value appears at index `period`
 * (it needs `period` price changes); earlier cells are undefined.
 */
export function wilderRsi(closes: readonly number[], period: number): NumericSeriesValue[] {
  const out: NumericSeriesValue[] = new Array<NumericSeriesValue>(closes.length).fill(undefined);
  if (closes.length <= period) {
    return out;
  }

  let gainSum = 0;
  let lossSum = 0;
  for (let i = 1; i <= period; i++) {
    const change = closes[i]! - closes[i - 1]!;
    if (change > 0) {
      gainSum += change;
    } else {
      lossSum += Math.abs(change);
    }
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  out[period] = rsiFrom(avgGain, avgLoss);

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i]! - closes[i - 1]!;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = rsiFrom(avgGain, avgLoss);
  }

  return out;
}

function rsiFrom(avgGain: number, avgLoss: number): number {
  if (avgLoss === 0) {
    return RSI_SCALE;
  }
  return RSI_SCALE - RSI_SCALE / (avgGain / avgLoss + 1);
}
