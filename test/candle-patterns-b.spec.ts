import { describe, expect, it } from 'vitest';
import { ALL_CANDLE_PATTERNS } from '../src/indicators/kinds/candles/patterns';
import { makeAt, makeMetrics } from './candle-builders';

const byName = new Map(ALL_CANDLE_PATTERNS.map((p) => [p.name, p]));
function pattern(name: string) {
  const p = byName.get(name);
  if (!p) throw new Error(`No pattern named ${name}`);
  return p;
}

describe('Downside Gap Two Rabbits R+', () => {
  const p = pattern('Downside Gap Two Rabbits R+');

  it('matches a white body gapping below a long black bar in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyTop: 10, bodyBottom: 8 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyBottom: 12, bodyTop: 16, trend: -1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not negative', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyTop: 10, bodyBottom: 8 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyBottom: 12, bodyTop: 16, trend: 1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Unique Three River Bottom R+', () => {
  const p = pattern('Unique Three River Bottom R+');

  it('matches the unique three river bottom in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Short', bodyTop: 6.5, bodyBottom: 5.5 }),
      makeMetrics({ color: 'Black', bodyTop: 9, bodyBottom: 7, low: 4 }),
      makeMetrics({
        color: 'Black',
        bodyType: 'Long',
        bodyTop: 10,
        bodyBottom: 6,
        low: 5,
        trend: -1,
      }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not negative', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Short', bodyTop: 6.5, bodyBottom: 5.5 }),
      makeMetrics({ color: 'Black', bodyTop: 9, bodyBottom: 7, low: 4 }),
      makeMetrics({
        color: 'Black',
        bodyType: 'Long',
        bodyTop: 10,
        bodyBottom: 6,
        low: 5,
        trend: 1,
      }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Unique Three Mountain Top R-', () => {
  const p = pattern('Unique Three Mountain Top R-');

  it('matches the unique three mountain top in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Short', open: 8, close: 7, high: 9 }),
      makeMetrics({
        color: 'White',
        bodyType: 'Short',
        bodyTop: 6,
        bodyBottom: 4,
        close: 6,
        high: 11,
        upperShadowHl: 40,
      }),
      makeMetrics({
        color: 'White',
        bodyType: 'Long',
        bodyTop: 7,
        bodyBottom: 3,
        high: 10,
        trend: 1,
      }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not positive', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Short', open: 8, close: 7, high: 9 }),
      makeMetrics({
        color: 'White',
        bodyType: 'Short',
        bodyTop: 6,
        bodyBottom: 4,
        close: 6,
        high: 11,
        upperShadowHl: 40,
      }),
      makeMetrics({
        color: 'White',
        bodyType: 'Long',
        bodyTop: 7,
        bodyBottom: 3,
        high: 10,
        trend: -1,
      }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Three White Soldiers R+', () => {
  const p = pattern('Three White Soldiers R+');

  it('matches three rising white soldiers reversing a downtrend', () => {
    const bars = [
      makeMetrics({
        color: 'White',
        bodyType: 'Long',
        open: 5,
        close: 8,
        bodyBottom: 5,
        bodyTop: 8,
        upperShadowHl: 5,
      }),
      makeMetrics({
        color: 'White',
        bodyType: 'Long',
        open: 3,
        close: 6,
        bodyBottom: 3,
        bodyTop: 6,
        upperShadowHl: 5,
      }),
      makeMetrics({
        color: 'White',
        bodyType: 'Long',
        open: 1,
        close: 4,
        bodyBottom: 1,
        bodyTop: 4,
        upperShadowHl: 5,
        trend: -1,
      }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not negative', () => {
    const bars = [
      makeMetrics({
        color: 'White',
        bodyType: 'Long',
        open: 5,
        close: 8,
        bodyBottom: 5,
        bodyTop: 8,
        upperShadowHl: 5,
      }),
      makeMetrics({
        color: 'White',
        bodyType: 'Long',
        open: 3,
        close: 6,
        bodyBottom: 3,
        bodyTop: 6,
        upperShadowHl: 5,
      }),
      makeMetrics({
        color: 'White',
        bodyType: 'Long',
        open: 1,
        close: 4,
        bodyBottom: 1,
        bodyTop: 4,
        upperShadowHl: 5,
        trend: 1,
      }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Identical Three Crows R-', () => {
  const p = pattern('Identical Three Crows R-');

  it('matches three identical black crows opening at the prior close in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', open: 96, close: 94, highLow: 3 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', open: 98, close: 96, highLow: 3 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', open: 100, close: 98, highLow: 3, trend: 1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when consecutive opens gap away from the prior close', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', open: 92, close: 90, highLow: 3 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', open: 96, close: 91, highLow: 3 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', open: 100, close: 92, highLow: 3, trend: 1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Three Black Crows R-', () => {
  const p = pattern('Three Black Crows R-');

  it('matches three long black crows each opening within the prior body in an uptrend', () => {
    const bars = [
      makeMetrics({
        color: 'Black',
        bodyType: 'Long',
        open: 95,
        close: 92,
        bodyTop: 95,
        bodyBottom: 92,
        lowerShadowHl: 5,
      }),
      makeMetrics({
        color: 'Black',
        bodyType: 'Long',
        open: 98,
        close: 94,
        bodyTop: 98,
        bodyBottom: 94,
        lowerShadowHl: 5,
      }),
      makeMetrics({
        color: 'Black',
        bodyType: 'Long',
        open: 101,
        close: 96,
        bodyTop: 101,
        bodyBottom: 96,
        lowerShadowHl: 5,
        trend: 1,
      }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when a crow opens outside the prior body', () => {
    const bars = [
      makeMetrics({
        color: 'Black',
        bodyType: 'Long',
        open: 99,
        close: 92,
        bodyTop: 99,
        bodyBottom: 92,
        lowerShadowHl: 5,
      }),
      makeMetrics({
        color: 'Black',
        bodyType: 'Long',
        open: 98,
        close: 94,
        bodyTop: 98,
        bodyBottom: 94,
        lowerShadowHl: 5,
      }),
      makeMetrics({
        color: 'Black',
        bodyType: 'Long',
        open: 101,
        close: 96,
        bodyTop: 101,
        bodyBottom: 96,
        lowerShadowHl: 5,
        trend: 1,
      }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Advance Block R-', () => {
  const p = pattern('Advance Block R-');

  it('matches an advancing block with growing upper shadows in an uptrend', () => {
    const bars = [
      makeMetrics({
        color: 'White',
        open: 5,
        close: 7,
        bodyTop: 7,
        bodyBottom: 5,
        upperShadowHl: 40,
      }),
      makeMetrics({
        color: 'White',
        open: 3,
        close: 6,
        bodyBottom: 3,
        bodyTop: 6,
        upperShadowHl: 40,
      }),
      makeMetrics({
        color: 'White',
        bodyType: 'Long',
        open: 1,
        close: 5,
        bodyBottom: 1,
        bodyTop: 5,
        trend: 1,
      }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not positive', () => {
    const bars = [
      makeMetrics({
        color: 'White',
        open: 5,
        close: 7,
        bodyTop: 7,
        bodyBottom: 5,
        upperShadowHl: 40,
      }),
      makeMetrics({
        color: 'White',
        open: 3,
        close: 6,
        bodyBottom: 3,
        bodyTop: 6,
        upperShadowHl: 40,
      }),
      makeMetrics({
        color: 'White',
        bodyType: 'Long',
        open: 1,
        close: 5,
        bodyBottom: 1,
        bodyTop: 5,
        trend: -1,
      }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Descent Block R+', () => {
  const p = pattern('Descent Block R+');

  it('matches a descending block with growing lower shadows in a downtrend', () => {
    const bars = [
      makeMetrics({
        color: 'Black',
        open: 6,
        close: 5,
        bodyTop: 6,
        bodyBottom: 5,
        lowerShadowHl: 40,
      }),
      makeMetrics({
        color: 'Black',
        open: 5,
        close: 6,
        bodyBottom: 2,
        bodyTop: 6,
        lowerShadowHl: 40,
      }),
      makeMetrics({
        color: 'Black',
        bodyType: 'Long',
        open: 7,
        close: 7,
        bodyBottom: 1,
        bodyTop: 7,
        trend: -1,
      }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not negative', () => {
    const bars = [
      makeMetrics({
        color: 'Black',
        open: 6,
        close: 5,
        bodyTop: 6,
        bodyBottom: 5,
        lowerShadowHl: 40,
      }),
      makeMetrics({
        color: 'Black',
        open: 5,
        close: 6,
        bodyBottom: 2,
        bodyTop: 6,
        lowerShadowHl: 40,
      }),
      makeMetrics({
        color: 'Black',
        bodyType: 'Long',
        open: 7,
        close: 7,
        bodyBottom: 1,
        bodyTop: 7,
        trend: 1,
      }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Deliberation R-', () => {
  const p = pattern('Deliberation R-');

  it('matches a deliberation star atop two long white bars in an uptrend', () => {
    const bars = [
      makeMetrics({
        color: 'White',
        bodyType: 'Short',
        open: 9,
        highLow: 4,
        upperShadow: 150,
        lowerShadow: 150,
      }),
      makeMetrics({ color: 'White', bodyDay: 'Long', open: 5, close: 9 }),
      makeMetrics({ color: 'White', bodyDay: 'Long', open: 3, close: 6, trend: 1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not positive', () => {
    const bars = [
      makeMetrics({
        color: 'White',
        bodyType: 'Short',
        open: 9,
        highLow: 4,
        upperShadow: 150,
        lowerShadow: 150,
      }),
      makeMetrics({ color: 'White', bodyDay: 'Long', open: 5, close: 9 }),
      makeMetrics({ color: 'White', bodyDay: 'Long', open: 3, close: 6, trend: -1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Deliberation R+', () => {
  const p = pattern('Deliberation R+');

  it('matches a deliberation star below two long black bars in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', open: 3, upperShadowHl: 21, lowerShadow: 21 }),
      makeMetrics({ color: 'Black', bodyDay: 'Long', open: 4, close: 6 }),
      makeMetrics({ color: 'Black', bodyDay: 'Long', close: 5, trend: -1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not negative', () => {
    const bars = [
      makeMetrics({ color: 'Black', open: 3, upperShadowHl: 21, lowerShadow: 21 }),
      makeMetrics({ color: 'Black', bodyDay: 'Long', open: 4, close: 6 }),
      makeMetrics({ color: 'Black', bodyDay: 'Long', close: 5, trend: 1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Two Crows R-', () => {
  const p = pattern('Two Crows R-');

  it('matches two black crows over a long white bar in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', open: 8, close: 6 }),
      makeMetrics({ color: 'Black', bodyTop: 9, bodyBottom: 7 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 6, bodyBottom: 4, trend: 1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not positive', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', open: 8, close: 6 }),
      makeMetrics({ color: 'Black', bodyTop: 9, bodyBottom: 7 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 6, bodyBottom: 4, trend: -1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Two Rabbits R+', () => {
  const p = pattern('Two Rabbits R+');

  it('matches two rabbits below a long black bar in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'White', open: 6, close: 10, bodyBottom: 6, bodyTop: 10 }),
      makeMetrics({ color: 'White', bodyTop: 8, bodyBottom: 4 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 12, bodyBottom: 9, trend: -1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not negative', () => {
    const bars = [
      makeMetrics({ color: 'White', open: 6, close: 10, bodyBottom: 6, bodyTop: 10 }),
      makeMetrics({ color: 'White', bodyTop: 8, bodyBottom: 4 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 12, bodyBottom: 9, trend: 1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Three Inside Up R+', () => {
  const p = pattern('Three Inside Up R+');

  it('matches a harami confirmed by a long white close in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Long', close: 11 }),
      makeMetrics({ color: 'White', bodyType: 'Short', bodyTop: 8, bodyBottom: 6 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 10, bodyBottom: 5, trend: -1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not negative', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Long', close: 11 }),
      makeMetrics({ color: 'White', bodyType: 'Short', bodyTop: 8, bodyBottom: 6 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 10, bodyBottom: 5, trend: 1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Three Inside Down R-', () => {
  const p = pattern('Three Inside Down R-');

  it('matches a harami confirmed by a long black close in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', close: 4 }),
      makeMetrics({ color: 'Black', bodyType: 'Short', bodyTop: 8, bodyBottom: 6 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 10, bodyBottom: 5, trend: 1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not positive', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', close: 4 }),
      makeMetrics({ color: 'Black', bodyType: 'Short', bodyTop: 8, bodyBottom: 6 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 10, bodyBottom: 5, trend: -1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Three Outside Up R+', () => {
  const p = pattern('Three Outside Up R+');

  it('matches an engulfing confirmed by a higher white close in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Short', close: 12 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 10, bodyBottom: 4, close: 10 }),
      makeMetrics({ color: 'Black', bodyType: 'Short', bodyTop: 8, bodyBottom: 6, trend: -1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not negative', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Short', close: 12 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 10, bodyBottom: 4, close: 10 }),
      makeMetrics({ color: 'Black', bodyType: 'Short', bodyTop: 8, bodyBottom: 6, trend: 1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Three Outside Down R-', () => {
  const p = pattern('Three Outside Down R-');

  it('matches a bearish engulfing confirmed by a lower black close in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Short', close: 3 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 10, bodyBottom: 4, close: 4 }),
      makeMetrics({ color: 'White', bodyType: 'Short', bodyTop: 8, bodyBottom: 6, trend: 1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not positive', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Short', close: 3 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 10, bodyBottom: 4, close: 4 }),
      makeMetrics({ color: 'White', bodyType: 'Short', bodyTop: 8, bodyBottom: 6, trend: -1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Three Stars in the South R+', () => {
  const p = pattern('Three Stars in the South R+');

  it('matches three shrinking black stars in a downtrend', () => {
    const bars = [
      makeMetrics({
        color: 'Black',
        bodyTop: 6,
        bodyBottom: 5,
        high: 6,
        low: 4.5,
        body: 1,
        upperShadowHl: 0,
        lowerShadowHl: 0,
      }),
      makeMetrics({
        color: 'Black',
        bodyTop: 8,
        bodyBottom: 5,
        high: 8,
        low: 2,
        lowerShadow: 10,
        body: 3,
      }),
      makeMetrics({
        color: 'Black',
        bodyTop: 10,
        bodyBottom: 6,
        high: 10,
        low: 1,
        lowerShadow: 60,
        body: 4,
        trend: -1,
      }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not negative', () => {
    const bars = [
      makeMetrics({
        color: 'Black',
        bodyTop: 6,
        bodyBottom: 5,
        high: 6,
        low: 4.5,
        body: 1,
        upperShadowHl: 0,
        lowerShadowHl: 0,
      }),
      makeMetrics({
        color: 'Black',
        bodyTop: 8,
        bodyBottom: 5,
        high: 8,
        low: 2,
        lowerShadow: 10,
        body: 3,
      }),
      makeMetrics({
        color: 'Black',
        bodyTop: 10,
        bodyBottom: 6,
        high: 10,
        low: 1,
        lowerShadow: 60,
        body: 4,
        trend: 1,
      }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Three Stars in the North R-', () => {
  const p = pattern('Three Stars in the North R-');

  it('matches three descending white stars with long upper shadows in an uptrend', () => {
    const bars = [
      // day 3 (most recent): small white marubozu inside the day-2 range
      makeMetrics({
        color: 'White',
        bodyType: 'Short',
        open: 7.5,
        close: 10.5,
        high: 11,
        low: 7,
        upperShadowHl: 5,
        lowerShadowHl: 5,
      }),
      // day 2: white, long upper shadow, lower high & higher low, closes above day 1
      makeMetrics({
        color: 'White',
        open: 6.5,
        close: 11.5,
        high: 12,
        low: 6.5,
        upperShadowHl: 45,
        lowerShadowHl: 5,
      }),
      // day 1 (oldest): long white with a long upper shadow
      makeMetrics({
        color: 'White',
        bodyType: 'Long',
        open: 7,
        close: 11,
        high: 13,
        low: 6,
        upperShadowHl: 45,
        lowerShadowHl: 5,
        trend: 1,
      }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not positive', () => {
    const bars = [
      makeMetrics({
        color: 'White',
        bodyType: 'Short',
        open: 7.5,
        close: 10.5,
        high: 11,
        low: 7,
        upperShadowHl: 5,
        lowerShadowHl: 5,
      }),
      makeMetrics({
        color: 'White',
        open: 6.5,
        close: 11.5,
        high: 12,
        low: 6.5,
        upperShadowHl: 45,
        lowerShadowHl: 5,
      }),
      makeMetrics({
        color: 'White',
        bodyType: 'Long',
        open: 7,
        close: 11,
        high: 13,
        low: 6,
        upperShadowHl: 45,
        lowerShadowHl: 5,
        trend: -1,
      }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Stick Sandwich R+', () => {
  const p = pattern('Stick Sandwich R+');

  it('matches a bullish stick sandwich with matching black closes in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyTop: 8, bodyBottom: 5, close: 5, highLow: 4 }),
      makeMetrics({ color: 'White', bodyTop: 7, bodyBottom: 5.5 }),
      makeMetrics({ color: 'Black', bodyTop: 6, bodyBottom: 5, close: 5, trend: -1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not negative', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyTop: 8, bodyBottom: 5, close: 5, highLow: 4 }),
      makeMetrics({ color: 'White', bodyTop: 7, bodyBottom: 5.5 }),
      makeMetrics({ color: 'Black', bodyTop: 6, bodyBottom: 5, close: 5, trend: 1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Stick Sandwich R-', () => {
  const p = pattern('Stick Sandwich R-');

  it('matches a bearish stick sandwich with a black engulfed by a white in an uptrend', () => {
    const bars = [
      // day 3 (most recent): white body engulfing the black
      makeMetrics({ color: 'White', bodyTop: 10, bodyBottom: 3 }),
      // day 2: black opening below day-1 close and closing below day-1 open
      makeMetrics({ color: 'Black', bodyTop: 6, bodyBottom: 4, open: 6, close: 4 }),
      // day 1 (oldest): white in an uptrend
      makeMetrics({ color: 'White', bodyTop: 8, bodyBottom: 7, open: 7, close: 8, trend: 1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not positive', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyTop: 10, bodyBottom: 3 }),
      makeMetrics({ color: 'Black', bodyTop: 6, bodyBottom: 4, open: 6, close: 4 }),
      makeMetrics({ color: 'White', bodyTop: 8, bodyBottom: 7, open: 7, close: 8, trend: -1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Squeeze Alert R+', () => {
  const p = pattern('Squeeze Alert R+');

  it('matches a narrowing range after a long black first day in a downtrend', () => {
    const bars = [
      makeMetrics({ high: 8, low: 5 }),
      makeMetrics({ high: 9, low: 4 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', high: 10, low: 3, trend: -1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not negative', () => {
    const bars = [
      makeMetrics({ high: 8, low: 5 }),
      makeMetrics({ high: 9, low: 4 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', high: 10, low: 3, trend: 1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Squeeze Alert R-', () => {
  const p = pattern('Squeeze Alert R-');

  it('matches a narrowing range after a long white first day in an uptrend', () => {
    const bars = [
      makeMetrics({ high: 8, low: 5 }),
      makeMetrics({ high: 9, low: 4 }),
      makeMetrics({ color: 'White', bodyType: 'Long', high: 10, low: 3, trend: 1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not positive', () => {
    const bars = [
      makeMetrics({ high: 8, low: 5 }),
      makeMetrics({ high: 9, low: 4 }),
      makeMetrics({ color: 'White', bodyType: 'Long', high: 10, low: 3, trend: -1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Breakaway R+', () => {
  const p = pattern('Breakaway R+');

  it('matches a five-bar bullish breakaway in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 9 }),
      makeMetrics({ color: 'Black', bodyTop: 4 }),
      makeMetrics({ color: 'Black', bodyTop: 6 }),
      makeMetrics({ color: 'Black', bodyTop: 8, high: 9 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyBottom: 11, low: 10, trend: -1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not negative', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 9 }),
      makeMetrics({ color: 'Black', bodyTop: 4 }),
      makeMetrics({ color: 'Black', bodyTop: 6 }),
      makeMetrics({ color: 'Black', bodyTop: 8, high: 9 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyBottom: 11, low: 10, trend: 1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Breakaway R-', () => {
  const p = pattern('Breakaway R-');

  it('matches a five-bar bearish breakaway in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyBottom: 3 }),
      makeMetrics({ color: 'White', bodyTop: 8 }),
      makeMetrics({ color: 'White', bodyTop: 6 }),
      makeMetrics({ color: 'White', bodyTop: 4, bodyBottom: 4, low: 3 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 2, high: 1, trend: 1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(true);
  });

  it('rejects when the prior trend is not positive', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyBottom: 3 }),
      makeMetrics({ color: 'White', bodyTop: 8 }),
      makeMetrics({ color: 'White', bodyTop: 6 }),
      makeMetrics({ color: 'White', bodyTop: 4, bodyBottom: 4, low: 3 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 2, high: 1, trend: -1 }),
    ];
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});
