import { describe, expect, it } from 'vitest';
import { ALL_CANDLE_PATTERNS } from '../src/indicators/kinds/candles/patterns';
import { makeAt, makeMetrics } from './candle-builders';

const byName = new Map(ALL_CANDLE_PATTERNS.map((p) => [p.name, p]));

function pattern(name: string) {
  const p = byName.get(name);
  if (!p) {
    throw new Error(`No pattern named ${name}`);
  }
  return p;
}

describe('Hammer R+', () => {
  it('matches a short body with a long lower shadow in a downtrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Short', lowerShadow: 250, upperShadowHl: 5, trend: -1 }),
    ];
    expect(pattern('Hammer R+').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in an uptrend', () => {
    const bars = [makeMetrics({ bodyType: 'Short', lowerShadow: 250, upperShadowHl: 5, trend: 1 })];
    expect(pattern('Hammer R+').matches(makeAt(bars))).toBe(false);
  });
});

describe('Hanging Man R-', () => {
  it('matches a short body with a long lower shadow in an uptrend', () => {
    const bars = [makeMetrics({ bodyType: 'Short', lowerShadow: 250, upperShadowHl: 5, trend: 1 })];
    expect(pattern('Hanging Man R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in a downtrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Short', lowerShadow: 250, upperShadowHl: 5, trend: -1 }),
    ];
    expect(pattern('Hanging Man R-').matches(makeAt(bars))).toBe(false);
  });
});

describe('Belt Hold R+', () => {
  it('matches a long white body with no lower shadow in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Long', lowerShadow: 0, upperShadow: 50, trend: -1 }),
    ];
    expect(pattern('Belt Hold R+').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Long', lowerShadow: 0, upperShadow: 50, trend: 1 }),
    ];
    expect(pattern('Belt Hold R+').matches(makeAt(bars))).toBe(false);
  });
});

describe('Belt Hold R-', () => {
  it('matches a long black body with no upper shadow in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', upperShadow: 0, lowerShadow: 50, trend: 1 }),
    ];
    expect(pattern('Belt Hold R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', upperShadow: 0, lowerShadow: 50, trend: -1 }),
    ];
    expect(pattern('Belt Hold R-').matches(makeAt(bars))).toBe(false);
  });
});

describe('Engulfing R+', () => {
  it('matches a long white body engulfing a short black body in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 10, bodyBottom: 2 }),
      makeMetrics({ color: 'Black', bodyType: 'Short', bodyTop: 9, bodyBottom: 3, trend: -1 }),
    ];
    expect(pattern('Engulfing R+').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 10, bodyBottom: 2 }),
      makeMetrics({ color: 'Black', bodyType: 'Short', bodyTop: 9, bodyBottom: 3, trend: 1 }),
    ];
    expect(pattern('Engulfing R+').matches(makeAt(bars))).toBe(false);
  });
});

describe('Engulfing R-', () => {
  it('matches a long black body engulfing a short white body in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 10, bodyBottom: 2 }),
      makeMetrics({ color: 'White', bodyType: 'Short', bodyTop: 9, bodyBottom: 3, trend: 1 }),
    ];
    expect(pattern('Engulfing R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 10, bodyBottom: 2 }),
      makeMetrics({ color: 'White', bodyType: 'Short', bodyTop: 9, bodyBottom: 3, trend: -1 }),
    ];
    expect(pattern('Engulfing R-').matches(makeAt(bars))).toBe(false);
  });
});

describe('Harami R+', () => {
  it('matches a short white body inside a long black body in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Short', bodyTop: 8, bodyBottom: 4 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 9, bodyBottom: 3, trend: -1 }),
    ];
    expect(pattern('Harami R+').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Short', bodyTop: 8, bodyBottom: 4 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 9, bodyBottom: 3, trend: 1 }),
    ];
    expect(pattern('Harami R+').matches(makeAt(bars))).toBe(false);
  });
});

describe('Harami R-', () => {
  it('matches a short black body inside a long white body in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Short', bodyTop: 8, bodyBottom: 4 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 9, bodyBottom: 3, trend: 1 }),
    ];
    expect(pattern('Harami R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Short', bodyTop: 8, bodyBottom: 4 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 9, bodyBottom: 3, trend: -1 }),
    ];
    expect(pattern('Harami R-').matches(makeAt(bars))).toBe(false);
  });
});

describe('Harami Cross R+', () => {
  it('matches a doji inside a long black body in a downtrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Doji', high: 8, low: 4 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 9, bodyBottom: 3, trend: -1 }),
    ];
    expect(pattern('Harami Cross R+').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in an uptrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Doji', high: 8, low: 4 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 9, bodyBottom: 3, trend: 1 }),
    ];
    expect(pattern('Harami Cross R+').matches(makeAt(bars))).toBe(false);
  });
});

