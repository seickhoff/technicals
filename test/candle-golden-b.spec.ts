import { describe, it } from 'vitest';
import { bar, context, expectNoPattern, expectPattern } from './candle-fixtures';

/**
 * Golden OHLC fixtures for patterns-b.ts, driven through the full pipeline.
 * Each pattern has a textbook true-positive plus a near-miss whose single
 * distinguishing condition is broken. For patterns whose coded predicate is
 * suspect, the true-positive matches CURRENT behavior (keeping the suite green)
 * and an `it.fails(...)` documents the canonical case the code mishandles.
 */

describe('Downside Gap Two Rabbits R+', () => {
  it('matches a white body gapping below a long black day in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(101.0, 101.1, 97.9, 98.0), // long black, body bottom 98
      bar(96.3, 97.5, 95.9, 97.2), // white body gapping below the black (top 97.2 < 98)
    ];
    expectPattern('Downside Gap Two Rabbits R+', bars);
  });

  it('does not match when the white body does not gap below the black body', () => {
    const bars = [
      ...context('down', 100),
      bar(101.0, 101.1, 97.9, 98.0),
      bar(96.0, 98.5, 95.9, 98.3), // body top 98.3 >= black body bottom 98 -> no gap
    ];
    expectNoPattern('Downside Gap Two Rabbits R+', bars);
  });
});

describe('Unique Three River Bottom R+', () => {
  it('matches a long black, a black harami with a lower low, and a small white in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.1, 99.9, 100.0), // long black
      bar(102.0, 102.1, 99.0, 101.5), // black body inside prior, new low 99.0
      bar(101.0, 101.2, 100.5, 101.2), // small white, opens above the low, closes below prior close
    ];
    expectPattern('Unique Three River Bottom R+', bars);
  });

  it('does not match when the middle candle does not undercut the first low', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.1, 99.9, 100.0),
      bar(102.0, 102.1, 100.2, 101.5), // low 100.2 > first low 99.9 -> no lower low
      bar(101.0, 101.2, 100.5, 101.2),
    ];
    expectNoPattern('Unique Three River Bottom R+', bars);
  });
});

describe('Unique Three Mountain Top R-', () => {
  it('matches a long white, a white with a higher high, and a small black in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(97.0, 100.1, 96.9, 100.0), // long white
      bar(98.0, 101.0, 97.9, 98.5), // white body inside prior, new high 101.0
      bar(99.0, 99.5, 98.8, 98.8), // small black, closes above prior close
    ];
    expectPattern('Unique Three Mountain Top R-', bars);
  });

  it('does not match when the middle candle does not exceed the first high', () => {
    const bars = [
      ...context('up', 100),
      bar(97.0, 100.1, 96.9, 100.0),
      bar(98.0, 99.8, 97.9, 98.5), // high 99.8 < first high 100.1 -> no higher high
      bar(99.0, 99.5, 98.8, 98.8),
    ];
    expectNoPattern('Unique Three Mountain Top R-', bars);
  });
});

describe('Three White Soldiers R+', () => {
  it('matches three rising white bodies, each opening within the prior body, in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(100.0, 102.1, 99.9, 102.0),
      bar(101.0, 103.1, 100.9, 103.0), // opens inside prior body
      bar(102.0, 104.1, 101.9, 104.0), // opens inside prior body
    ];
    expectPattern('Three White Soldiers R+', bars);
  });

  it('does not match when a soldier gaps open above the prior body', () => {
    const bars = [
      ...context('down', 100),
      bar(100.0, 102.1, 99.9, 102.0),
      bar(101.0, 103.1, 100.9, 103.0),
      bar(103.5, 105.1, 103.4, 105.0), // opens above prior close 103 -> not within body
    ];
    expectNoPattern('Three White Soldiers R+', bars);
  });
});

describe('Identical Three Crows R-', () => {
  it('matches three long black bodies opening near the prior close in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(106.0, 106.1, 103.9, 104.0), // long black
      bar(104.0, 104.1, 101.9, 102.0), // opens ~ prior close, long black
      bar(102.0, 102.1, 99.9, 100.0), // opens ~ prior close, long black
    ];
    expectPattern('Identical Three Crows R-', bars);
  });

  it('does not match when the crows gap open (identical spacing broken)', () => {
    const bars = [
      ...context('up', 100),
      bar(110.0, 110.1, 107.9, 108.0),
      bar(110.0, 110.1, 105.9, 106.0), // opens ~1.85% above prior close -> not identical
      bar(108.0, 108.1, 103.9, 104.0),
    ];
    expectNoPattern('Identical Three Crows R-', bars);
  });
});

