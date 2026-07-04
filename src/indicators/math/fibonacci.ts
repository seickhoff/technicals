/**
 * Fibonacci retracement geometry. The 0% line sits at the lowest value and the
 * 100% line at the highest; the interior ratios are the classic retracement
 * levels. Shared so the indicator and the chart draw identical lines.
 */
const FIB_RATIOS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1] as const;

/** The 7 retracement price levels spanning `low` (0%) to `high` (100%). */
export function fibLevels(low: number, high: number): number[] {
  return FIB_RATIOS.map((ratio) => low + ratio * (high - low));
}