describe('Harami Cross R-', () => {
  it('matches a doji inside a long white body in an uptrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Doji', high: 8, low: 4 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 9, bodyBottom: 3, trend: 1 }),
    ];
    expect(pattern('Harami Cross R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in a downtrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Doji', high: 8, low: 4 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 9, bodyBottom: 3, trend: -1 }),
    ];
    expect(pattern('Harami Cross R-').matches(makeAt(bars))).toBe(false);
  });
});

describe('Inverted Hammer R+', () => {
  it('matches a short body with a long upper shadow and negligible lower shadow in a downtrend', () => {
    const bars = [
      makeMetrics({
        bodyType: 'Short',
        lowerShadowHl: 5,
        upperShadow: 80,
        trend: -1,
      }),
    ];
    expect(pattern('Inverted Hammer R+').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in an uptrend', () => {
    const bars = [
      makeMetrics({
        bodyType: 'Short',
        lowerShadowHl: 5,
        upperShadow: 80,
        trend: 1,
      }),
    ];
    expect(pattern('Inverted Hammer R+').matches(makeAt(bars))).toBe(false);
  });
});

describe('Shooting Star R-', () => {
  it('matches a short body with a long upper shadow above the prior body in an uptrend', () => {
    const bars = [
      makeMetrics({
        bodyType: 'Short',
        lowerShadowHl: 5,
        upperShadow: 350,
        bodyBottom: 5,
        trend: 1,
      }),
      makeMetrics({ bodyTop: 4 }),
    ];
    expect(pattern('Shooting Star R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in a downtrend', () => {
    const bars = [
      makeMetrics({
        bodyType: 'Short',
        lowerShadowHl: 5,
        upperShadow: 350,
        bodyBottom: 5,
        trend: -1,
      }),
      makeMetrics({ bodyTop: 4 }),
    ];
    expect(pattern('Shooting Star R-').matches(makeAt(bars))).toBe(false);
  });
});

describe('Piercing Line R+', () => {
  it('matches a long white opening below the prior low and closing past the midpoint in a downtrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Short', color: 'White', bodyBottom: 2, bodyTop: 6, trend: -1 }),
      makeMetrics({
        bodyType: 'Long',
        color: 'Black',
        bodyBottom: 3,
        bodyTop: 7,
        low: 3,
        open: 7,
        close: 3,
      }),
    ];
    expect(pattern('Piercing Line R+').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in an uptrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Short', color: 'White', bodyBottom: 2, bodyTop: 6, trend: 1 }),
      makeMetrics({
        bodyType: 'Long',
        color: 'Black',
        bodyBottom: 3,
        bodyTop: 7,
        low: 3,
        open: 7,
        close: 3,
      }),
    ];
    expect(pattern('Piercing Line R+').matches(makeAt(bars))).toBe(false);
  });
});

describe('Dark Cloud Cover R-', () => {
  it('matches a black opening above the prior high and closing below the midpoint in an uptrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Short', color: 'Black', bodyTop: 8, bodyBottom: 4, trend: 1 }),
      makeMetrics({
        bodyType: 'Long',
        color: 'White',
        bodyTop: 7,
        bodyBottom: 3,
        high: 7,
        open: 3,
        close: 7,
      }),
    ];
    expect(pattern('Dark Cloud Cover R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in a downtrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Short', color: 'Black', bodyTop: 8, bodyBottom: 4, trend: -1 }),
      makeMetrics({
        bodyType: 'Long',
        color: 'White',
        bodyTop: 7,
        bodyBottom: 3,
        high: 7,
        open: 3,
        close: 7,
      }),
    ];
    expect(pattern('Dark Cloud Cover R-').matches(makeAt(bars))).toBe(false);
  });
});

describe('Doji Star R+', () => {
  it('matches a doji gapping below a long black body in a downtrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Doji', bodyTop: 2, trend: -1 }),
      makeMetrics({ bodyType: 'Long', color: 'Black', bodyBottom: 3 }),
    ];
    expect(pattern('Doji Star R+').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in an uptrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Doji', bodyTop: 2, trend: 1 }),
      makeMetrics({ bodyType: 'Long', color: 'Black', bodyBottom: 3 }),
    ];
    expect(pattern('Doji Star R+').matches(makeAt(bars))).toBe(false);
  });
});

