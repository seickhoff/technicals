import { Indicator, singleSeries } from '../indicator';
import { columnValues } from '../../price/price-column';
import { rollingMean } from '../math/moving-average';
import { SmaParams } from '../params';

export const SMA_OUTPUT = 'sma';

/** Simple Moving Average over a chosen price column. */
export const sma: Indicator<SmaParams> = {
  kind: 'SMA',
  lookback: ({ period }) => period,
  compute: (bars, { column, period }) =>
    singleSeries(SMA_OUTPUT, rollingMean(columnValues(bars, column), period)),
};
