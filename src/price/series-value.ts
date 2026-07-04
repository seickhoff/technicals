/**
 * A single cell in an aligned series. Indicators emit `number | undefined`
 * (undefined = warm-up, not yet computable); the DATE column emits strings.
 * `undefined` is a deliberate, type-visible sentinel rather than NaN or 0.
 */
export type SeriesValue = number | string | undefined;

/** The narrower value an indicator series may hold. */
export type NumericSeriesValue = number | undefined;

/** True when a cell holds a real (non-warm-up) value. */
export function isDefined(value: SeriesValue): value is number | string {
  return value !== undefined;
}