describe('Doji Star R-', () => {
  it('matches a doji gapping above a long white body in an uptrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Doji', bodyBottom: 8, trend: 1 }),
      makeMetrics({ bodyType: 'Long', color: 'White', bodyTop: 7 }),
    ];
    expect(pattern('Doji Star R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in a downtrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Doji', bodyBottom: 8, trend: -1 }),
      makeMetrics({ bodyType: 'Long', color: 'White', bodyTop: 7 }),
    ];
    expect(pattern('Doji Star R-').matches(makeAt(bars))).toBe(false);
  });
});

describe('Meeting Lines R+', () => {
  it('matches a long white body closing at the prior long black close in a downtrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Long', color: 'White', close: 5, trend: -1 }),
      makeMetrics({ bodyType: 'Long', color: 'Black', close: 5 }),
    ];
    expect(pattern('Meeting Lines R+').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in an uptrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Long', color: 'White', close: 5, trend: 1 }),
      makeMetrics({ bodyType: 'Long', color: 'Black', close: 5 }),
    ];
    expect(pattern('Meeting Lines R+').matches(makeAt(bars))).toBe(false);
  });
});

describe('Meeting Lines R-', () => {
  it('matches a long black body closing at the prior long white close in an uptrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Long', color: 'Black', close: 5, trend: 1 }),
      makeMetrics({ bodyType: 'Long', color: 'White', close: 5 }),
    ];
    expect(pattern('Meeting Lines R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in a downtrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Long', color: 'Black', close: 5, trend: -1 }),
      makeMetrics({ bodyType: 'Long', color: 'White', close: 5 }),
    ];
    expect(pattern('Meeting Lines R-').matches(makeAt(bars))).toBe(false);
  });
});

describe('Homing Pigeon R+', () => {
  it('matches a small black body inside a long black body in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Short', bodyTop: 7, bodyBottom: 4 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 8, bodyBottom: 3, trend: -1 }),
    ];
    expect(pattern('Homing Pigeon R+').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Short', bodyTop: 7, bodyBottom: 4 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 8, bodyBottom: 3, trend: 1 }),
    ];
    expect(pattern('Homing Pigeon R+').matches(makeAt(bars))).toBe(false);
  });
});

describe('Descending Hawk R-', () => {
  it('matches a long white body inside a long white body in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 7, bodyBottom: 4 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 8, bodyBottom: 3, trend: 1 }),
    ];
    expect(pattern('Descending Hawk R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 7, bodyBottom: 4 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 8, bodyBottom: 3, trend: -1 }),
    ];
    expect(pattern('Descending Hawk R-').matches(makeAt(bars))).toBe(false);
  });
});

describe('Matching Low R+', () => {
  it('matches two black bodies sharing a close in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Short', close: 3, highLow: 5 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', close: 3, trend: -1 }),
    ];
    expect(pattern('Matching Low R+').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Short', close: 3, highLow: 5 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', close: 3, trend: 1 }),
    ];
    expect(pattern('Matching Low R+').matches(makeAt(bars))).toBe(false);
  });
});

