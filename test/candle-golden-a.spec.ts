import { describe, it } from 'vitest';
import { bar, context, expectNoPattern, expectPattern } from './candle-fixtures';

/**
 * Golden OHLC fixtures for patterns-a.ts, driven through the full pipeline.
 * Each pattern has a textbook true-positive plus at least one near-miss whose
 * single distinguishing condition is broken (wrong trend, no engulf, shallow
 * penetration, no gap, ...) to prove the rule discriminates rather than just fires.
 */

describe('Hammer R+', () => {
  it('matches a small body with a long lower shadow after a downtrend', () => {
    const bars = [...context('down', 100), bar(100.0, 100.5, 98.5, 100.5)];
    expectPattern('Hammer R+', bars);
  });

  it('does not match the same candle after an uptrend', () => {
    const bars = [...context('up', 100), bar(100.0, 100.5, 98.5, 100.5)];
    expectNoPattern('Hammer R+', bars);
  });
});

describe('Hanging Man R-', () => {
  it('matches a small body with a long lower shadow after an uptrend', () => {
    const bars = [...context('up', 100), bar(100.0, 100.5, 98.5, 100.5)];
    expectPattern('Hanging Man R-', bars);
  });

  it('does not match the same candle after a downtrend', () => {
    const bars = [...context('down', 100), bar(100.0, 100.5, 98.5, 100.5)];
    expectNoPattern('Hanging Man R-', bars);
  });
});

describe('Belt Hold R+', () => {
  it('matches a long white opening marubozu (no lower shadow) in a downtrend', () => {
    const bars = [...context('down', 100), bar(99.0, 101.3, 99.0, 101.0)];
    expectPattern('Belt Hold R+', bars);
  });

  it('does not match when there is a lower shadow', () => {
    const bars = [...context('down', 100), bar(99.0, 101.3, 98.5, 101.0)];
    expectNoPattern('Belt Hold R+', bars);
  });
});

describe('Belt Hold R-', () => {
  it('matches a long black opening marubozu (no upper shadow) in an uptrend', () => {
    const bars = [...context('up', 100), bar(101.0, 101.0, 98.7, 99.0)];
    expectPattern('Belt Hold R-', bars);
  });

  it('does not match when there is an upper shadow', () => {
    const bars = [...context('up', 100), bar(101.0, 101.5, 98.7, 99.0)];
    expectNoPattern('Belt Hold R-', bars);
  });
});

describe('Engulfing R+', () => {
  it('matches a long white body engulfing a prior short black body in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(100.5, 100.6, 99.9, 100.0), // prior: short black
      bar(99.6, 101.5, 99.5, 101.4), // current: long white, engulfs
    ];
    expectPattern('Engulfing R+', bars);
  });

  it('does not match when the white body fails to engulf the prior body', () => {
    const bars = [
      ...context('down', 100),
      bar(100.5, 100.6, 99.9, 100.0),
      bar(100.1, 100.9, 100.0, 100.8), // opens above prior close -> no engulf
    ];
    expectNoPattern('Engulfing R+', bars);
  });
});

describe('Harami R+', () => {
  it('matches a small white body contained inside a prior long black body in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(102.0, 102.1, 99.9, 100.0), // prior: long black
      bar(100.3, 101.0, 100.2, 100.9), // current: short white, inside prior body
    ];
    expectPattern('Harami R+', bars);
  });

  it('does not match when the second body is not contained (engulfs instead)', () => {
    const bars = [
      ...context('down', 100),
      bar(102.0, 102.1, 99.9, 100.0),
      bar(99.5, 102.6, 99.4, 102.5), // breaks out of the prior body
    ];
    expectNoPattern('Harami R+', bars);
  });
});

describe('Piercing Line R+', () => {
  it('matches a long white opening below the prior LOW and closing past the midpoint in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.1, 99.9, 100.0), // prior: long black, low 99.9, body midpoint 101.5
      bar(99.5, 102.1, 99.4, 102.0), // opens 99.5 (below prior low), closes past midpoint
    ];
    expectPattern('Piercing Line R+', bars);
  });

  it('does not match when the close only reaches below the midpoint (shallow)', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.1, 99.9, 100.0),
      bar(99.5, 101.1, 99.4, 101.0), // closes below the 101.5 midpoint
    ];
    expectNoPattern('Piercing Line R+', bars);
  });

  it('does not match when the white opens above the prior low (not below it)', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.1, 99.9, 100.0), // prior low 99.9
      bar(100.5, 102.1, 100.4, 102.0), // opens 100.5, above the prior low
    ];
    expectNoPattern('Piercing Line R+', bars);
  });
});

