import { Indicator, multiSeries } from '../indicator';
import { columnValues } from '../../price/price-column';
import { NumericSeriesValue } from '../../price/series-value';
import { PriceChannelParams } from '../params';

/** Donchian-style price channel: highest high and lowest low over the period. */
export const priceChannel: Indicator<PriceChannelParams> = {
  kind: 'PRICECHANNEL',
  lookback: ({ period }) => period,
  compute: (bars, { period, highColumn, lowColumn }) => {
    const highs = columnValues(bars, highColumn);
    const lows = columnValues(bars, lowColumn);
    const channelHigh: NumericSeriesValue[] = new Array<NumericSeriesValue>(highs.length).fill(
      undefined,
    );
    const channelLow: NumericSeriesValue[] = new Array<NumericSeriesValue>(lows.length).fill(
      undefined,
    );

    for (let i = period - 1; i < highs.length; i++) {
      channelHigh[i] = Math.max(...highs.slice(i - period + 1, i + 1));
      channelLow[i] = Math.min(...lows.slice(i - period + 1, i + 1));
    }

    return multiSeries([
      ['high', channelHigh],
      ['low', channelLow],
    ]);
  },
};