describe('Matching High R-', () => {
  it('matches two white bodies sharing a close with little upper shadow in an uptrend', () => {
    const bars = [
      makeMetrics({
        color: 'White',
        bodyType: 'Long',
        close: 8,
        highLow: 5,
        upperShadowHl: 5,
      }),
      makeMetrics({
        color: 'White',
        bodyType: 'Long',
        close: 8,
        upperShadowHl: 5,
        trend: 1,
      }),
    ];
    expect(pattern('Matching High R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in a downtrend', () => {
    const bars = [
      makeMetrics({
        color: 'White',
        bodyType: 'Long',
        close: 8,
        highLow: 5,
        upperShadowHl: 5,
      }),
      makeMetrics({
        color: 'White',
        bodyType: 'Long',
        close: 8,
        upperShadowHl: 5,
        trend: -1,
      }),
    ];
    expect(pattern('Matching High R-').matches(makeAt(bars))).toBe(false);
  });
});

describe('Kicking R+', () => {
  it('matches a white marubozu gapping above a prior black marubozu', () => {
    const bars = [
      makeMetrics({ baseBody: 'Marubozu', color: 'White', bodyBottom: 8, bodyTop: 12 }),
      makeMetrics({ baseBody: 'Marubozu', color: 'Black', bodyTop: 5, bodyBottom: 1 }),
    ];
    expect(pattern('Kicking R+').matches(makeAt(bars))).toBe(true);
  });

  it('does not match when the white body fails to gap above the black body', () => {
    const bars = [
      makeMetrics({ baseBody: 'Marubozu', color: 'White', bodyBottom: 4, bodyTop: 12 }),
      makeMetrics({ baseBody: 'Marubozu', color: 'Black', bodyTop: 5, bodyBottom: 1 }),
    ];
    expect(pattern('Kicking R+').matches(makeAt(bars))).toBe(false);
  });
});

describe('Kicking R-', () => {
  it('matches a black marubozu gapping below a prior white marubozu', () => {
    const bars = [
      makeMetrics({ baseBody: 'Marubozu', color: 'Black', bodyTop: 4, bodyBottom: 1 }),
      makeMetrics({ baseBody: 'Marubozu', color: 'White', bodyBottom: 5, bodyTop: 9 }),
    ];
    expect(pattern('Kicking R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match when the black body fails to gap below the white body', () => {
    const bars = [
      makeMetrics({ baseBody: 'Marubozu', color: 'Black', bodyTop: 6, bodyBottom: 1 }),
      makeMetrics({ baseBody: 'Marubozu', color: 'White', bodyBottom: 5, bodyTop: 9 }),
    ];
    expect(pattern('Kicking R-').matches(makeAt(bars))).toBe(false);
  });
});

describe('One White Soldier R+', () => {
  it('matches a long white body opening above a prior long black body in a downtrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Long', color: 'White', bodyBottom: 6, bodyTop: 12 }),
      makeMetrics({
        bodyType: 'Long',
        color: 'Black',
        bodyBottom: 4,
        bodyTop: 9,
        high: 10,
        trend: -1,
      }),
    ];
    expect(pattern('One White Soldier R+').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in an uptrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Long', color: 'White', bodyBottom: 6, bodyTop: 12 }),
      makeMetrics({
        bodyType: 'Long',
        color: 'Black',
        bodyBottom: 4,
        bodyTop: 9,
        high: 10,
        trend: 1,
      }),
    ];
    expect(pattern('One White Soldier R+').matches(makeAt(bars))).toBe(false);
  });
});

describe('One Black Crow R-', () => {
  it('matches a long black body opening below a prior long white body in an uptrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Long', color: 'Black', bodyBottom: 1, bodyTop: 7 }),
      makeMetrics({
        bodyType: 'Long',
        color: 'White',
        bodyBottom: 6,
        bodyTop: 11,
        low: 3,
        trend: 1,
      }),
    ];
    expect(pattern('One Black Crow R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in a downtrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Long', color: 'Black', bodyBottom: 1, bodyTop: 7 }),
      makeMetrics({
        bodyType: 'Long',
        color: 'White',
        bodyBottom: 6,
        bodyTop: 11,
        low: 3,
        trend: -1,
      }),
    ];
    expect(pattern('One Black Crow R-').matches(makeAt(bars))).toBe(false);
  });
});

describe('Morning Star R+', () => {
  it('matches a long black, short star, then long white gapping up in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Long', bodyBottom: 6 }),
      makeMetrics({ bodyType: 'Short', bodyTop: 4 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyBottom: 5, trend: -1 }),
    ];
    expect(pattern('Morning Star R+').matches(makeAt(bars))).toBe(true);
  });

  it('does not match when the first day is not in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Long', bodyBottom: 6 }),
      makeMetrics({ bodyType: 'Short', bodyTop: 4 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyBottom: 5, trend: 1 }),
    ];
    expect(pattern('Morning Star R+').matches(makeAt(bars))).toBe(false);
  });
});

describe('Evening Star R-', () => {
  it('matches a long white, short star, then long black gapping down in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 4 }),
      makeMetrics({ bodyType: 'Short', bodyBottom: 6 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 5, trend: 1 }),
    ];
    expect(pattern('Evening Star R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match when the first day is not in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 4 }),
      makeMetrics({ bodyType: 'Short', bodyBottom: 6 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 5, trend: -1 }),
    ];
    expect(pattern('Evening Star R-').matches(makeAt(bars))).toBe(false);
  });
});

describe('Morning Doji Star R+', () => {
  it('matches a long black, doji star, then long white gapping up in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Long', bodyBottom: 6 }),
      makeMetrics({ bodyType: 'Doji', bodyTop: 4 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyBottom: 5, trend: -1 }),
    ];
    expect(pattern('Morning Doji Star R+').matches(makeAt(bars))).toBe(true);
  });

  it('does not match when the first day is not in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Long', bodyBottom: 6 }),
      makeMetrics({ bodyType: 'Doji', bodyTop: 4 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyBottom: 5, trend: 1 }),
    ];
    expect(pattern('Morning Doji Star R+').matches(makeAt(bars))).toBe(false);
  });
});