describe('Shooting Star R-', () => {
  it('matches a small body at the low end with a long upper shadow, gapping up in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(99.0, 100.0, 98.9, 100.0), // prior bar (body top 100)
      bar(101.4, 102.7, 101.0, 101.0), // small black body, long upper shadow, gap up
    ];
    expectPattern('Shooting Star R-', bars);
  });

  it('does not match without the long upper shadow', () => {
    const bars = [
      ...context('up', 100),
      bar(99.0, 100.0, 98.9, 100.0),
      bar(101.4, 101.5, 101.0, 101.0), // upper shadow too small
    ];
    expectNoPattern('Shooting Star R-', bars);
  });
});

describe('Kicking R+', () => {
  it('matches a black marubozu followed by a gapped-up white marubozu (no trend needed)', () => {
    const bars = [
      ...context('down', 100),
      bar(100.0, 100.0, 98.0, 98.0), // black marubozu (no shadows)
      bar(101.0, 103.0, 101.0, 103.0), // white marubozu, gaps above the black
    ];
    expectPattern('Kicking R+', bars);
  });

  it('does not match when the second candle has shadows (not a marubozu)', () => {
    const bars = [
      ...context('down', 100),
      bar(100.0, 100.0, 98.0, 98.0),
      bar(101.0, 103.5, 100.5, 103.0), // shadows -> not a marubozu
    ];
    expectNoPattern('Kicking R+', bars);
  });
});

describe('One White Soldier R+', () => {
  it('matches when the white closes above the prior HIGH after a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.5, 99.9, 100.0), // prior long black, high 103.5
      bar(101.0, 103.9, 100.9, 103.8), // white opens >= prior close, closes above prior high
    ];
    expectPattern('One White Soldier R+', bars);
  });

  // Morris rule 2 requires the white day to close "above the high of the previous
  // day." A soldier that closes above the prior OPEN but below the prior HIGH
  // (close 103.3 < prior high 103.5) is therefore NOT a One White Soldier.
  it('does not match a white that closes below the prior high', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.5, 99.9, 100.0),
      bar(101.0, 103.4, 100.9, 103.3),
    ];
    expectNoPattern('One White Soldier R+', bars);
  });
});

describe('Dark Cloud Cover R-', () => {
  it('matches a black opening above the prior HIGH and closing below the midpoint in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(99.0, 101.1, 98.9, 101.0), // prior: long white, high 101.1 (mid 100.0)
      bar(102.0, 102.1, 99.4, 99.5), // opens 102.0 (above prior high), closes below midpoint
    ];
    expectPattern('Dark Cloud Cover R-', bars);
  });

  it('does not match when the close only dips to the top of the prior body (shallow penetration)', () => {
    const bars = [
      ...context('up', 100),
      bar(99.0, 101.1, 98.9, 101.0),
      bar(102.0, 102.1, 100.6, 100.7), // closes above midpoint -> not dark cloud
    ];
    expectNoPattern('Dark Cloud Cover R-', bars);
  });

  it('does not match when the black opens below the prior high (not above it)', () => {
    const bars = [
      ...context('up', 100),
      bar(99.0, 101.1, 98.9, 101.0), // prior high 101.1
      bar(100.8, 100.9, 99.4, 99.5), // opens 100.8, below the prior high
    ];
    expectNoPattern('Dark Cloud Cover R-', bars);
  });
});

describe('Morning Star R+', () => {
  it('matches long-black, gapped-down star, long-white in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.1, 99.9, 100.0), // first: long black
      bar(99.0, 99.6, 98.8, 99.4), // star: short, below the first body
      bar(99.6, 102.1, 99.5, 102.0), // third: long white, closes into first body
    ];
    expectPattern('Morning Star R+', bars);
  });

  it('does not match when the middle candle is not gapped below the first body', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.1, 99.9, 100.0),
      bar(100.5, 101.0, 100.2, 100.8), // star overlaps first body -> no star
      bar(100.6, 102.1, 100.5, 102.0),
    ];
    expectNoPattern('Morning Star R+', bars);
  });

  it('does not match when only the middle bar (not the first day) is in a downtrend', () => {
    // Trend is pinned to the first day of the pattern (at(2)). Warm up flat/up so
    // the first day is not in a downtrend even though the star dips.
    const bars = [
      ...context('up', 100),
      bar(103.0, 103.1, 99.9, 100.0),
      bar(99.0, 99.6, 98.8, 99.4),
      bar(99.6, 102.1, 99.5, 102.0),
    ];
    expectNoPattern('Morning Star R+', bars);
  });
});

