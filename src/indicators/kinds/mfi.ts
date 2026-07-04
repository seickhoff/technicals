import { Indicator, singleSeries } from '../indicator';
import { NumericSeriesValue } from '../../price/series-value';
import { MfiParams } from '../params';

const MFI_SCALE = 100;

/** Money Flow Index: a volume-weighted oscillator over the typical price. */
export const mfi: Indicator<MfiParams> = {
  kind: 'MFI',
  lookback: ({ period }) => period,
  compute: (bars, { period }) => {
    const out: NumericSeriesValue[] = new Array<NumericSeriesValue>(bars.length).fill(undefined);
    const positiveFlow: number[] = [];
    const negativeFlow: number[] = [];
    let previousTypical = 0;

    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i]!;
      const typical = (bar.high + bar.low + bar.close) / 3;
      const moneyFlow = typical * bar.volume;

      positiveFlow.push(typical > previousTypical ? moneyFlow : 0);
      negativeFlow.push(typical > previousTypical ? 0 : moneyFlow);
      if (positiveFlow.length > period) {
        positiveFlow.shift();
        negativeFlow.shift();
      }

      if (i >= period - 1) {
        const positive = sum(positiveFlow);
        const negative = sum(negativeFlow);
        out[i] = negative === 0 ? MFI_SCALE : MFI_SCALE - MFI_SCALE / (1 + positive / negative);
      }

      previousTypical = typical;
    }

    return singleSeries('mfi', out);
  },
};

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
