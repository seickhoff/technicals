/**
 * One daily OHLCV bar, already adjusted for splits and dividends.
 * `date` is an ISO `yyyy-mm-dd` string and is the alignment key for all series.
 */
export interface PriceBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