describe('Belt Hold R-', () => {
  it('matches a long black opening on its high (no upper shadow) in an uptrend', () => {
    const bars = [...context('up', 100), bar(101.0, 101.0, 98.7, 99.0)];
    expectPattern('Belt Hold R-', bars);
  });

  it('does not match when there is an upper shadow', () => {
    const bars = [...context('up', 100), bar(101.0, 101.5, 98.7, 99.0)];
    expectNoPattern('Belt Hold R-', bars);
  });
});

describe('Inverted Hammer R+', () => {
  it('matches a short body at the low with a long upper shadow after a downtrend', () => {
    const bars = [...context('down', 100), bar(100.0, 100.9, 99.98, 100.4)];
    expectPattern('Inverted Hammer R+', bars);
  });

  it('does not match after an uptrend', () => {
    const bars = [...context('up', 100), bar(100.0, 100.9, 99.98, 100.4)];
    expectNoPattern('Inverted Hammer R+', bars);
  });
});

describe('Doji Star R+', () => {
  it('matches a doji gapping below a prior long black body in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.1, 99.9, 100.0), // long black
      bar(98.5, 99.0, 98.0, 98.51), // doji, body gaps below the black body
    ];
    expectPattern('Doji Star R+', bars);
  });

  it('does not match when the doji body does not gap below the prior body', () => {
    const bars = [
      ...context('down', 100),
      bar(103.0, 103.1, 99.9, 100.0),
      bar(100.5, 101.0, 100.0, 100.51), // overlaps the prior body -> no gap
    ];
    expectNoPattern('Doji Star R+', bars);
  });
});

describe('Meeting Lines R+', () => {
  it('matches a long white closing at the prior long black close in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(104.0, 104.1, 99.9, 100.0), // long black, close 100.0
      bar(96.0, 100.1, 95.9, 100.02), // long white, close ~= 100.0
    ];
    expectPattern('Meeting Lines R+', bars);
  });

  it('does not match when the closes differ well beyond tolerance', () => {
    const bars = [
      ...context('down', 100),
      bar(104.0, 104.1, 99.9, 100.0),
      bar(96.0, 102.1, 95.9, 102.0), // close 102.0, far from 100.0
    ];
    expectNoPattern('Meeting Lines R+', bars);
  });
});

describe('Homing Pigeon R+', () => {
  it('matches a short black body inside a prior long black body in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(104.0, 104.1, 99.9, 100.0), // long black
      bar(101.5, 101.6, 100.5, 100.6), // short black, inside the prior body
    ];
    expectPattern('Homing Pigeon R+', bars);
  });

  it('does not match when the second body is not contained', () => {
    const bars = [
      ...context('down', 100),
      bar(104.0, 104.1, 99.9, 100.0),
      bar(105.0, 105.1, 104.4, 104.5), // above the prior body
    ];
    expectNoPattern('Homing Pigeon R+', bars);
  });
});

describe('Descending Hawk R-', () => {
  it('matches a long white body engulfed by a prior long white body in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(96.0, 100.2, 95.9, 100.0), // long white
      bar(97.0, 99.6, 96.9, 99.5), // long white, inside the prior body
    ];
    expectPattern('Descending Hawk R-', bars);
  });

  it('does not match when the second white body is not contained', () => {
    const bars = [
      ...context('up', 100),
      bar(96.0, 100.2, 95.9, 100.0),
      bar(95.0, 101.1, 94.9, 101.0), // breaks out of the prior body
    ];
    expectNoPattern('Descending Hawk R-', bars);
  });
});

describe('Matching Low R+', () => {
  it('matches two black bodies sharing a close in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(104.0, 104.1, 99.9, 100.0), // long black, close 100.0
      bar(101.5, 101.6, 99.9, 100.02), // black, close ~= 100.0 (within tolerance)
    ];
    expectPattern('Matching Low R+', bars);
  });

  it('does not match when the closes differ beyond tolerance', () => {
    const bars = [
      ...context('down', 100),
      bar(104.0, 104.1, 99.9, 100.0),
      bar(102.5, 102.6, 101.0, 101.1), // close 101.1, not matching
    ];
    expectNoPattern('Matching Low R+', bars);
  });
});