describe('Three Black Crows R-', () => {
  it('matches three long black bodies, each opening within the prior body and closing at a new low, in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(110.0, 110.1, 105.9, 106.0), // long black, closes near its low
      bar(109.0, 109.1, 103.9, 104.0), // opens within the prior body, new closing low
      bar(107.0, 107.1, 101.9, 102.0), // opens within the prior body, new closing low
    ];
    expectPattern('Three Black Crows R-', bars);
  });

  it('does not match when opens hug the prior close (that is the identical variant)', () => {
    const bars = [
      ...context('up', 100),
      bar(103.0, 103.1, 101.9, 102.0),
      bar(102.0, 102.1, 100.9, 101.0),
      bar(101.0, 101.1, 99.9, 100.0),
    ];
    expectNoPattern('Three Black Crows R-', bars);
  });
});

describe('Advance Block R-', () => {
  it('matches three rising white bodies with growing upper shadows in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(100.0, 102.5, 99.9, 102.0), // long white
      bar(101.0, 104.0, 100.9, 102.5), // opens within prior body, long upper shadow
      bar(102.0, 104.5, 101.9, 103.0), // opens within prior body, long upper shadow
    ];
    expectPattern('Advance Block R-', bars);
  });

  it('does not match without the stalling upper shadows', () => {
    const bars = [
      ...context('up', 100),
      bar(100.0, 102.1, 99.9, 102.0),
      bar(101.0, 102.6, 100.9, 102.5), // upper shadow too small (< 40% of range)
      bar(102.0, 103.1, 101.9, 103.0),
    ];
    expectNoPattern('Advance Block R-', bars);
  });

  // Second candle gaps its open ABOVE the first body -> not an advance block.
  it('rejects a second candle gapping open above the first body', () => {
    const bars = [
      ...context('up', 100),
      bar(100.0, 102.5, 99.9, 102.0), // first body top 102
      bar(103.0, 105.0, 102.9, 103.5), // opens 103 > 102 -> gap up, not a block
      bar(103.2, 106.0, 103.1, 104.5),
    ];
    expectNoPattern('Advance Block R-', bars);
  });
});

describe('Descent Block R+', () => {
  it('matches three falling black bodies with growing lower shadows in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(100.0, 100.1, 97.5, 98.0), // long black
      bar(99.0, 99.1, 96.0, 97.5), // opens within prior body, long lower shadow
      bar(98.0, 98.1, 95.5, 97.0), // opens within prior body, long lower shadow
    ];
    expectPattern('Descent Block R+', bars);
  });

  it('does not match without the stalling lower shadows', () => {
    const bars = [
      ...context('down', 100),
      bar(100.0, 100.1, 97.9, 98.0),
      bar(99.0, 99.1, 97.4, 97.5), // lower shadow too small (< 40% of range)
      bar(98.0, 98.1, 96.9, 97.0),
    ];
    expectNoPattern('Descent Block R+', bars);
  });

  // Second candle gaps its open ABOVE the first body -> not a descent block.
  it('rejects a second candle gapping open above the first body', () => {
    const bars = [
      ...context('down', 100),
      bar(100.0, 100.1, 97.5, 98.0), // first body top 100
      bar(101.0, 101.1, 97.5, 99.0), // opens 101 > 100 -> gap up, not a block
      bar(99.5, 99.6, 96.5, 98.0),
    ];
    expectNoPattern('Descent Block R+', bars);
  });
});

describe('Deliberation R-', () => {
  it('matches two long rising white bodies then a small starred white in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(99.0, 102.1, 98.9, 102.0), // long white
      bar(101.0, 104.1, 100.9, 104.0), // long white, opens within prior body
      bar(104.05, 106.0, 102.0, 104.55), // spinning-top white opening near the prior close
    ];
    expectPattern('Deliberation R-', bars);
  });

  it('does not match when the star has no meaningful shadows', () => {
    const bars = [
      ...context('up', 100),
      bar(99.0, 102.1, 98.9, 102.0),
      bar(101.0, 104.1, 100.9, 104.0),
      bar(104.05, 105.1, 104.0, 104.55), // tiny shadows -> not a deliberation star
    ];
    expectNoPattern('Deliberation R-', bars);
  });
});

describe('Deliberation R+', () => {
  it('matches two long falling black bodies then a small black star in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.1, 99.9, 100.0), // long black
      bar(100.0, 100.1, 96.9, 97.0), // long black
      bar(96.0, 96.5, 94.5, 95.0), // small black star gapping below the prior body
    ];
    expectPattern('Deliberation R+', bars);
  });

  it('does not match when the third day is itself a long body', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.1, 99.9, 100.0),
      bar(100.0, 100.1, 96.9, 97.0),
      bar(96.0, 96.1, 91.9, 92.0), // long black third day -> not a small star
    ];
    expectNoPattern('Deliberation R+', bars);
  });
});

