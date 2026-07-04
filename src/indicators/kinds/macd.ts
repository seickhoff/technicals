import { Indicator, multiSeries } from '../indicator';
import { columnValues } from '../../price/price-column';
import { NumericSeriesValue } from '../../price/series-value';
import { emaSeries } from '../math/moving-average';
import { MacdParams } from '../params';

/** MACD line (fast EMA − slow EMA), its signal EMA, and the histogram. */
export const macd: Indicator<MacdParams> = {
  kind: 'MACD',
  lookback: ({ fast, slow, signal }) => fast + slow + signal,
  compute: (bars, { fast, slow, signal }) => {
    const close = columnValues(bars, 'CLOSE');
    const fastEma = emaSeries(close, fast);
    const slowEma = emaSeries(close, slow);
    const macdLine = subtract(fastEma, slowEma);
    const signalLine = emaSeries(macdLine, signal);
    const histogram = subtract(macdLine, signalLine);
    return multiSeries([
      ['macd', macdLine],
      ['signal', signalLine],
      ['histogram', histogram],
    ]);
  },
};

function subtract(
  left: readonly NumericSeriesValue[],
  right: readonly NumericSeriesValue[],
): NumericSeriesValue[] {
  return left.map((value, i) => {
    const other = right[i];
    return value === undefined || other === undefined ? undefined : value - other;
  });
}
