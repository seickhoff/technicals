import { Indicator, singleSeries } from '../indicator';
import { columnValues } from '../../price/price-column';
import { wilderRsi } from '../math/wilder';
import { RsiParams } from '../params';

export const RSI_OUTPUT = 'rsi';

/** Relative Strength Index over CLOSE (Wilder's smoothing). */
export const rsi: Indicator<RsiParams> = {
  kind: 'RSI',
  lookback: ({ period }) => period,
  compute: (bars, { period }) =>
    singleSeries(RSI_OUTPUT, wilderRsi(columnValues(bars, 'CLOSE'), period)),
};
