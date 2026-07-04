/**
 * Tunable thresholds for candlestick classification and pattern recognition.
 *
 * These mirror the user-configurable parameters described in Gregory Morris,
 * *Candlestick Charting Explained* (3rd ed.), Chapter 6 ("The Philosophy behind
 * Candle Pattern Identification"). Morris treats every one of these as a setting,
 * not a fixed rule, so they are exposed here and can be overridden when candle
 * metrics or pattern detection are invoked.
 *
 * `DEFAULT_CANDLE_CONFIG` uses Morris's own recommended/illustrative values.
 * `LEGACY_CANDLE_CONFIG` reproduces this project's original hand-tuned values —
 * pass it to restore the pre-Morris behavior (see the candles README).
 */
export interface CandleConfig {
  /**
   * Window (in days) for both the trend EMA (of closes) and the average-body
   * baseline used to size long/short days. Morris: 10-day exponential average.
   */
  period: number;

  /**
   * Long day: `body >= longBodyRatio * avgBody`, where avgBody is the mean body
   * over the last `period` days. Morris's illustrative value is 1.30 (a long day
   * is 30% larger than the recent average body). The original project value was
   * 0.75 (75% of the average — far more permissive).
   */
  longBodyRatio: number;

  /**
   * Doji day: `body <= dojiMaxPctOfRange * (high - low)`. Morris defines a doji
   * as a body that is a tiny fraction (1–3%) of the day's own high-low range.
   * `null` disables this rule.
   */
  dojiMaxPctOfRange: number | null;

  /**
   * Legacy doji rule: `body <= dojiMaxPctOfAvgBody * avgBody` (body measured
   * against the recent average body rather than the day's range). Original
   * project value 0.10. `null` (the Morris default) turns it off.
   */
  dojiMaxPctOfAvgBody: number | null;

  /**
   * Legacy doji rule: a shadow longer than this percentage of the body forces a
   * Doji classification (a crude long-legged-doji proxy). Original value 490.
   * `null` (the Morris default) turns it off — the range-based rule above covers
   * long-legged dojis directly.
   */
  dojiMaxShadowPctOfBody: number | null;

  /**
   * Spinning Top: a short-bodied day whose upper AND lower shadows each exceed
   * this percentage of the body. Default 100 (both shadows longer than the body).
   */
  spinningTopMinShadowPctOfBody: number;

  /**
   * Tolerance for "equal" prices in patterns that require equality (Meeting
   * Lines, Matching High/Low, Separating Lines, On-Neck). Two prices are treated
   * as equal when they differ by no more than `equalTolerancePct` of the bar's
   * high-low RANGE (not of price — so 0.02 on a bar with a $2 range is ~$0.04,
   * not a real gap). Morris (Ch. 6, "Equal Values") ties this to the Doji rule:
   * a tolerance of ~1–3% of the day's range, and warns that a literal definition
   * "will restrict rather than enhance the pattern concept." Default 0.02 is the
   * midpoint of his 1–3% band; 0.01 hugs the tight end. The original project used
   * 0 (exact `===`), which almost never matches real data.
   */
  equalTolerancePct: number;

  /**
   * Hammer / Hanging Man (umbrella): lower shadow >= this percentage of the body.
   * Morris: 200 (the lower shadow is at least twice the body).
   */
  hammerLowerShadowMinPctOfBody: number;

  /**
   * Hammer / Shooting Star / Inverted Hammer (umbrella): the "short" opposite
   * shadow may be at most this percentage of the high-low range. Morris: 10.
   */
  umbrellaShortShadowMaxPctOfRange: number;

  /**
   * Shooting Star: upper shadow >= this percentage of the body. Morris: 300 (at
   * least three times the body).
   */
  shootingStarUpperShadowMinPctOfBody: number;

  /**
   * Inverted Hammer: upper shadow must be within [min, max] percent of the body.
   * Morris says the upper shadow is "no more than two times as long as the body"
   * (max 200) and gives no lower bound (min 0). The original project used a
   * min of 50 and, through a metric bug, effectively no max (`null`).
   */
  invertedHammerUpperShadowMinPctOfBody: number;
  invertedHammerUpperShadowMaxPctOfBody: number | null;
}

/** Morris's recommended/illustrative values — the default behavior. */
export const DEFAULT_CANDLE_CONFIG: CandleConfig = {
  period: 10,
  longBodyRatio: 1.3,
  dojiMaxPctOfRange: 0.03,
  dojiMaxPctOfAvgBody: null,
  dojiMaxShadowPctOfBody: null,
  spinningTopMinShadowPctOfBody: 100,
  equalTolerancePct: 0.02,
  hammerLowerShadowMinPctOfBody: 200,
  umbrellaShortShadowMaxPctOfRange: 10,
  shootingStarUpperShadowMinPctOfBody: 300,
  invertedHammerUpperShadowMinPctOfBody: 0,
  invertedHammerUpperShadowMaxPctOfBody: 200,
};

/**
 * This project's original hand-tuned values, before defaulting to Morris. Pass
 * to `computeCandleMetrics` / `detectCandlePatternMatches` to restore the old
 * behavior. See the candles README for details on each override.
 */
export const LEGACY_CANDLE_CONFIG: CandleConfig = {
  period: 10,
  longBodyRatio: 0.75,
  dojiMaxPctOfRange: null,
  dojiMaxPctOfAvgBody: 0.1,
  dojiMaxShadowPctOfBody: 490,
  spinningTopMinShadowPctOfBody: 100,
  equalTolerancePct: 0,
  hammerLowerShadowMinPctOfBody: 200,
  umbrellaShortShadowMaxPctOfRange: 10,
  shootingStarUpperShadowMinPctOfBody: 300,
  invertedHammerUpperShadowMinPctOfBody: 50,
  invertedHammerUpperShadowMaxPctOfBody: null,
};
