import { PriceBar } from './price-bar';
import { SeriesValue } from './series-value';
import { SeriesLengthMismatchError, UnknownLabelError } from '../shared/domain-error';

/**
 * The price bars plus every named, index-aligned series (price columns, DATE,
 * and each indicator label). Every series is guaranteed to have exactly one
 * value per bar; the constructor enforces that invariant.
 */
export class ComputedSeries {
  readonly bars: readonly PriceBar[];
  private readonly columns: ReadonlyMap<string, readonly SeriesValue[]>;

  constructor(bars: readonly PriceBar[], columns: ReadonlyMap<string, readonly SeriesValue[]>) {
    for (const [key, values] of columns) {
      if (values.length !== bars.length) {
        throw new SeriesLengthMismatchError(key, values.length, bars.length);
      }
    }
    this.bars = bars;
    this.columns = columns;
  }

  get length(): number {
    return this.bars.length;
  }

  /** The value of `key` at absolute bar `index`, or undefined when out of bounds. */
  valueAt(key: string, index: number): SeriesValue {
    const series = this.columns.get(key);
    if (!series) {
      throw new UnknownLabelError(key);
    }
    return series[index];
  }
}
