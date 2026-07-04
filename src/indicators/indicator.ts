import { PriceBar } from '../price/price-bar';
import { SeriesValue } from '../price/series-value';
import { UnknownLabelError } from '../shared/domain-error';

/** A single named, index-aligned output series of an indicator. */
export interface IndicatorSeries {
  readonly label: string;
  readonly values: readonly SeriesValue[];
}

/** The result of computing an indicator: one or more named series. */
export interface IndicatorResult {
  readonly labels: readonly string[];
  get(label: string): IndicatorSeries;
}

/**
 * A pure technical indicator. Adding one means adding a module and registering
 * it — never editing a switch (Open/Closed Principle). Each indicator emits
 * series under stable internal labels (e.g. ADX → `adx`, `+di`, `-di`); the
 * caller maps those to the user's declared labels by position.
 */
export interface Indicator<P> {
  readonly kind: string;
  /** The largest number of leading bars this indicator consumes before its first value. */
  lookback(params: P): number;
  compute(bars: readonly PriceBar[], params: P): IndicatorResult;
}

type LabeledValues = readonly [label: string, values: readonly SeriesValue[]];

function makeIndicatorResult(entries: readonly LabeledValues[]): IndicatorResult {
  const byLabel = new Map<string, readonly SeriesValue[]>(entries);
  return {
    labels: entries.map(([label]) => label),
    get(label) {
      const values = byLabel.get(label);
      if (!values) {
        throw new UnknownLabelError(label, `Indicator has no output series "${label}".`);
      }
      return { label, values };
    },
  };
}

/** Builds a single-output result. */
export function singleSeries(label: string, values: readonly SeriesValue[]): IndicatorResult {
  return makeIndicatorResult([[label, values]]);
}

/** Builds a multi-output result; label order is the canonical output order. */
export function multiSeries(entries: readonly LabeledValues[]): IndicatorResult {
  return makeIndicatorResult(entries);
}