describe('Two Crows R-', () => {
  it('matches a long white, a gapped black, then a black closing into the white in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(99.0, 102.1, 98.9, 102.0), // long white
      bar(103.5, 103.6, 102.4, 102.5), // black gapping above the white body
      bar(103.0, 103.1, 100.4, 100.5), // long black opening in the gap, closing inside the white body
    ];
    expectPattern('Two Crows R-', bars);
  });

  it('does not match when the second crow does not close back into the white body', () => {
    const bars = [
      ...context('up', 100),
      bar(99.0, 102.1, 98.9, 102.0),
      bar(103.5, 103.6, 102.4, 102.5),
      bar(103.0, 103.1, 102.3, 102.4), // closes 102.4 above the white body top 102 -> no fill
    ];
    expectNoPattern('Two Crows R-', bars);
  });
});

describe('Two Rabbits R+', () => {
  it('matches a long black, a gapped-down white, then a white closing into the black in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.6, 99.9, 100.0), // long black
      bar(97.5, 98.1, 97.4, 98.0), // white gapping below the black body
      bar(97.6, 100.6, 97.5, 100.5), // white opening in the gap, closing inside the black body
    ];
    expectPattern('Two Rabbits R+', bars);
  });

  it('does not match when the middle white does not gap below the black body', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.6, 99.9, 100.0),
      bar(99.7, 100.1, 99.6, 100.0), // body top 100 ~ black body bottom -> gap too small
      bar(99.8, 100.6, 99.7, 100.5),
    ];
    expectNoPattern('Two Rabbits R+', bars);
  });
});

describe('Three Inside Up R+', () => {
  it('matches a long black, a contained white harami, then a white breaking above in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.1, 99.9, 100.0), // long black
      bar(100.5, 101.6, 100.4, 101.5), // white body inside the black body
      bar(101.0, 103.6, 100.9, 103.5), // white closes above the black body top
    ];
    expectPattern('Three Inside Up R+', bars);
  });

  it('does not match when the third candle fails to close above the first body top', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.1, 99.9, 100.0),
      bar(100.5, 101.6, 100.4, 101.5),
      bar(101.0, 102.6, 100.9, 102.5), // closes 102.5 below the black body top 103
    ];
    expectNoPattern('Three Inside Up R+', bars);
  });
});

describe('Three Inside Down R-', () => {
  it('matches a long white, a contained black harami, then a black breaking below in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(100.0, 103.1, 99.9, 103.0), // long white
      bar(102.5, 102.6, 101.4, 101.5), // black body inside the white body
      bar(102.0, 102.1, 99.4, 99.5), // black closes below the white body bottom
    ];
    expectPattern('Three Inside Down R-', bars);
  });

  it('does not match when the third candle fails to close below the first body bottom', () => {
    const bars = [
      ...context('up', 100),
      bar(100.0, 103.1, 99.9, 103.0),
      bar(102.5, 102.6, 101.4, 101.5),
      bar(102.0, 102.1, 100.4, 100.5), // closes 100.5 above the white body bottom 100
    ];
    expectNoPattern('Three Inside Down R-', bars);
  });
});

describe('Three Outside Up R+', () => {
  it('matches a short black, an engulfing white, then a higher white close in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(101.5, 101.6, 100.9, 101.0), // short black
      bar(100.5, 102.6, 100.4, 102.5), // long white engulfing the black body
      bar(102.0, 103.1, 101.9, 103.0), // white closing above the prior close
    ];
    expectPattern('Three Outside Up R+', bars);
  });

  it('does not match when the middle white does not engulf the black body', () => {
    const bars = [
      ...context('down', 100),
      bar(101.5, 101.6, 100.9, 101.0),
      bar(101.1, 101.4, 101.0, 101.3), // stays inside the black body -> no engulf
      bar(101.4, 102.1, 101.3, 102.0),
    ];
    expectNoPattern('Three Outside Up R+', bars);
  });
});