describe('Evening Doji Star R-', () => {
  it('matches a long white, doji star, then long black gapping down in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 4 }),
      makeMetrics({ bodyType: 'Doji', bodyBottom: 6 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 5, trend: 1 }),
    ];
    expect(pattern('Evening Doji Star R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match when the first day is not in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', bodyTop: 4 }),
      makeMetrics({ bodyType: 'Doji', bodyBottom: 6 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 5, trend: -1 }),
    ];
    expect(pattern('Evening Doji Star R-').matches(makeAt(bars))).toBe(false);
  });
});

describe('Abandoned Baby R+', () => {
  it('matches a long black, isolated doji, then long white gapping up in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Long', low: 7 }),
      makeMetrics({ bodyType: 'Doji', high: 5 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', low: 7, trend: -1 }),
    ];
    expect(pattern('Abandoned Baby R+').matches(makeAt(bars))).toBe(true);
  });

  it('does not match when the first day is not in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'White', bodyType: 'Long', low: 7 }),
      makeMetrics({ bodyType: 'Doji', high: 5 }),
      makeMetrics({ color: 'Black', bodyType: 'Long', low: 7, trend: 1 }),
    ];
    expect(pattern('Abandoned Baby R+').matches(makeAt(bars))).toBe(false);
  });
});

describe('Abandoned Baby R-', () => {
  it('matches a long white, isolated doji, then long black gapping down in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', high: 3 }),
      makeMetrics({ bodyType: 'Doji', low: 5 }),
      makeMetrics({ color: 'White', bodyType: 'Long', high: 3, trend: 1 }),
    ];
    expect(pattern('Abandoned Baby R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match when the first day is not in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyType: 'Long', high: 3 }),
      makeMetrics({ bodyType: 'Doji', low: 5 }),
      makeMetrics({ color: 'White', bodyType: 'Long', high: 3, trend: -1 }),
    ];
    expect(pattern('Abandoned Baby R-').matches(makeAt(bars))).toBe(false);
  });
});

describe('Tri Star R+', () => {
  it('matches three dojis with the middle one gapping down in a downtrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Doji', bodyBottom: 6 }),
      makeMetrics({ bodyType: 'Doji', bodyTop: 4 }),
      makeMetrics({ bodyType: 'Doji', bodyBottom: 6, trend: -1 }),
    ];
    expect(pattern('Tri Star R+').matches(makeAt(bars))).toBe(true);
  });

  it('does not match when the first day is not in a downtrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Doji', bodyBottom: 6 }),
      makeMetrics({ bodyType: 'Doji', bodyTop: 4 }),
      makeMetrics({ bodyType: 'Doji', bodyBottom: 6, trend: 1 }),
    ];
    expect(pattern('Tri Star R+').matches(makeAt(bars))).toBe(false);
  });
});

describe('Tri Star R-', () => {
  it('matches three dojis with the middle one gapping up in an uptrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Doji', bodyTop: 4 }),
      makeMetrics({ bodyType: 'Doji', bodyBottom: 6 }),
      makeMetrics({ bodyType: 'Doji', bodyTop: 4, trend: 1 }),
    ];
    expect(pattern('Tri Star R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match when the first day is not in an uptrend', () => {
    const bars = [
      makeMetrics({ bodyType: 'Doji', bodyTop: 4 }),
      makeMetrics({ bodyType: 'Doji', bodyBottom: 6 }),
      makeMetrics({ bodyType: 'Doji', bodyTop: 4, trend: -1 }),
    ];
    expect(pattern('Tri Star R-').matches(makeAt(bars))).toBe(false);
  });
});

describe('Upside Gap Two Crows R-', () => {
  it('matches a long white then a gapped-up black engulfed by a second black in an uptrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyTop: 10, bodyBottom: 4 }),
      makeMetrics({ color: 'Black', bodyTop: 9, bodyBottom: 5 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 3, trend: 1 }),
    ];
    expect(pattern('Upside Gap Two Crows R-').matches(makeAt(bars))).toBe(true);
  });

  it('does not match in a downtrend', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyTop: 10, bodyBottom: 4 }),
      makeMetrics({ color: 'Black', bodyTop: 9, bodyBottom: 5 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 3, trend: -1 }),
    ];
    expect(pattern('Upside Gap Two Crows R-').matches(makeAt(bars))).toBe(false);
  });

  it('does not match when the second day does not gap above the first white day', () => {
    const bars = [
      makeMetrics({ color: 'Black', bodyTop: 10, bodyBottom: 4 }),
      makeMetrics({ color: 'Black', bodyTop: 9, bodyBottom: 2 }),
      makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 3, trend: 1 }),
    ];
    expect(pattern('Upside Gap Two Crows R-').matches(makeAt(bars))).toBe(false);
  });
});
