import { NumericSeriesValue } from '../../price/series-value';

const DI_SCALE = 100;

export interface DirectionalSeries {
  adx: NumericSeriesValue[];
  plusDi: NumericSeriesValue[];
  minusDi: NumericSeriesValue[];
}

/** True Range: the greatest of today's range and the gaps to yesterday's close. */
export function trueRange(high: number, low: number, previousClose: number): number {
  return Math.max(
    Math.abs(high - low),
    Math.abs(high - previousClose),
    Math.abs(previousClose - low),
  );
}

/**
 * Wilder's Average Directional Index with +DI and -DI. +DI/-DI appear from index
 * `period`; ADX appears from index `2*period - 1`. Uses Wilder smoothing and
 * standard directional-movement branch selection.
 */
export function computeDirectional(
  highs: readonly number[],
  lows: readonly number[],
  closes: readonly number[],
  period: number,
): DirectionalSeries {
  const length = highs.length;
  const adx: NumericSeriesValue[] = new Array<NumericSeriesValue>(length).fill(undefined);
  const plusDi: NumericSeriesValue[] = new Array<NumericSeriesValue>(length).fill(undefined);
  const minusDi: NumericSeriesValue[] = new Array<NumericSeriesValue>(length).fill(undefined);

  let trSum = 0;
  let dmPlusSum = 0;
  let dmMinusSum = 0;
  let smoothedTr = 0;
  let smoothedDmPlus = 0;
  let smoothedDmMinus = 0;
  let dxSum = 0;
  let adxValue: number | undefined;

  for (let i = 0; i < length; i++) {
    const { trueRangeToday, dmPlus, dmMinus } = directionalMovement(highs, lows, closes, i);

    if (i >= 1 && i <= period) {
      trSum += trueRangeToday;
      dmPlusSum += dmPlus;
      dmMinusSum += dmMinus;
    }
    if (i === period) {
      smoothedTr = trSum / period;
      smoothedDmPlus = dmPlusSum / period;
      smoothedDmMinus = dmMinusSum / period;
    } else if (i > period) {
      smoothedTr = ((period - 1) * smoothedTr + trueRangeToday) / period;
      smoothedDmPlus = ((period - 1) * smoothedDmPlus + dmPlus) / period;
      smoothedDmMinus = ((period - 1) * smoothedDmMinus + dmMinus) / period;
    }

    let dx = 0;
    if (i >= period) {
      const plus = smoothedTr === 0 ? 0 : (DI_SCALE * smoothedDmPlus) / smoothedTr;
      const minus = smoothedTr === 0 ? 0 : (DI_SCALE * smoothedDmMinus) / smoothedTr;
      plusDi[i] = plus;
      minusDi[i] = minus;
      const sum = plus + minus;
      dx = sum === 0 ? 0 : (DI_SCALE * Math.abs(plus - minus)) / sum;
    }

    if (i >= period && i < 2 * period - 1) {
      dxSum += dx;
    } else if (i === 2 * period - 1) {
      adxValue = dxSum / period;
    } else if (i >= 2 * period) {
      adxValue = ((period - 1) * (adxValue ?? 0) + dx) / period;
    }
    if (adxValue !== undefined) {
      adx[i] = adxValue;
    }
  }

  return { adx, plusDi, minusDi };
}

function directionalMovement(
  highs: readonly number[],
  lows: readonly number[],
  closes: readonly number[],
  i: number,
): { trueRangeToday: number; dmPlus: number; dmMinus: number } {
  if (i === 0) {
    return { trueRangeToday: 0, dmPlus: 0, dmMinus: 0 };
  }
  const upMove = highs[i]! - highs[i - 1]!;
  const downMove = lows[i - 1]! - lows[i]!;

  let dmPlus = 0;
  let dmMinus = 0;
  if (upMove < 0 && downMove < 0) {
    dmPlus = 0;
    dmMinus = 0;
  } else if (upMove > downMove) {
    dmPlus = upMove;
  } else {
    dmMinus = downMove;
  }

  return { trueRangeToday: trueRange(highs[i]!, lows[i]!, closes[i - 1]!), dmPlus, dmMinus };
}
