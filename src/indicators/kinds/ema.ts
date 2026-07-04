import { Indicator, singleSeries } from '../indicator';
import { columnValues } from '../../price/price-column';
import { emaSeries } from '../math/moving-average';
import { EmaParams } from '../params';

export const EMA_OUTPUT = 'ema';

/** Exponential Moving Average over a chosen price column. */
export const ema: Indicator<EmaParams> = {
  kind: 'EMA',
  lookback: ({ period }) => period,
  compute: (bars, { column, period }) =>
    singleSeries(EMA_OUTPUT, emaSeries(columnValues(bars, column), period)),
};
