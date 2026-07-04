import { describe, expect, it } from 'vitest';
import { ALL_CANDLE_PATTERNS } from '../src/indicators/kinds/candles/patterns';
import { makeAt, makeMetrics } from './candle-builders';

/**
 * Unit fixtures for patterns-c.ts, exercising the predicates directly with
 * synthetic CandleMetrics. Each build() is a canonical Morris true-positive; the
 * companion test flips the pattern's trend requirement to prove the guard fires.
 *
 * bars[0] = at(0) (current) ... bars[length-1] = oldest.
 */

const byName = new Map(ALL_CANDLE_PATTERNS.map((p) => [p.name, p]));
function pattern(name: string) {
  const p = byName.get(name);
  if (!p) throw new Error(`No pattern named ${name}`);
  return p;
}

describe('Concealing Baby Swallow R+', () => {
  const p = pattern('Concealing Baby Swallow R+');
  const build = () => [
    // at(0): black engulfing bar4 - bodyTop > at(1).high, bodyBottom < at(1).low
    makeMetrics({ color: 'Black', bodyTop: 100, bodyBottom: 10, trend: 0 }), // at(0)
    // at(1): black gap-down day3, high into at(2) body, long upper shadow
    makeMetrics({ color: 'Black', bodyTop: 40, high: 65, low: 20, upperShadowHl: 40 }), // at(1)
    makeMetrics({ color: 'Black', baseBody: 'Marubozu', bodyBottom: 60 }), // at(2)
    makeMetrics({ color: 'Black', baseBody: 'Marubozu', trend: -1 }), // at(3) oldest
  ];

  it('matches four black bars with two marubozu, a long-upper-shadow day3, and an engulfing day4 in a downtrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not down', () => {
    const bars = build();
    bars[3] = makeMetrics({ color: 'Black', baseBody: 'Marubozu', trend: 1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Ladder Bottom R+', () => {
  const p = pattern('Ladder Bottom R+');
  const build = () => [
    // at(0): white, opens above at(1) body top (40)
    makeMetrics({ color: 'White', bodyType: 'Short', open: 50, bodyBottom: 50, bodyTop: 60 }), // at(0)
    // at(1): black with upper shadow, bodyTop 40
    makeMetrics({ color: 'Black', bodyTop: 40, upperShadowHl: 40 }), // at(1)
    // at(2): long black, lower open/close than at(3)
    makeMetrics({ color: 'Black', bodyType: 'Long', open: 30, close: 20 }), // at(2)
    // at(3): long black, lower open/close than at(4)
    makeMetrics({ color: 'Black', bodyType: 'Long', open: 40, close: 30 }), // at(3)
    // at(4): long black, oldest, downtrend
    makeMetrics({ color: 'Black', bodyType: 'Long', open: 50, close: 40, trend: -1 }), // at(4)
  ];

  it('matches a descending black staircase, a black upper-shadow bar, then a white reversal bar in a downtrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not down', () => {
    const bars = build();
    bars[4] = makeMetrics({ color: 'Black', bodyType: 'Long', open: 50, close: 40, trend: 1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Ladder Top R-', () => {
  const p = pattern('Ladder Top R-');
  const build = () => [
    // at(0): black, opens below at(1) body bottom (50), closes below at(1) low (10)
    makeMetrics({ color: 'Black', open: 40, close: 5, bodyBottom: 5, bodyTop: 40 }), // at(0)
    // at(1): white with lower shadow reaching into at(2) body (low < at(2).bodyBottom 40)
    makeMetrics({ color: 'White', bodyBottom: 50, low: 10, lowerShadowHl: 40 }), // at(1)
    // at(2): long white, higher open/close than at(3)
    makeMetrics({ color: 'White', bodyType: 'Long', open: 30, close: 40, bodyBottom: 40 }), // at(2)
    // at(3): long white, higher open/close than at(4)
    makeMetrics({ color: 'White', bodyType: 'Long', open: 20, close: 30 }), // at(3)
    // at(4): long white, oldest, uptrend
    makeMetrics({ color: 'White', bodyType: 'Long', open: 10, close: 20, trend: 1 }), // at(4)
  ];

  it('matches an ascending white staircase, a white lower-shadow bar, then a black reversal bar in an uptrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not up', () => {
    const bars = build();
    bars[4] = makeMetrics({ color: 'White', bodyType: 'Long', open: 10, close: 20, trend: -1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('After Bottom Gap Up R+', () => {
  const p = pattern('After Bottom Gap Up R+');
  const build = () => [
    // at(0): long white, opens above at(1).close (90)
    makeMetrics({ color: 'White', bodyDay: 'Long', open: 95, close: 110 }), // at(0)
    // at(1): long white
    makeMetrics({ color: 'White', bodyDay: 'Long', close: 90 }), // at(1)
    // at(2): black, closes lower than at(3) (40), opens below at(3).close (40)
    makeMetrics({ color: 'Black', open: 35, close: 30 }), // at(2)
    // at(3): black, closes lower than at(4) (45)
    makeMetrics({ color: 'Black', close: 40 }), // at(3)
    // at(4): long black, oldest, downtrend
    makeMetrics({ color: 'Black', bodyDay: 'Long', close: 45, trend: -1 }), // at(4)
  ];

  it('matches two gapped long white bars after three black bars in a downtrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not down', () => {
    const bars = build();
    bars[4] = makeMetrics({ color: 'Black', bodyDay: 'Long', close: 45, trend: 1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('After Top Gap Down R-', () => {
  const p = pattern('After Top Gap Down R-');
  const build = () => [
    // at(0): long black, opens below at(1).close (80)
    makeMetrics({ color: 'Black', bodyDay: 'Long', open: 75, close: 60 }), // at(0)
    // at(1): long black
    makeMetrics({ color: 'Black', bodyDay: 'Long', close: 80 }), // at(1)
    // at(2): white, closes higher than at(3) (70), opens above at(3).close (70)
    makeMetrics({ color: 'White', open: 75, close: 90 }), // at(2)
    // at(3): white, closes higher than at(4) (65)
    makeMetrics({ color: 'White', close: 70 }), // at(3)
    // at(4): long white, oldest, uptrend
    makeMetrics({ color: 'White', bodyDay: 'Long', close: 65, trend: 1 }), // at(4)
  ];

  it('matches two gapped long black bars after three white bars in an uptrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not up', () => {
    const bars = build();
    bars[4] = makeMetrics({ color: 'White', bodyDay: 'Long', close: 65, trend: -1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Three Gap Downs R+', () => {
  const p = pattern('Three Gap Downs R+');
  // bodies stack high (at3) to low (at0), each gapping down
  const build = () => [
    // at(0): long black, bodyTop below at(1).bodyBottom (80)
    makeMetrics({ color: 'Black', bodyDay: 'Long', bodyTop: 70, bodyBottom: 60 }), // at(0)
    // at(1): long black, bodyTop below at(2).bodyBottom (100)
    makeMetrics({ color: 'Black', bodyDay: 'Long', bodyTop: 90, bodyBottom: 80 }), // at(1)
    // at(2): any color, bodyTop below at(3).bodyBottom (120)
    makeMetrics({ color: 'White', bodyTop: 110, bodyBottom: 100 }), // at(2)
    // at(3): any color, oldest, downtrend
    makeMetrics({ color: 'White', bodyBottom: 120, trend: -1 }), // at(3)
  ];

  it('matches three successive downward body gaps ending in two long blacks in a downtrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not down', () => {
    const bars = build();
    bars[3] = makeMetrics({ color: 'White', bodyBottom: 120, trend: 1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Three Gap Ups R-', () => {
  const p = pattern('Three Gap Ups R-');
  const build = () => [
    // at(0): long white, bodyBottom above at(1).bodyTop (100)
    makeMetrics({ color: 'White', bodyDay: 'Long', bodyBottom: 110, bodyTop: 120 }), // at(0)
    // at(1): long white, bodyBottom above at(2).bodyTop (60)
    makeMetrics({ color: 'White', bodyDay: 'Long', bodyBottom: 70, bodyTop: 100 }), // at(1)
    // at(2): any color, bodyBottom above at(3).bodyTop (30)
    makeMetrics({ color: 'Black', bodyBottom: 40, bodyTop: 60 }), // at(2)
    // at(3): any color, oldest, uptrend
    makeMetrics({ color: 'Black', bodyTop: 30, trend: 1 }), // at(3)
  ];

  it('matches three successive upward body gaps ending in two long whites in an uptrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not up', () => {
    const bars = build();
    bars[3] = makeMetrics({ color: 'Black', bodyTop: 30, trend: -1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Separating Lines C+', () => {
  const p = pattern('Separating Lines C+');
  const build = () => [
    makeMetrics({ color: 'White', open: 50 }), // at(0)
    makeMetrics({ color: 'Black', open: 50, trend: 1 }), // at(1) oldest
  ];

  it('matches a white bar opening at the prior black open in an uptrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not up', () => {
    const bars = build();
    bars[1] = makeMetrics({ color: 'Black', open: 50, trend: -1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Separating Lines C-', () => {
  const p = pattern('Separating Lines C-');
  const build = () => [
    makeMetrics({ color: 'Black', open: 50 }), // at(0)
    makeMetrics({ color: 'White', open: 50, trend: -1 }), // at(1) oldest
  ];

  it('matches a black bar opening at the prior white open in a downtrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not down', () => {
    const bars = build();
    bars[1] = makeMetrics({ color: 'White', open: 50, trend: 1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('On Neck Line C+', () => {
  const p = pattern('On Neck Line C+');
  const build = () => [
    makeMetrics({ color: 'Black', open: 60, close: 50 }), // at(0): opens above high(50), closes at high(50)
    makeMetrics({ bodyType: 'Long', color: 'White', high: 50, trend: 1 }), // at(1) oldest
  ];

  it('matches a black bar closing at the prior white high in an uptrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not up', () => {
    const bars = build();
    bars[1] = makeMetrics({ bodyType: 'Long', color: 'White', high: 50, trend: -1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('On Neck Line C-', () => {
  const p = pattern('On Neck Line C-');
  const build = () => [
    makeMetrics({ color: 'White', open: 40, close: 50 }), // at(0): opens below low(50), closes at low(50)
    makeMetrics({ bodyType: 'Long', color: 'Black', low: 50, trend: -1 }), // at(1) oldest
  ];

  it('matches a white bar closing at the prior black low in a downtrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not down', () => {
    const bars = build();
    bars[1] = makeMetrics({ bodyType: 'Long', color: 'Black', low: 50, trend: 1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('In Neck Line C+', () => {
  const p = pattern('In Neck Line C+');
  // at(1): high=60 low=10 close=50 ; threshold (high-low)*0.05 = 2.5 ; close-2.5 = 47.5
  const build = () => [
    makeMetrics({ color: 'Black', open: 70, close: 48 }), // at(0): opens above high, closes just inside body
    makeMetrics({ bodyType: 'Long', color: 'White', high: 60, low: 10, close: 50, trend: 1 }), // at(1) oldest
  ];

  it('matches a black bar closing just inside the prior white body in an uptrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not up', () => {
    const bars = build();
    bars[1] = makeMetrics({
      bodyType: 'Long',
      color: 'White',
      high: 60,
      low: 10,
      close: 50,
      trend: -1,
    });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('In Neck Line C-', () => {
  const p = pattern('In Neck Line C-');
  // at(1): high=60 low=10 close=20 ; threshold = 2.5 ; close+2.5 = 22.5
  const build = () => [
    makeMetrics({ color: 'White', open: 5, close: 22 }), // at(0): opens below low, closes just inside body
    makeMetrics({ bodyType: 'Long', color: 'Black', high: 60, low: 10, close: 20, trend: -1 }), // at(1) oldest
  ];

  it('matches a white bar closing just inside the prior black body in a downtrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not down', () => {
    const bars = build();
    bars[1] = makeMetrics({
      bodyType: 'Long',
      color: 'Black',
      high: 60,
      low: 10,
      close: 20,
      trend: 1,
    });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Thrusting C+', () => {
  const p = pattern('Thrusting C+');
  // at(1): high=60 low=10 open=20 close=50 ; high+(high-low)*0.3 = 60+15 = 75 ; midpoint=(20+50)/2=35
  const build = () => [
    makeMetrics({ color: 'Black', open: 80, close: 45 }), // at(0): open>75, close 45 (>=mid 35, <close 50)
    makeMetrics({
      bodyType: 'Long',
      color: 'White',
      high: 60,
      low: 10,
      open: 20,
      close: 50,
      trend: 1,
    }), // at(1) oldest
  ];

  it('matches a black bar gapping above and closing into the upper prior body in an uptrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not up', () => {
    const bars = build();
    bars[1] = makeMetrics({
      bodyType: 'Long',
      color: 'White',
      high: 60,
      low: 10,
      open: 20,
      close: 50,
      trend: -1,
    });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Thrusting C-', () => {
  const p = pattern('Thrusting C-');
  // at(1): high=60 low=10 open=50 close=20 ; low-(high-low)*0.3 = 10-15 = -5 ; midpoint=(50+20)/2=35
  const build = () => [
    makeMetrics({ color: 'White', open: -10, close: 30 }), // at(0): open<-5, close 30 (>close 20, <=mid 35)
    makeMetrics({
      bodyType: 'Long',
      color: 'Black',
      high: 60,
      low: 10,
      open: 50,
      close: 20,
      trend: -1,
    }), // at(1) oldest
  ];

  it('matches a white bar gapping below and closing into the lower prior body in a downtrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not down', () => {
    const bars = build();
    bars[1] = makeMetrics({
      bodyType: 'Long',
      color: 'Black',
      high: 60,
      low: 10,
      open: 50,
      close: 20,
      trend: 1,
    });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Upside Tasuki Gap C+', () => {
  const p = pattern('Upside Tasuki Gap C+');
  // at(2) white bodyTop=30 ; at(1) white bodyBottom=40 (gap up over at(2)) bodyTop=60 ; at(0) black opens in at(1) body, closes in gap
  const build = () => [
    makeMetrics({ color: 'Black', open: 50, close: 35 }), // at(0): open in 40..60, close 35 (>at(2).bodyTop 30, <at(1).bodyBottom 40)
    makeMetrics({ color: 'White', bodyBottom: 40, bodyTop: 60 }), // at(1)
    makeMetrics({ color: 'White', bodyTop: 30, trend: 1 }), // at(2) oldest
  ];

  it('matches a gap-up white pair with a black closing into the gap in an uptrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not up', () => {
    const bars = build();
    bars[2] = makeMetrics({ color: 'White', bodyTop: 30, trend: -1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Downside Tasuki Gap C-', () => {
  const p = pattern('Downside Tasuki Gap C-');
  // at(2) black bodyBottom=60 ; at(1) black bodyTop=50 (gap down under at(2)) bodyBottom=30 ; at(0) white opens in at(1) body, closes in gap
  const build = () => [
    makeMetrics({ color: 'White', open: 40, close: 55 }), // at(0): open in 30..50, close 55 (>at(1).bodyTop 50, <at(2).bodyBottom 60)
    makeMetrics({ color: 'Black', bodyTop: 50, bodyBottom: 30 }), // at(1)
    makeMetrics({ color: 'Black', bodyBottom: 60, trend: -1 }), // at(2) oldest
  ];

  it('matches a gap-down black pair with a white closing into the gap in a downtrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not down', () => {
    const bars = build();
    bars[2] = makeMetrics({ color: 'Black', bodyBottom: 60, trend: 1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Side by Side White Lines C+', () => {
  const p = pattern('Side by Side White Lines C+');
  // at(2) long white bodyTop=40 ; at(1),at(0) white gapping above (bodyBottom>40), same open, same size
  const build = () => [
    makeMetrics({ color: 'White', open: 100, bodyBottom: 50, body: 10 }), // at(0)
    makeMetrics({ color: 'White', open: 100, bodyBottom: 50, body: 10 }), // at(1)
    makeMetrics({ bodyType: 'Long', color: 'White', bodyTop: 40, trend: 1 }), // at(2) oldest
  ];

  it('matches two same-open same-size white bars gapping above a long white bar in an uptrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not up', () => {
    const bars = build();
    bars[2] = makeMetrics({ bodyType: 'Long', color: 'White', bodyTop: 40, trend: -1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Side by Side White Lines C-', () => {
  const p = pattern('Side by Side White Lines C-');
  // at(2) long black bodyBottom=70 ; at(1),at(0) white gapping below (bodyTop<70), same open, same size
  const build = () => [
    makeMetrics({ color: 'White', open: 100, bodyTop: 50, body: 10 }), // at(0)
    makeMetrics({ color: 'White', open: 100, bodyTop: 50, body: 10 }), // at(1)
    makeMetrics({ bodyType: 'Long', color: 'Black', bodyBottom: 70, trend: -1 }), // at(2) oldest
  ];

  it('matches two same-open same-size white bars gapping below a long black bar in a downtrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not down', () => {
    const bars = build();
    bars[2] = makeMetrics({ bodyType: 'Long', color: 'Black', bodyBottom: 70, trend: 1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Side by Side Black Lines C+', () => {
  const p = pattern('Side by Side Black Lines C+');
  // at(2) long white bodyTop=40, close=40 ; at(1) black opens above at(2).close, body above gap (bodyBottom>40)
  // at(1) open=60 close=50 mid=55 ; at(0) black opens above 55, bodyBottom>40
  const build = () => [
    makeMetrics({ color: 'Black', open: 60, close: 45, bodyBottom: 45 }), // at(0): open 60>55, bodyBottom 45>40
    makeMetrics({ color: 'Black', open: 60, close: 50, bodyBottom: 50 }), // at(1): open 60>at(2).close 40, bodyBottom 50>40
    makeMetrics({ bodyDay: 'Long', color: 'White', bodyTop: 40, close: 40, trend: 1 }), // at(2) oldest
  ];

  it('matches a gap-up black pair not filling the gap above a long white bar in an uptrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not up', () => {
    const bars = build();
    bars[2] = makeMetrics({ bodyDay: 'Long', color: 'White', bodyTop: 40, close: 40, trend: -1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Side by Side Black Lines C-', () => {
  const p = pattern('Side by Side Black Lines C-');
  // at(2) long black bodyBottom=70, close=70 ; at(1) long black opens below at(2).close, bodyTop<70 (gap)
  // at(1) bodyTop=60 ; at(0) black opens above at(1).bodyTop but bodyTop<70 (gap not filled)
  const build = () => [
    makeMetrics({ color: 'Black', open: 65, bodyTop: 65 }), // at(0): open 65>at(1).bodyTop 60, bodyTop 65<70
    makeMetrics({ color: 'Black', bodyDay: 'Long', open: 55, bodyTop: 60 }), // at(1): open 55<at(2).close 70, bodyTop 60<70
    makeMetrics({ bodyDay: 'Long', color: 'Black', bodyBottom: 70, close: 70, trend: -1 }), // at(2) oldest
  ];

  it('matches a long black gapping below a long black, then a black opening higher but not filling the gap, in a downtrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not down', () => {
    const bars = build();
    bars[2] = makeMetrics({ bodyDay: 'Long', color: 'Black', bodyBottom: 70, close: 70, trend: 1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Upside Gap 3 Methods C+', () => {
  const p = pattern('Upside Gap 3 Methods C+');
  // at(0) black bodyTop=50 bodyBottom=40 ; at(1) white long straddling at0 top: bodyTop=60 bodyBottom=45
  // at(2) white long bodyTop<at1.bodyBottom(45)->42, >at0.bodyBottom(40) ; bodyBottom<40 ->30
  const build = () => [
    makeMetrics({ color: 'Black', bodyTop: 50, bodyBottom: 40 }), // at(0)
    makeMetrics({ bodyType: 'Long', color: 'White', bodyTop: 60, bodyBottom: 45 }), // at(1)
    makeMetrics({ bodyType: 'Long', color: 'White', bodyTop: 42, bodyBottom: 30, trend: 1 }), // at(2) oldest
  ];

  it('matches a gap-up filled by a black bar bridging the gap in an uptrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not up', () => {
    const bars = build();
    bars[2] = makeMetrics({
      bodyType: 'Long',
      color: 'White',
      bodyTop: 42,
      bodyBottom: 30,
      trend: -1,
    });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Downside Gap 3 Methods C-', () => {
  const p = pattern('Downside Gap 3 Methods C-');
  // at(0) white bodyTop=50 bodyBottom=40 ; at(1) black long straddling at0 bottom: bodyTop=46 bodyBottom=20
  // at(2) black long bodyBottom(47) > at1.bodyTop(46) and < at0.bodyTop(50) ; bodyTop(60) > at0.bodyTop(50)
  const build = () => [
    makeMetrics({ color: 'White', bodyTop: 50, bodyBottom: 40 }), // at(0)
    makeMetrics({ bodyType: 'Long', color: 'Black', bodyTop: 46, bodyBottom: 20 }), // at(1)
    makeMetrics({ bodyType: 'Long', color: 'Black', bodyTop: 60, bodyBottom: 47, trend: -1 }), // at(2) oldest
  ];

  it('matches a gap-down filled by a white bar bridging the gap in a downtrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not down', () => {
    const bars = build();
    bars[2] = makeMetrics({
      bodyType: 'Long',
      color: 'Black',
      bodyTop: 60,
      bodyBottom: 47,
      trend: 1,
    });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Rest After Battle C+', () => {
  const p = pattern('Rest After Battle C+');
  // Morris rules: at(2) (oldest) is a long white day in an uptrend whose high-low
  // range exceeds the average of the 5 immediately-preceding ranges (at(3..7)).
  const build = () => [
    makeMetrics({}), // at(0) unconstrained
    makeMetrics({}), // at(1) unconstrained
    makeMetrics({ bodyType: 'Long', bodyDay: 'Long', color: 'White', trend: 1, highLow: 5 }), // at(2) day-1
    makeMetrics({ highLow: 1 }), // at(3) prior day
    makeMetrics({ highLow: 1 }), // at(4)
    makeMetrics({ highLow: 1 }), // at(5)
    makeMetrics({ highLow: 1 }), // at(6)
    makeMetrics({ highLow: 1 }), // at(7)
  ];

  it('matches a long white first day, wider than the prior 5 ranges, in an uptrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not up', () => {
    const bars = build();
    bars[2] = makeMetrics({
      bodyType: 'Long',
      bodyDay: 'Long',
      color: 'White',
      trend: -1,
      highLow: 5,
    });
    expect(p.matches(makeAt(bars))).toBe(false);
  });

  it('rejects when the first day is not wider than the prior 5 ranges', () => {
    const bars = build();
    bars[2] = makeMetrics({
      bodyType: 'Long',
      bodyDay: 'Long',
      color: 'White',
      trend: 1,
      highLow: 0.5,
    });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Rising 3 Methods C+', () => {
  const p = pattern('Rising 3 Methods C+');
  // at(4) long white, high=100 low=0, close=50 ; at(0) long white close>50 ->60
  // at(3),at(2),at(1) short, bodyTop<100 bodyBottom>0 (within range)
  // drift down: at(1).bodyMid < at(3).bodyMid : set at(3).bodyMid via bodyTop/bodyBottom, use bodyMid override
  const build = () => [
    makeMetrics({ bodyType: 'Long', color: 'White', close: 60 }), // at(0)
    makeMetrics({ bodyType: 'Short', bodyTop: 30, bodyBottom: 20, bodyMid: 25 }), // at(1) low reaction
    makeMetrics({ bodyType: 'Short', bodyTop: 50, bodyBottom: 40, bodyMid: 45 }), // at(2)
    makeMetrics({ bodyType: 'Short', bodyTop: 90, bodyBottom: 70, bodyMid: 80 }), // at(3) high reaction
    makeMetrics({ bodyType: 'Long', color: 'White', high: 100, low: 0, close: 50, trend: 1 }), // at(4) oldest
  ];

  it('matches three small pullback bars inside a long white bar then a new-high close in an uptrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not up', () => {
    const bars = build();
    bars[4] = makeMetrics({
      bodyType: 'Long',
      color: 'White',
      high: 100,
      low: 0,
      close: 50,
      trend: -1,
    });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Falling 3 Methods C-', () => {
  const p = pattern('Falling 3 Methods C-');
  // at(4) long black, high=100 low=0 close=50 ; at(0) long black close<50 ->40
  // drift up: at(1).bodyMid > at(3).bodyMid
  const build = () => [
    makeMetrics({ bodyType: 'Long', color: 'Black', close: 40 }), // at(0)
    makeMetrics({ bodyType: 'Short', bodyTop: 90, bodyBottom: 70, bodyMid: 80 }), // at(1) high reaction
    makeMetrics({ bodyType: 'Short', bodyTop: 50, bodyBottom: 40, bodyMid: 45 }), // at(2)
    makeMetrics({ bodyType: 'Short', bodyTop: 30, bodyBottom: 20, bodyMid: 25 }), // at(3) low reaction
    makeMetrics({ bodyType: 'Long', color: 'Black', high: 100, low: 0, close: 50, trend: -1 }), // at(4) oldest
  ];

  it('matches three small rally bars inside a long black bar then a new-low close in a downtrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not down', () => {
    const bars = build();
    bars[4] = makeMetrics({
      bodyType: 'Long',
      color: 'Black',
      high: 100,
      low: 0,
      close: 50,
      trend: 1,
    });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Mat Hold C+', () => {
  const p = pattern('Mat Hold C+');
  // at(4) long white bodyTop=50 close=50 ; at(3) black bodyBottom=60 (gap up) bodyTop=80
  // at(2) bodyTop<at3.bodyTop(80)->70 bodyBottom<at3.bodyBottom(60)->50
  // at(1) bodyTop<at2.bodyTop(70)->60 bodyBottom<at2.bodyBottom(50)->40
  // at(0) long white close>at4.close(50) and >at3.bodyTop(80) ->90
  const build = () => [
    makeMetrics({ color: 'White', bodyType: 'Long', close: 90 }), // at(0)
    makeMetrics({ bodyTop: 60, bodyBottom: 40 }), // at(1)
    makeMetrics({ bodyTop: 70, bodyBottom: 50 }), // at(2)
    makeMetrics({ color: 'Black', bodyTop: 80, bodyBottom: 60 }), // at(3)
    makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 50, close: 50, trend: 1 }), // at(4) oldest
  ];

  it('matches a long white, a gapping black star, a downward drift, and a new-high breakout in an uptrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not up', () => {
    const bars = build();
    bars[4] = makeMetrics({ color: 'White', bodyType: 'Long', bodyTop: 50, close: 50, trend: -1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('Mat Hold C-', () => {
  const p = pattern('Mat Hold C-');
  // at(4) long black bodyBottom=60 ; at(3) white bodyTop=50 (gap down) bodyBottom=30 open=40
  // at(2) short bodyTop>at3.bodyTop(50)->60 bodyBottom>at3.bodyBottom(30)->40
  // at(1) short bodyTop>at2.bodyTop(60)->70 bodyBottom>at2.bodyBottom(40)->50 close=65
  // at(0) long black open<at1.close(65)->60 close<at3.open(40)->30
  const build = () => [
    makeMetrics({ color: 'Black', bodyType: 'Long', open: 60, close: 30 }), // at(0)
    makeMetrics({ bodyType: 'Short', bodyTop: 70, bodyBottom: 50, close: 65 }), // at(1)
    makeMetrics({ bodyType: 'Short', bodyTop: 60, bodyBottom: 40 }), // at(2)
    makeMetrics({ color: 'White', bodyTop: 50, bodyBottom: 30, open: 40 }), // at(3)
    makeMetrics({ color: 'Black', bodyType: 'Long', bodyBottom: 60, trend: -1 }), // at(4) oldest
  ];

  it('matches a long black, an upward drift of short bars, and a breakdown close in a downtrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not down', () => {
    const bars = build();
    bars[4] = makeMetrics({ color: 'Black', bodyType: 'Long', bodyBottom: 60, trend: 1 });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('3 Line Strike C+', () => {
  const p = pattern('3 Line Strike C+');
  // at(3),at(2),at(1) long white soldiers: rising closes, opens within prior body, near highs
  // at(0) black long: opens above at(1).close, closes below at(3).open
  const build = () => [
    makeMetrics({ color: 'Black', bodyType: 'Long', open: 90, close: 5 }), // at(0): open 90>at(1).close 70, close 5<at(3).open 10
    makeMetrics({
      color: 'White',
      bodyType: 'Long',
      open: 45,
      close: 70,
      bodyTop: 70,
      bodyBottom: 45,
      upperShadowHl: 5,
    }), // at(1): opens in at(2) body (30..50), close 70>at(2).close 50
    makeMetrics({
      color: 'White',
      bodyType: 'Long',
      open: 25,
      close: 50,
      bodyTop: 50,
      bodyBottom: 25,
      upperShadowHl: 5,
    }), // at(2): opens in at(3) body (10..30), close 50>at(3).close 30
    makeMetrics({
      color: 'White',
      bodyType: 'Long',
      open: 10,
      close: 30,
      bodyTop: 30,
      bodyBottom: 10,
      trend: 1,
    }), // at(3) oldest
  ];

  it('matches three rising white soldiers struck by a long black bar in an uptrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not up', () => {
    const bars = build();
    bars[3] = makeMetrics({
      color: 'White',
      bodyType: 'Long',
      open: 10,
      close: 30,
      bodyTop: 30,
      bodyBottom: 10,
      trend: -1,
    });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});

describe('3 Line Strike C-', () => {
  const p = pattern('3 Line Strike C-');
  // at(3),at(2),at(1) long black crows: falling closes, opens within prior body, near lows
  // at(0) white long: opens below at(1).close, closes above at(3).open
  const build = () => [
    makeMetrics({ color: 'White', bodyType: 'Long', open: 10, close: 100 }), // at(0): open 10<at(1).close 30, close 100>at(3).open 90
    makeMetrics({
      color: 'Black',
      bodyType: 'Long',
      open: 55,
      close: 30,
      bodyTop: 55,
      bodyBottom: 30,
      lowerShadowHl: 5,
    }), // at(1): opens in at(2) body (50..75), close 30<at(2).close 50
    makeMetrics({
      color: 'Black',
      bodyType: 'Long',
      open: 75,
      close: 50,
      bodyTop: 75,
      bodyBottom: 50,
      lowerShadowHl: 5,
    }), // at(2): opens in at(3) body (70..90), close 50<at(3).close 70
    makeMetrics({
      color: 'Black',
      bodyType: 'Long',
      open: 90,
      close: 70,
      bodyTop: 90,
      bodyBottom: 70,
      trend: -1,
    }), // at(3) oldest
  ];

  it('matches three falling black crows struck by a long white bar in a downtrend', () => {
    expect(p.matches(makeAt(build()))).toBe(true);
  });

  it('rejects when the oldest-bar trend is not down', () => {
    const bars = build();
    bars[3] = makeMetrics({
      color: 'Black',
      bodyType: 'Long',
      open: 90,
      close: 70,
      bodyTop: 90,
      bodyBottom: 70,
      trend: 1,
    });
    expect(p.matches(makeAt(bars))).toBe(false);
  });
});
