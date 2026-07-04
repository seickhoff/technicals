import { Indicator, multiSeries } from '../indicator';
import { columnValues } from '../../price/price-column';
import { computeDirectional } from '../math/directional';
import { AdxParams } from '../params';

/** Average Directional Index with +DI and -DI. Output order: adx, +di, -di. */
export const adx: Indicator<AdxParams> = {
  kind: 'ADX',
  // ADX needs ~2*period bars before its first value; fetch enough warm-up to be ready.
  lookback: ({ period }) => 2 * period,
  compute: (bars, { period }) => {
    const directional = computeDirectional(
      columnValues(bars, 'HIGH'),
      columnValues(bars, 'LOW'),
      columnValues(bars, 'CLOSE'),
      period,
    );
    return multiSeries([
      ['adx', directional.adx],
      ['+di', directional.plusDi],
      ['-di', directional.minusDi],
    ]);
  },
};