describe('Three Outside Down R-', () => {
  it('matches a short white, an engulfing black, then a black in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(101.0, 101.6, 100.9, 101.5), // short white
      bar(102.5, 102.6, 100.4, 100.5), // long black engulfing the white body
      bar(100.0, 100.1, 98.9, 99.0), // black continuation
    ];
    expectPattern('Three Outside Down R-', bars);
  });

  it('does not match when the middle black does not engulf the white body', () => {
    const bars = [
      ...context('up', 100),
      bar(101.0, 101.6, 100.9, 101.5),
      bar(101.4, 101.5, 101.1, 101.2), // stays inside the white body -> no engulf
      bar(101.1, 101.2, 100.4, 100.5),
    ];
    expectNoPattern('Three Outside Down R-', bars);
  });
});

describe('Three Stars in the South R+', () => {
  it('matches a long black with a long lower shadow, then a smaller black, then a small black marubozu inside it', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.1, 97.0, 100.0), // long black, lower shadow >= body
      bar(101.0, 101.1, 98.2, 99.0), // smaller black, low rises above the first low
      bar(99.5, 99.55, 98.9, 98.95), // small black marubozu inside the middle day's range
    ];
    expectPattern('Three Stars in the South R+', bars);
  });

  it('does not match when the third day trades outside the middle day range', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.1, 97.0, 100.0),
      bar(101.0, 101.1, 98.2, 99.0),
      bar(99.5, 99.55, 97.9, 98.0), // low 97.9 < middle low 98.2 -> not inside
    ];
    expectNoPattern('Three Stars in the South R+', bars);
  });
});

describe('Three Stars in the North R-', () => {
  it('matches a long white with a long upper shadow, then two whites with the middle closing higher, in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(98.0, 103.0, 97.9, 100.0), // long white, long upper shadow
      bar(99.0, 102.5, 98.9, 101.0), // white, closes higher, high below the first
      bar(100.0, 101.6, 99.9, 101.5), // white with a long real body
    ];
    expectPattern('Three Stars in the North R-', bars);
  });

  it('does not match when the middle candle has no long upper shadow', () => {
    const bars = [
      ...context('up', 100),
      bar(98.0, 103.0, 97.9, 100.0),
      bar(99.0, 101.1, 98.9, 101.0), // upper shadow ~0 (close ~ high) -> not a star
      bar(100.0, 101.6, 99.9, 101.5),
    ];
    expectNoPattern('Three Stars in the North R-', bars);
  });

  // Morris rule 5 requires the third day to be a small WHITE Marubozu, so a black
  // third candle is (correctly) not a Three Stars in the North.
  it.fails('does not accept a small black reversal third candle', () => {
    const bars = [
      ...context('up', 100),
      bar(98.0, 103.0, 97.9, 100.0),
      bar(99.0, 102.5, 98.9, 101.0),
      bar(101.4, 101.6, 100.0, 100.5), // small black third candle
    ];
    expectPattern('Three Stars in the North R-', bars);
  });
});

describe('Stick Sandwich R+', () => {
  it('matches a black, a higher white, then a black closing at the first close in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(101.5, 101.6, 99.9, 100.0), // black, closes at 100
      bar(102.0, 103.6, 101.9, 103.5), // white bread rises above
      bar(105.0, 105.1, 99.9, 100.0), // black, closes back at 100 (the meat)
    ];
    expectPattern('Stick Sandwich R+', bars);
  });

  it('does not match when the two black closes differ materially', () => {
    const bars = [
      ...context('down', 100),
      bar(101.5, 101.6, 99.9, 100.0),
      bar(102.0, 103.6, 101.9, 103.5),
      bar(105.0, 105.1, 100.9, 101.0), // closes 101.0 (1%) != first close 100 -> not a sandwich
    ];
    expectNoPattern('Stick Sandwich R+', bars);
  });
});

describe('Stick Sandwich R-', () => {
  it('matches a white, a black opening/closing below it, then a white engulfing the black in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(100.0, 102.1, 99.9, 102.0), // white, close 102, open 100
      bar(99.5, 99.6, 98.4, 98.5), // black opens 99.5 < 102 and closes 98.5 < 100
      bar(97.5, 102.6, 97.4, 102.5), // white engulfing the black body (97.5..102.5 wraps 98.5..99.5)
    ];
    expectPattern('Stick Sandwich R-', bars);
  });

  it('does not match when the third white fails to engulf the black body', () => {
    const bars = [
      ...context('up', 100),
      bar(100.0, 102.1, 99.9, 102.0),
      bar(99.5, 99.6, 98.4, 98.5),
      bar(99.0, 99.4, 98.9, 99.3), // body 99.0..99.3 does not engulf the black body 98.5..99.5
    ];
    expectNoPattern('Stick Sandwich R-', bars);
  });
});

