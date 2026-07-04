import { PriceBar } from './price-bar';

/** The numeric price columns a strategy can read or compute indicators from. */
export type PriceColumn = 'OPEN' | 'HIGH' | 'LOW' | 'CLOSE' | 'VOLUME';

export const PRICE_COLUMNS: readonly PriceColumn[] = ['OPEN', 'HIGH', 'LOW', 'CLOSE', 'VOLUME'];

/** The closing-price column key, named so callers don't sprinkle the bare string. */
export const CLOSE_COLUMN: PriceColumn = 'CLOSE';

/** The DATE column is a string, handled separately from the numeric columns. */
export const DATE_COLUMN = 'DATE';

/** All column keys usable as `label` in a rule, including DATE. */
export const ALL_COLUMNS: readonly string[] = [DATE_COLUMN, ...PRICE_COLUMNS];

export function isPriceColumn(value: string): value is PriceColumn {
  return (PRICE_COLUMNS as readonly string[]).includes(value);
}

/** Reads one numeric column off a bar. */
export function readColumn(bar: PriceBar, column: PriceColumn): number {
  switch (column) {
    case 'OPEN':
      return bar.open;
    case 'HIGH':
      return bar.high;
    case 'LOW':
      return bar.low;
    case 'CLOSE':
      return bar.close;
    case 'VOLUME':
      return bar.volume;
  }
}

/** Extracts a full numeric series for one column across all bars. */
export function columnValues(bars: readonly PriceBar[], column: PriceColumn): number[] {
  return bars.map((bar) => readColumn(bar, column));
}
