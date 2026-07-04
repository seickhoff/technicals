import { PriceBar } from '../src/price/price-bar';

/** Shifts an ISO `yyyy-mm-dd` date by whole days (UTC), matching the app's date math. */
function shiftIsoByDays(iso: string, deltaDays: number): string {
  const [year, month, day] = iso.split('-').map(Number) as [number, number, number];
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + deltaDays);
  return date.toISOString().slice(0, 10);
}

/** Builds a bar with high=low=close by default, so the next-day midpoint equals the close. */
export function makeBar(date: string, close: number, overrides: Partial<PriceBar> = {}): PriceBar {
  return { date, open: close, high: close, low: close, close, volume: 1000, ...overrides };
}

/** Turns a list of closes into consecutive-day bars starting at `startIso`. */
export function closesToBars(startIso: string, closes: number[]): PriceBar[] {
  return closes.map((close, index) => makeBar(shiftIsoByDays(startIso, index), close));
}
