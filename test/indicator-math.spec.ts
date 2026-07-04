import { describe, expect, it } from 'vitest';
import { emaSeries, rollingMean } from '../src/indicators/math/moving-average';
import { wilderRsi } from '../src/indicators/math/wilder';
import { computeDirectional, trueRange } from '../src/indicators/math/directional';

describe('rollingMean', () => {
  it('is undefined until the first full window, then the rolling mean', () => {
    expect(rollingMean([1, 2, 3, 10, 4], 3)).toEqual([undefined, undefined, 2, 5, 17 / 3]);
  });

  it('with period 1 returns each value unchanged', () => {
    expect(rollingMean([5, 6, 7], 1)).toEqual([5, 6, 7]);
  });

  it('defines only the last cell when the period equals the length', () => {
    expect(rollingMean([2, 4, 6], 3)).toEqual([undefined, undefined, 4]);
  });

  it('is all undefined when the period exceeds the length', () => {
    expect(rollingMean([1, 2], 3)).toEqual([undefined, undefined]);
  });

  it('returns an empty series for an empty input', () => {
    expect(rollingMean([], 3)).toEqual([]);
  });
});

describe('emaSeries', () => {
  it('seeds with the SMA of the first window then applies k = 2/(n+1)', () => {
    expect(emaSeries([1, 2, 3, 10, 4], 3)).toEqual([undefined, undefined, 2, 6, 5]);
  });

  it('skips leading undefined cells before seeding (e.g. a MACD line)', () => {
    expect(emaSeries([undefined, undefined, 2, 4, 6], 2)).toEqual([
      undefined,
      undefined,
      undefined,
      3,
      5,
    ]);
  });

  it('is all undefined when there is no full window of defined values', () => {
    expect(emaSeries([undefined, 2, 4], 3)).toEqual([undefined, undefined, undefined]);
    expect(emaSeries([], 3)).toEqual([]);
  });
});

describe('trueRange', () => {
  it('is the bar range when it dominates the gaps to the prior close', () => {
    expect(trueRange(10, 5, 7)).toBe(5);
  });

  it('uses the gap up to the prior close when the bar gapped down', () => {
    expect(trueRange(10, 5, 12)).toBe(7);
  });

  it('uses the gap down to the prior close when the bar gapped up', () => {
    expect(trueRange(10, 5, 3)).toBe(7);
  });
});

describe('computeDirectional', () => {
  it('emits +DI/-DI from index `period` and ADX from index 2*period - 1', () => {
    const highs = [2, 3, 4, 5, 6, 7];
    const lows = highs.map((h) => h - 1);
    const closes = highs.map((h) => h - 0.5);
    const { adx, plusDi, minusDi } = computeDirectional(highs, lows, closes, 2);

    expect(plusDi[1]).toBeUndefined();
    expect(typeof plusDi[2]).toBe('number');
    expect(typeof minusDi[2]).toBe('number');
    expect(adx[2]).toBeUndefined();
    expect(typeof adx[3]).toBe('number');
  });

  it('matches hand-computed Wilder values for a steady uptrend', () => {
    // Each bar rises by 1 with a constant range of 2, so every step has
    // TR = 2, +DM = 1, -DM = 0. Hence +DI = 100*1/2 = 50, -DI = 0, DX = 100;
    // ADX seeds at index 3 with DX/period = 50, then index 4 = (1*50 + 100)/2 = 75.
    const highs = [10, 11, 12, 13, 14];
    const lows = highs.map((h) => h - 2);
    const closes = highs.map((h) => h - 1);
    const { adx, plusDi, minusDi } = computeDirectional(highs, lows, closes, 2);

    expect(plusDi).toEqual([undefined, undefined, 50, 50, 50]);
    expect(minusDi).toEqual([undefined, undefined, 0, 0, 0]);
    expect(adx).toEqual([undefined, undefined, undefined, 50, 75]);
  });

  it('reports -DI above +DI for a steady downtrend', () => {
    const highs = [7, 6, 5, 4, 3, 2];
    const lows = highs.map((h) => h - 1);
    const closes = highs.map((h) => h - 0.5);
    const { plusDi, minusDi } = computeDirectional(highs, lows, closes, 2);

    expect(minusDi[5] as number).toBeGreaterThan(plusDi[5] as number);
  });

  it('flattens directional movement and ADX to zero when prices do not move', () => {
    const highs = [10, 10, 10, 10, 10];
    const lows = [8, 8, 8, 8, 8];
    const closes = [9, 9, 9, 9, 9];
    const { adx, plusDi, minusDi } = computeDirectional(highs, lows, closes, 2);

    expect(plusDi[4]).toBe(0);
    expect(minusDi[4]).toBe(0);
    expect(adx[4]).toBe(0);
  });
});

describe('wilderRsi', () => {
  it('matches hand-computed values', () => {
    expect(wilderRsi([1, 2, 1, 2], 2)).toEqual([undefined, undefined, 50, 75]);
  });

  it('is 100 for a monotonic rise and 0 for a monotonic decline', () => {
    expect(wilderRsi([1, 2, 3, 4], 2)).toEqual([undefined, undefined, 100, 100]);
    expect(wilderRsi([4, 3, 2, 1], 2)).toEqual([undefined, undefined, 0, 0]);
  });

  it('needs more than `period` closes before its first value', () => {
    expect(wilderRsi([1, 2, 3], 3)).toEqual([undefined, undefined, undefined]);
  });
});
