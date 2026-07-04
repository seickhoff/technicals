import { Indicator, multiSeries } from '../indicator';
import { columnValues } from '../../price/price-column';
import { NumericSeriesValue } from '../../price/series-value';
import { BollingerParams } from '../params';

/** Bollinger Bands: SMA middle band ± multiplier × population standard deviation. */
export const bollinger: Indicator<BollingerParams> = {
  kind: 'BOLLINGER',
  lookback: ({ period }) => period,
  compute: (bars, { period, multiplier }) => {
    const close = columnValues(bars, 'CLOSE');
    const mid: NumericSeriesValue[] = new Array<NumericSeriesValue>(close.length).fill(undefined);
    const upper: NumericSeriesValue[] = new Array<NumericSeriesValue>(close.length).fill(undefined);
    const lower: NumericSeriesValue[] = new Array<NumericSeriesValue>(close.length).fill(undefined);

    for (let i = period - 1; i < close.length; i++) {
      const window = close.slice(i - period + 1, i + 1);
      const mean = window.reduce((sum, value) => sum + value, 0) / period;
      const variance = window.reduce((sum, value) => sum + (value - mean) ** 2, 0) / period;
      const deviation = Math.sqrt(variance);
      mid[i] = mean;
      upper[i] = mean + multiplier * deviation;
      lower[i] = mean - multiplier * deviation;
    }

    return multiSeries([
      ['mid', mid],
      ['upper', upper],
      ['lower', lower],
    ]);
  },
};
