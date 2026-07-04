import { describe, expect, it } from 'vitest';
import { createDefaultIndicatorRegistry, fibLevels } from '../src/index';
import { closesToBars } from './helpers';

const registry = createDefaultIndicatorRegistry();

function compute(
  kind: string,
  params: unknown,
  closes: number[],
): readonly (number | string | undefined)[] {
  const bars = closesToBars('2020-01-01', closes);
  const result = registry.resolve(kind).compute(bars, params);
  return result.get(result.labels[0]!).values;
}

describe('SMA', () => {
  it('is undefined until the first full window, then the rolling mean', () => {
    const values = compute('SMA', { column: 'CLOSE', period: 3 }, [1, 2, 3, 10, 4]);
    expect(values[0]).toBeUndefined();
    expect(values[1]).toBeUndefined();
    expect(values[2]).toBeCloseTo(2);
    expect(values[3]).toBeCloseTo(5);
    expect(values[4]).toBeCloseTo(17 / 3);
  });
});

describe('EMA', () => {
  it('seeds with the SMA of the first window then applies k = 2/(n+1)', () => {
    const values = compute('EMA', { column: 'CLOSE', period: 3 }, [1, 2, 3, 10, 4]);
    expect(values[0]).toBeUndefined();
    expect(values[1]).toBeUndefined();
    expect(values[2]).toBeCloseTo(2); // SMA(1,2,3)
    expect(values[3]).toBeCloseTo(6); // (10-2)*0.5 + 2
    expect(values[4]).toBeCloseTo(5); // (4-6)*0.5 + 6
  });
});

describe('fibLevels', () => {
  it('places 0% at the low, 100% at the high, and 50% at the midpoint', () => {
    const levels = fibLevels(10, 50);
    expect(levels[0]).toBeCloseTo(10); // 0%
    expect(levels[1]).toBeCloseTo(19.44); // 23.6%
    expect(levels[3]).toBeCloseTo(30); // 50%
    expect(levels[6]).toBeCloseTo(50); // 100%
  });
});

describe('FIB', () => {
  const fibSignal = (
    closes: number[],
    startDate: string,
    endDate: string,
    startIso = '2020-01-01',
  ) => {
    const bars = closesToBars(startIso, closes);
    const result = registry.resolve('FIB').compute(bars, { startDate, endDate });
    return result.get('fib').values;
  };

  it('flags crossings: -1 rising through a level, +1 falling through one', () => {
    // closes 30,10,50,30 over 2020-01-01..04 → low 10, high 50.
    const values = fibSignal([30, 10, 50, 30], '20200101', '20200104');
    expect(values).toEqual([0, 1, -1, 1]);
  });

  it('takes the high/low over START–END only, ignoring warm-up bars', () => {
    // The 200 close sits before START_DATE, so the range is 38..45, not 38..200.
    // 40→45 only crosses an interior level when the levels are scoped correctly.
    const values = fibSignal([200, 40, 45, 38, 42], '20191231', '20200103', '2019-12-30');
    expect(values).toEqual([0, 1, -1, 1, -1]);
  });
});