describe('Matching High R-', () => {
  it('matches two white bodies sharing a close with little upper shadow in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(96.0, 100.05, 95.9, 100.0), // long white, close 100.0, tiny upper shadow
      bar(98.0, 100.04, 97.9, 100.0), // white, close 100.0, tiny upper shadow
    ];
    expectPattern('Matching High R-', bars);
  });

  it('does not match when the second day has a large upper shadow', () => {
    const bars = [
      ...context('up', 100),
      bar(96.0, 100.05, 95.9, 100.0),
      bar(98.0, 102.0, 97.9, 100.0), // long upper shadow -> not a matching high
    ];
    expectNoPattern('Matching High R-', bars);
  });
});

describe('One Black Crow R-', () => {
  it('matches a long black closing below the prior LOW after an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(96.0, 100.1, 95.9, 100.0), // long white, low 95.9
      bar(99.0, 99.1, 95.0, 95.1), // black opens <= prior close, closes below prior low
    ];
    expectPattern('One Black Crow R-', bars);
  });

  it('does not match when the black closes above the prior low', () => {
    const bars = [
      ...context('up', 100),
      bar(96.0, 100.1, 95.9, 100.0),
      bar(99.0, 99.1, 97.0, 97.1), // close 97.1 stays above the prior low
    ];
    expectNoPattern('One Black Crow R-', bars);
  });
});

describe('Evening Star R-', () => {
  it('matches long-white, gapped-up star, long-black in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(96.0, 100.1, 95.9, 100.0), // first: long white
      bar(101.0, 101.6, 100.9, 101.4), // star: short, above the first body
      bar(100.8, 100.9, 96.9, 97.0), // third: long black
    ];
    expectPattern('Evening Star R-', bars);
  });

  it('does not match when the first day is not in an uptrend', () => {
    const bars = [
      ...context('down', 100),
      bar(96.0, 100.1, 95.9, 100.0),
      bar(101.0, 101.6, 100.9, 101.4),
      bar(100.8, 100.9, 96.9, 97.0),
    ];
    expectNoPattern('Evening Star R-', bars);
  });
});

describe('Abandoned Baby R+', () => {
  it('matches long-black, shadow-isolated doji, long-white in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(104.0, 104.1, 100.0, 100.1), // long black, low 100.0
      bar(99.0, 99.2, 98.8, 99.0), // doji, high 99.2 below the black low
      bar(100.5, 104.0, 100.4, 103.9), // long white, low 100.4 above the doji high
    ];
    expectPattern('Abandoned Baby R+', bars);
  });

  it('does not match when the third day shadow overlaps the doji', () => {
    const bars = [
      ...context('down', 100),
      bar(104.0, 104.1, 100.0, 100.1),
      bar(99.0, 99.2, 98.8, 99.0),
      bar(99.1, 104.0, 98.9, 103.9), // low 98.9 overlaps the doji -> no gap
    ];
    expectNoPattern('Abandoned Baby R+', bars);
  });
});

describe('Tri Star R-', () => {
  it('matches three dojis with the middle one gapping up in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(100.0, 100.5, 99.5, 100.005), // doji
      bar(102.0, 102.5, 101.5, 102.005), // doji, gaps above
      bar(100.0, 100.5, 99.5, 100.005), // doji
    ];
    expectPattern('Tri Star R-', bars);
  });

  it('does not match when the middle doji does not gap above the others', () => {
    const bars = [
      ...context('up', 100),
      bar(100.0, 100.5, 99.5, 100.005),
      bar(100.0, 100.5, 99.5, 100.005), // same level as the others -> no gap
      bar(100.0, 100.5, 99.5, 100.005),
    ];
    expectNoPattern('Tri Star R-', bars);
  });
});

describe('Upside Gap Two Crows R-', () => {
  it('matches long-white, gapped-up black, engulfing black above it in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(96.0, 100.1, 95.9, 100.0), // first: long white
      bar(101.0, 101.1, 100.6, 100.7), // second: black, body gaps above the white
      bar(102.0, 102.1, 100.4, 100.5), // third: black, engulfs the second, closes above the white
    ];
    expectPattern('Upside Gap Two Crows R-', bars);
  });

  it('does not match when the black does not gap above the first white body', () => {
    const bars = [
      ...context('up', 100),
      bar(96.0, 100.1, 95.9, 100.0),
      bar(100.0, 100.1, 99.6, 99.7), // no upward gap over the white body
      bar(101.0, 101.1, 99.4, 99.5),
    ];
    expectNoPattern('Upside Gap Two Crows R-', bars);
  });
});