describe('Squeeze Alert R+', () => {
  it('matches a long black day then two contracting bars in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(101.5, 103.0, 98.0, 99.0), // long black, widest
      bar(100.0, 102.0, 99.0, 101.0), // lower high, higher low (any color)
      bar(100.5, 101.5, 99.5, 101.0), // narrowest
    ];
    expectPattern('Squeeze Alert R+', bars);
  });

  it('does not match when the range expands instead of contracting', () => {
    const bars = [
      ...context('down', 100),
      bar(101.5, 102.0, 99.0, 99.5), // long black
      bar(100.5, 102.5, 98.5, 99.5),
      bar(101.0, 103.0, 98.0, 99.0), // widest is the last bar -> expanding
    ];
    expectNoPattern('Squeeze Alert R+', bars);
  });

  it('does not match when the first day is not a relatively long day', () => {
    const bars = [
      ...context('down', 100),
      bar(100.4, 103.0, 98.0, 100.0), // short black first day
      bar(100.0, 102.0, 99.0, 101.0),
      bar(100.5, 101.5, 99.5, 101.0),
    ];
    expectNoPattern('Squeeze Alert R+', bars);
  });
});

describe('Squeeze Alert R-', () => {
  it('matches a long white day then two contracting bars in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(97.5, 102.0, 97.0, 101.0), // long white, widest
      bar(99.0, 101.0, 98.0, 100.0), // lower high, higher low (any color)
      bar(99.5, 100.5, 98.5, 100.0), // narrowest
    ];
    expectPattern('Squeeze Alert R-', bars);
  });

  it('does not match when the range expands instead of contracting', () => {
    const bars = [
      ...context('up', 100),
      bar(98.5, 101.0, 98.0, 100.5), // long white
      bar(99.5, 101.5, 97.5, 101.0),
      bar(99.0, 102.0, 97.0, 101.5), // widest is the last bar -> expanding
    ];
    expectNoPattern('Squeeze Alert R-', bars);
  });

  it('does not match when the first day is not a relatively long day', () => {
    const bars = [
      ...context('up', 100),
      bar(100.0, 102.0, 97.0, 100.4), // short white first day
      bar(99.0, 101.0, 98.0, 100.0),
      bar(99.5, 100.5, 98.5, 100.0),
    ];
    expectNoPattern('Squeeze Alert R-', bars);
  });
});

describe('Breakaway R+', () => {
  it('matches a black top, a gapped-down declining trio, then a white rebounding into the gap in a downtrend', () => {
    const bars = [
      ...context('down', 110),
      bar(108.0, 108.1, 105.9, 106.0), // long black, body bottom 106
      bar(105.0, 105.1, 103.9, 104.0), // gaps below the black
      bar(104.0, 104.1, 102.9, 103.0), // declining
      bar(103.0, 103.1, 101.9, 102.0), // declining
      bar(102.5, 105.6, 102.4, 105.5), // long white closing back into the gap (105 < top < 106)
    ];
    expectPattern('Breakaway R+', bars);
  });

  it('does not match when the final white overshoots into the black body', () => {
    const bars = [
      ...context('down', 110),
      bar(108.0, 108.1, 105.9, 106.0),
      bar(105.0, 105.1, 103.9, 104.0),
      bar(104.0, 104.1, 102.9, 103.0),
      bar(103.0, 103.1, 101.9, 102.0),
      bar(102.5, 107.1, 102.4, 107.0), // body top 107 >= black body bottom 106 -> overshoot
    ];
    expectNoPattern('Breakaway R+', bars);
  });
});

describe('Breakaway R-', () => {
  it('matches a white bottom, a gapped-up rising trio, then a black falling into the gap in an uptrend', () => {
    const bars = [
      ...context('up', 90),
      bar(92.0, 94.0, 91.9, 94.0), // long white, body top 94
      bar(95.0, 96.1, 94.1, 96.0), // gaps above the white
      bar(96.0, 97.1, 95.9, 97.0), // rising
      bar(97.0, 98.1, 96.9, 98.0), // rising
      bar(97.5, 97.6, 94.4, 94.5), // long black closing back into the gap (94 < bottom < 95)
    ];
    expectPattern('Breakaway R-', bars);
  });

  it('does not match when the final black overshoots into the white body', () => {
    const bars = [
      ...context('up', 90),
      bar(92.0, 94.0, 91.9, 94.0),
      bar(95.0, 96.1, 94.1, 96.0),
      bar(96.0, 97.1, 95.9, 97.0),
      bar(97.0, 98.1, 96.9, 98.0),
      bar(97.5, 97.6, 92.9, 93.0), // body bottom 93 <= white body top 94 -> overshoot
    ];
    expectNoPattern('Breakaway R-', bars);
  });
});
