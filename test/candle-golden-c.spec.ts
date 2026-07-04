import { describe, it } from 'vitest';
import { bar, context, expectNoPattern, expectPattern } from './candle-fixtures';

/**
 * Golden OHLC fixtures for patterns-c.ts, driven through the full pipeline.
 *
 * Each pattern gets a textbook Morris true-positive that PASSES the code plus a
 * near-miss whose single distinguishing Morris condition is broken. After the
 * Morris-compliance pass the patterns implement their "Rules of Recognition"
 * faithfully, so every fixture is a canonical example (no anti-canonical shapes,
 * no it.fails documenting known bugs).
 *
 * Reminder: at(0) = LAST bar, at(length-1) = OLDEST. Bars are appended oldest->newest.
 * "Long" = body >= 1.3x the 10-bar average body, so long candles are sized generously.
 */

describe('Concealing Baby Swallow R+', () => {
  it('matches two black marubozu, a gap-down black with a long upper shadow, then an engulfing black, in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(108.0, 108.0, 106.0, 106.0), // at3 black marubozu
      bar(105.0, 105.0, 103.0, 103.0), // at2 black marubozu, bodyBottom 103
      bar(102.5, 104.0, 100.8, 101.0), // at1 black, gaps down, trades up into at2 body (high 104 > 103), long upper shadow
      bar(104.5, 104.6, 100.5, 100.6), // at0 black, engulfs at1 incl. shadows
    ];
    expectPattern('Concealing Baby Swallow R+', bars);
  });

  it('does not match when the third bar lacks the long upper shadow', () => {
    const bars = [
      ...context('down', 100),
      bar(108.0, 108.0, 106.0, 106.0),
      bar(105.0, 105.0, 103.0, 103.0),
      bar(102.5, 102.8, 100.8, 101.0), // high 102.8 < at2.bodyBottom 103 -> no trade into prior body / no long upper shadow
      bar(104.5, 104.6, 100.5, 100.6),
    ];
    expectNoPattern('Concealing Baby Swallow R+', bars);
  });
});

describe('Ladder Bottom R+', () => {
  it('matches three long black bars with lower opens and closes, a black bar with an upper shadow, then a white gapping above, in a downtrend', () => {
    const bars = [
      ...context('down', 105),
      bar(114.0, 114.1, 110.9, 111.0), // at4 long black, open 114 close 111
      bar(111.0, 111.1, 107.9, 108.0), // at3 long black, lower open (111<114) and close (108<111)
      bar(108.0, 108.1, 104.9, 105.0), // at2 long black, lower open (108<111) and close (105<108)
      bar(105.5, 106.5, 104.0, 104.5), // at1 black, bodyTop 105.5, tall upper shadow (1.0/2.5 = 40% of range)
      bar(107.0, 108.0, 106.9, 107.9), // at0 white, opens 107 above at1's body top (105.5)
    ];
    expectPattern('Ladder Bottom R+', bars);
  });

  it('does not match when the fourth bar lacks the tall upper shadow', () => {
    const bars = [
      ...context('down', 105),
      bar(114.0, 114.1, 110.9, 111.0),
      bar(111.0, 111.1, 107.9, 108.0),
      bar(108.0, 108.1, 104.9, 105.0),
      bar(105.5, 105.6, 104.0, 104.5), // upper shadow now tiny (<40% of range)
      bar(107.0, 108.0, 106.9, 107.9),
    ];
    expectNoPattern('Ladder Bottom R+', bars);
  });
});

describe('Ladder Top R-', () => {
  it('matches three long white bars with higher opens and closes, a white with a long lower shadow, then a black closing below, in an uptrend', () => {
    const bars = [
      ...context('up', 105),
      bar(96.0, 99.1, 95.9, 99.0), // at4 long white, open 96 close 99
      bar(99.0, 102.1, 98.9, 102.0), // at3 long white, higher open (99>96) and close (102>99)
      bar(102.0, 105.1, 101.9, 105.0), // at2 long white, higher open (102>99) and close (105>102)
      bar(105.5, 106.0, 101.5, 105.9), // at1 white, long lower shadow reaching into at2's body (low 101.5 < at2.bodyBottom 102)
      bar(104.5, 104.6, 100.5, 101.0), // at0 black, opens below at1 body bottom (105.5), closes below at1 low (101.5)
    ];
    expectPattern('Ladder Top R-', bars);
  });

  it('does not match when the fifth black fails to close below the fourth bar low', () => {
    const bars = [
      ...context('up', 105),
      bar(96.0, 99.1, 95.9, 99.0),
      bar(99.0, 102.1, 98.9, 102.0),
      bar(102.0, 105.1, 101.9, 105.0),
      bar(105.5, 106.0, 101.5, 105.9),
      bar(104.5, 104.6, 101.9, 102.0), // close 102.0 > at1 low 101.5 -> no breakdown
    ];
    expectNoPattern('Ladder Top R-', bars);
  });
});

describe('After Bottom Gap Up R+', () => {
  it('matches a long black then two black closing lower with a gap down, then two long whites gapping up, in a downtrend', () => {
    const bars = [
      ...context('down', 106),
      bar(114.0, 114.1, 109.9, 110.0), // at4 long black
      bar(109.5, 109.6, 107.9, 108.0), // at3 black, closes lower (108<110)
      bar(106.0, 106.1, 104.9, 105.0), // at2 black, closes lower (105<108), opens 106 below at3.close 108 (gap down)
      bar(103.0, 107.1, 102.9, 107.0), // at1 long white
      bar(108.0, 111.1, 107.9, 111.0), // at0 long white, opens 108 above at1.close 107 (gap up)
    ];
    expectPattern('After Bottom Gap Up R+', bars);
  });

  it('does not match when the two white bars do not gap up', () => {
    const bars = [
      ...context('down', 106),
      bar(114.0, 114.1, 109.9, 110.0),
      bar(109.5, 109.6, 107.9, 108.0),
      bar(106.0, 106.1, 104.9, 105.0),
      bar(103.0, 107.1, 102.9, 107.0),
      bar(107.0, 110.1, 106.9, 110.0), // opens 107 == at1.close 107 -> no gap up
    ];
    expectNoPattern('After Bottom Gap Up R+', bars);
  });
});

describe('After Top Gap Down R-', () => {
  it('matches a long white then two white closing higher with a gap up, then two long blacks gapping down, in an uptrend', () => {
    const bars = [
      ...context('up', 106),
      bar(96.0, 100.1, 95.9, 100.0), // at4 long white
      bar(100.5, 102.1, 100.4, 102.0), // at3 white, closes higher (102>100)
      bar(104.0, 105.1, 103.9, 105.0), // at2 white, closes higher (105>102), opens 104 above at3.close 102 (gap up)
      bar(107.0, 107.1, 102.9, 103.0), // at1 long black
      bar(102.0, 102.1, 98.9, 99.0), // at0 long black, opens 102 below at1.close 103 (gap down)
    ];
    expectPattern('After Top Gap Down R-', bars);
  });

  it('does not match when the two black bars do not gap down', () => {
    const bars = [
      ...context('up', 106),
      bar(96.0, 100.1, 95.9, 100.0),
      bar(100.5, 102.1, 100.4, 102.0),
      bar(104.0, 105.1, 103.9, 105.0),
      bar(107.0, 107.1, 102.9, 103.0),
      bar(103.0, 103.1, 98.9, 99.0), // opens 103 == at1.close 103 -> no gap down
    ];
    expectNoPattern('After Top Gap Down R-', bars);
  });
});

describe('Three Gap Downs R+', () => {
  it('matches four bars whose bodies each gap down and away, the last two long and black, in a downtrend', () => {
    const bars = [
      ...context('down', 106),
      bar(114.0, 114.1, 112.9, 113.0), // at3 any color (white here), first day of the first gap
      bar(111.0, 111.1, 109.9, 110.0), // at2 any color, body gaps below at3 (110<113)
      bar(108.0, 108.1, 103.9, 104.0), // at1 long black, gaps below at2 (bodyTop 108 < at2.bodyBottom 110)
      bar(103.0, 103.1, 98.9, 99.0), // at0 long black, gaps below at1 (bodyTop 103 < at1.bodyBottom 104)
    ];
    expectPattern('Three Gap Downs R+', bars);
  });

  it('does not match when the last body does not gap down', () => {
    const bars = [
      ...context('down', 106),
      bar(114.0, 114.1, 112.9, 113.0),
      bar(111.0, 111.1, 109.9, 110.0),
      bar(108.0, 108.1, 103.9, 104.0),
      bar(105.0, 105.1, 100.9, 101.0), // bodyTop 105 > at1.bodyBottom 104 -> no gap into at0
    ];
    expectNoPattern('Three Gap Downs R+', bars);
  });
});

describe('Three Gap Ups R-', () => {
  it('matches four bars whose bodies each gap up and away, the last two long and white, in an uptrend', () => {
    const bars = [
      ...context('up', 106),
      bar(96.0, 97.1, 95.9, 97.0), // at3 any color, first day of the first gap
      bar(99.0, 100.1, 98.9, 100.0), // at2 any color, body gaps above at3 (100>97)
      bar(102.0, 106.1, 101.9, 106.0), // at1 long white, gaps above at2 (bodyBottom 102 > at2.bodyTop 100)
      bar(107.0, 111.1, 106.9, 111.0), // at0 long white, gaps above at1 (bodyBottom 107 > at1.bodyTop 106)
    ];
    expectPattern('Three Gap Ups R-', bars);
  });

  it('does not match when the last body does not gap up', () => {
    const bars = [
      ...context('up', 106),
      bar(96.0, 97.1, 95.9, 97.0),
      bar(99.0, 100.1, 98.9, 100.0),
      bar(102.0, 106.1, 101.9, 106.0),
      bar(105.0, 109.1, 104.9, 109.0), // bodyBottom 105 < at1.bodyTop 106 -> no gap into at0
    ];
    expectNoPattern('Three Gap Ups R-', bars);
  });
});

describe('Separating Lines C+', () => {
  it('matches a black then a white sharing the same open, in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(100.0, 100.2, 98.4, 98.5), // at1 black, open 100
      bar(100.0, 102.1, 99.9, 102.0), // at0 white, same open 100
    ];
    expectPattern('Separating Lines C+', bars);
  });

  it('does not match when the two opens differ', () => {
    const bars = [
      ...context('up', 100),
      bar(100.0, 100.2, 98.4, 98.5),
      bar(100.5, 102.1, 100.4, 102.0), // opens 100.5, not equal to at1's open
    ];
    expectNoPattern('Separating Lines C+', bars);
  });
});

describe('Separating Lines C-', () => {
  it('matches a white then a black sharing the same open, in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(100.0, 101.6, 99.8, 101.5), // at1 white, open 100
      bar(100.0, 100.1, 97.9, 98.0), // at0 black, same open 100
    ];
    expectPattern('Separating Lines C-', bars);
  });

  it('does not match when the two opens differ', () => {
    const bars = [
      ...context('down', 100),
      bar(100.0, 101.6, 99.8, 101.5),
      bar(99.5, 99.6, 97.4, 97.5), // opens 99.5, not equal to at1's open
    ];
    expectNoPattern('Separating Lines C-', bars);
  });
});

describe('On Neck Line C+', () => {
  it('matches a long white then a black opening above and closing at the white high, in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(98.0, 101.0, 97.9, 101.0), // at1 long white, high 101
      bar(102.0, 102.1, 100.9, 101.0), // at0 black, opens above high, closes at at1.high
    ];
    expectPattern('On Neck Line C+', bars);
  });

  it('does not match when the black close undershoots the white high', () => {
    const bars = [
      ...context('up', 100),
      bar(98.0, 101.0, 97.9, 101.0),
      bar(102.0, 102.1, 100.4, 100.5), // close 100.5 != 101 (the neck)
    ];
    expectNoPattern('On Neck Line C+', bars);
  });
});

describe('On Neck Line C-', () => {
  it('matches a long black then a white opening below and closing at the black low, in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(102.0, 102.1, 99.0, 99.0), // at1 long black, low 99
      bar(98.0, 99.0, 97.9, 99.0), // at0 white, opens below low, closes at at1.low
    ];
    expectPattern('On Neck Line C-', bars);
  });

  it('does not match when the white close overshoots the black low', () => {
    const bars = [
      ...context('down', 100),
      bar(102.0, 102.1, 99.0, 99.0),
      bar(98.0, 99.6, 97.9, 99.5), // close 99.5 != 99 (the neck)
    ];
    expectNoPattern('On Neck Line C-', bars);
  });
});

describe('In Neck Line C+', () => {
  it('matches a long white then a black opening above and closing just inside the white body, in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(98.0, 101.0, 98.0, 101.0), // at1 long white, close 101, range 3
      bar(102.0, 102.0, 100.8, 100.9), // at0 black, opens above high, close 100.9 just inside body (>= 101 - 5% of range)
    ];
    expectPattern('In Neck Line C+', bars);
  });

  it('does not match when the black closes too far below the white close', () => {
    const bars = [
      ...context('up', 100),
      bar(98.0, 101.0, 98.0, 101.0),
      bar(102.0, 102.0, 100.0, 100.1), // close 100.1 < 101 - 5% of range -> too deep
    ];
    expectNoPattern('In Neck Line C+', bars);
  });
});

describe('In Neck Line C-', () => {
  it('matches a long black then a white opening below and closing just inside the black body, in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(102.0, 102.0, 99.0, 99.0), // at1 long black, close 99, range 3
      bar(98.0, 99.2, 98.0, 99.1), // at0 white, opens below low, close 99.1 just inside body (<= 99 + 5% of range)
    ];
    expectPattern('In Neck Line C-', bars);
  });

  it('does not match when the white closes too far above the black close', () => {
    const bars = [
      ...context('down', 100),
      bar(102.0, 102.0, 99.0, 99.0),
      bar(98.0, 99.9, 98.0, 99.8), // close 99.8 > 99 + 5% of range -> too high
    ];
    expectNoPattern('In Neck Line C-', bars);
  });
});

describe('Thrusting C+', () => {
  it('matches a long white then a black opening well above and closing above the midpoint, in an uptrend', () => {
    const bars = [
      ...context('up', 100),
      bar(98.0, 101.0, 98.0, 101.0), // at1 long white, open98 close101 mid99.5 range3
      bar(102.5, 102.6, 100.4, 100.5), // at0 black, open 102.5 > high+30%range(101.9), close100.5 (>=mid99.5, <close101)
    ];
    expectPattern('Thrusting C+', bars);
  });

  it('does not match when the black closes below the midpoint (too deep)', () => {
    const bars = [
      ...context('up', 100),
      bar(98.0, 101.0, 98.0, 101.0),
      bar(102.5, 102.6, 99.0, 99.1), // close 99.1 < midpoint 99.5 -> not a thrust
    ];
    expectNoPattern('Thrusting C+', bars);
  });
});

describe('Thrusting C-', () => {
  it('matches a long black then a white opening well below and closing below the midpoint, in a downtrend', () => {
    const bars = [
      ...context('down', 100),
      bar(102.0, 102.0, 99.0, 99.0), // at1 long black, open102 close99 mid100.5 range3
      bar(97.5, 100.4, 97.4, 100.3), // at0 white, open 97.5 < low-30%range(98.1), close100.3 (>close99, <=mid100.5)
    ];
    expectPattern('Thrusting C-', bars);
  });

  it('does not match when the white closes above the midpoint (too high)', () => {
    const bars = [
      ...context('down', 100),
      bar(102.0, 102.0, 99.0, 99.0),
      bar(97.5, 101.0, 97.4, 100.9), // close 100.9 > midpoint 100.5 -> overshoots
    ];
    expectNoPattern('Thrusting C-', bars);
  });
});

describe('Upside Tasuki Gap C+', () => {
  it('matches white, gapped-up white, then a black opening in the gap-up body and closing into the gap, in an uptrend', () => {
    const bars = [
      ...context('up', 102),
      bar(100.0, 101.1, 99.9, 101.0), // at2 white, bodyTop 101
      bar(103.0, 105.1, 102.9, 105.0), // at1 white, gaps up (bodyBottom 103 > at2.bodyTop 101)
      bar(104.0, 104.1, 101.5, 102.0), // at0 black, opens in at1 body (103..105), closes 102 into gap but > at2.bodyTop 101
    ];
    expectPattern('Upside Tasuki Gap C+', bars);
  });

  it('does not match when the black fully closes the gap', () => {
    const bars = [
      ...context('up', 102),
      bar(100.0, 101.1, 99.9, 101.0),
      bar(103.0, 105.1, 102.9, 105.0),
      bar(104.0, 104.1, 100.4, 100.5), // close 100.5 < at2.bodyTop 101 -> gap fully closed
    ];
    expectNoPattern('Upside Tasuki Gap C+', bars);
  });
});

describe('Downside Tasuki Gap C-', () => {
  it('matches black, gapped-down black, then a white opening in the gap body and closing into the gap, in a downtrend', () => {
    const bars = [
      ...context('down', 102),
      bar(105.0, 105.1, 102.9, 103.0), // at2 black, bodyBottom 103
      bar(101.0, 101.1, 98.9, 99.0), // at1 black, gaps down (bodyTop 101 < at2.bodyBottom 103)
      bar(100.0, 102.5, 99.9, 102.0), // at0 white, opens in at1 body (99..101), closes 102 into gap but < at2.bodyBottom 103
    ];
    expectPattern('Downside Tasuki Gap C-', bars);
  });

  it('does not match when the white fully closes the gap', () => {
    const bars = [
      ...context('down', 102),
      bar(105.0, 105.1, 102.9, 103.0),
      bar(101.0, 101.1, 98.9, 99.0),
      bar(100.0, 104.1, 99.9, 104.0), // close 104 > at2.bodyBottom 103 -> gap fully closed
    ];
    expectNoPattern('Downside Tasuki Gap C-', bars);
  });
});

describe('Side by Side White Lines C+', () => {
  it('matches a long white then two same-open, same-size whites gapping up, in an uptrend', () => {
    const bars = [
      ...context('up', 102),
      bar(100.0, 102.1, 99.9, 102.0), // at2 white long, bodyTop 102
      bar(103.0, 104.1, 102.9, 104.0), // at1 white, gaps up (bodyBottom 103 > at2.bodyTop 102)
      bar(103.2, 104.3, 103.1, 104.2), // at0 white, open within 1% of at1's open, same size, gaps up
    ];
    expectPattern('Side by Side White Lines C+', bars);
  });

  it('does not match when the two upper whites open too far apart', () => {
    const bars = [
      ...context('up', 102),
      bar(100.0, 102.1, 99.9, 102.0),
      bar(103.0, 104.1, 102.9, 104.0),
      bar(105.5, 106.6, 105.4, 106.5), // open 105.5 is >1% from at1's open 103
    ];
    expectNoPattern('Side by Side White Lines C+', bars);
  });
});

describe('Side by Side White Lines C-', () => {
  it('matches a long black then two same-open, same-size whites gapping down, in a downtrend', () => {
    const bars = [
      ...context('down', 102),
      bar(106.0, 106.1, 103.9, 104.0), // at2 black long, bodyBottom 104
      bar(101.0, 102.1, 100.9, 102.0), // at1 white, gaps down (bodyTop 102 < at2.bodyBottom 104)
      bar(101.2, 102.3, 101.1, 102.2), // at0 white, open within 1% of at1's open, same size, gaps down
    ];
    expectPattern('Side by Side White Lines C-', bars);
  });

  it('does not match when the two lower whites open too far apart', () => {
    const bars = [
      ...context('down', 102),
      bar(106.0, 106.1, 103.9, 104.0),
      bar(101.0, 102.1, 100.9, 102.0),
      bar(99.0, 100.1, 98.9, 100.0), // open 99 is >1% from at1's open 101
    ];
    expectNoPattern('Side by Side White Lines C-', bars);
  });
});

describe('Side by Side Black Lines C+', () => {
  it('matches a long white, a gap-up black not filling the gap, then a black opening above its midpoint, in an uptrend', () => {
    const bars = [
      ...context('up', 102),
      bar(100.0, 102.1, 99.9, 102.0), // at2 white long, bodyTop 102
      bar(104.0, 104.1, 102.9, 103.0), // at1 black, opens 104 > at2.close 102 (gap up), bodyBottom 103 > at2.bodyTop 102
      bar(104.0, 104.1, 102.5, 102.6), // at0 black, opens 104 > at1 midpoint 103.5, bodyBottom 102.6 > at2.bodyTop 102
    ];
    expectPattern('Side by Side Black Lines C+', bars);
  });

  it('does not match when the last black opens below the prior black midpoint', () => {
    const bars = [
      ...context('up', 102),
      bar(100.0, 102.1, 99.9, 102.0),
      bar(104.0, 104.1, 102.9, 103.0),
      bar(103.2, 103.3, 102.5, 102.6), // open 103.2 < at1 midpoint 103.5 -> fails rule 4
    ];
    expectNoPattern('Side by Side Black Lines C+', bars);
  });
});

describe('Side by Side Black Lines C-', () => {
  it('matches a long black, a long black gapping below it, then a black opening higher but not filling the gap, in a downtrend', () => {
    const bars = [
      ...context('down', 103),
      bar(107.0, 107.1, 103.9, 104.0), // at2 long black, bodyBottom 104
      bar(102.0, 102.1, 97.9, 98.0), // at1 long black, opens 102 < at2.close 104 (gap), bodyTop 102 < at2.bodyBottom 104
      bar(103.0, 103.1, 99.9, 100.0), // at0 black, opens 103 > at1.bodyTop 102 (higher) but bodyTop 103 < at2.bodyBottom 104 (gap not filled), closes down
    ];
    expectPattern('Side by Side Black Lines C-', bars);
  });

  it('does not match when the third black fills the gap', () => {
    const bars = [
      ...context('down', 103),
      bar(107.0, 107.1, 103.9, 104.0),
      bar(102.0, 102.1, 97.9, 98.0),
      bar(105.0, 105.1, 101.9, 102.0), // bodyTop 105 > at2.bodyBottom 104 -> gap filled
    ];
    expectNoPattern('Side by Side Black Lines C-', bars);
  });
});

describe('Upside Gap 3 Methods C+', () => {
  it('matches two gapping-up long whites then a black filling the gap, in an uptrend', () => {
    const bars = [
      ...context('up', 103),
      bar(100.0, 102.1, 99.9, 102.0), // at2 white long
      bar(104.0, 106.1, 103.9, 106.0), // at1 white long, gaps up
      bar(105.0, 105.1, 100.9, 101.0), // at0 black, fills the gap between them
    ];
    expectPattern('Upside Gap 3 Methods C+', bars);
  });

  it('does not match when the two whites do not gap (bodies overlap)', () => {
    const bars = [
      ...context('up', 103),
      bar(100.0, 102.1, 99.9, 102.0),
      bar(101.5, 103.6, 101.4, 103.5), // bodyBottom 101.5 <= at2.bodyTop 102 -> no gap
      bar(102.5, 102.6, 100.4, 100.5),
    ];
    expectNoPattern('Upside Gap 3 Methods C+', bars);
  });
});

describe('Downside Gap 3 Methods C-', () => {
  it('matches two gapping-down long blacks then a white filling the gap, in a downtrend', () => {
    const bars = [
      ...context('down', 103),
      bar(106.0, 106.1, 103.9, 104.0), // at2 black long
      bar(102.0, 102.1, 99.9, 100.0), // at1 black long, gaps down
      bar(101.0, 105.1, 100.9, 105.0), // at0 white, fills the gap between them
    ];
    expectPattern('Downside Gap 3 Methods C-', bars);
  });

  it('does not match when the two blacks do not gap (bodies overlap)', () => {
    const bars = [
      ...context('down', 103),
      bar(106.0, 106.1, 103.9, 104.0),
      bar(104.5, 104.6, 102.4, 102.5), // bodyTop 104.5 >= at2.bodyBottom 104 -> no gap
      bar(103.0, 105.1, 102.9, 105.0),
    ];
    expectNoPattern('Downside Gap 3 Methods C-', bars);
  });
});

describe('Rest After Battle C+', () => {
  it('matches a long white first day in an uptrend', () => {
    const bars = [
      ...context('up', 101),
      bar(100.0, 106.0, 99.0, 105.0), // at2 long white, very long body, in uptrend
      bar(104.5, 105.0, 104.0, 104.2), // at1 resting bar (unconstrained by Morris)
      bar(104.5, 104.9, 104.2, 104.6), // at0 resting bar (unconstrained by Morris)
    ];
    expectPattern('Rest After Battle C+', bars);
  });

  it('does not match when the first day is not a long white day', () => {
    const bars = [
      ...context('up', 101),
      bar(105.0, 106.0, 99.0, 100.0), // at2 BLACK first day -> fails rule 1/3
      bar(104.5, 105.0, 104.0, 104.2),
      bar(104.5, 104.9, 104.2, 104.6),
    ];
    expectNoPattern('Rest After Battle C+', bars);
  });
});

describe('Rising 3 Methods C+', () => {
  it('matches a long white, three small bodies drifting down within its range, then a long white breakout, in an uptrend', () => {
    const bars = [
      ...context('up', 101),
      bar(100.0, 106.0, 99.9, 105.0), // at4 long white, high 106 low 99.9
      bar(104.0, 104.5, 103.5, 103.6), // at3 short, inside at4 range, mid ~103.8
      bar(103.6, 104.0, 103.2, 103.8), // at2 short, inside
      bar(103.4, 103.6, 102.8, 103.0), // at1 short, inside, mid ~103.2 < at3 mid (drifts down)
      bar(103.0, 106.5, 102.9, 106.0), // at0 long white, closes above at4's close 105
    ];
    expectPattern('Rising 3 Methods C+', bars);
  });

  it('does not match when the final white fails to close above the first white', () => {
    const bars = [
      ...context('up', 101),
      bar(100.0, 106.0, 99.9, 105.0),
      bar(104.0, 104.5, 103.5, 103.6),
      bar(103.6, 104.0, 103.2, 103.8),
      bar(103.4, 103.6, 102.8, 103.0),
      bar(103.0, 104.9, 102.9, 104.8), // close 104.8 < at4.close 105 -> no breakout
    ];
    expectNoPattern('Rising 3 Methods C+', bars);
  });
});

describe('Falling 3 Methods C-', () => {
  it('matches a long black, three small bodies drifting up within its range, then a long black breakdown, in a downtrend', () => {
    const bars = [
      ...context('down', 105),
      bar(105.0, 106.1, 100.0, 100.0), // at4 long black, high 106.1 low 100
      bar(101.0, 101.5, 100.6, 101.4), // at3 short, inside at4 range, mid ~101.2
      bar(101.4, 101.8, 101.0, 101.2), // at2 short, inside
      bar(101.6, 102.2, 101.4, 102.0), // at1 short, inside, mid ~101.8 > at3 mid (drifts up)
      bar(102.0, 102.1, 98.9, 99.0), // at0 long black, closes below at4's close 100
    ];
    expectPattern('Falling 3 Methods C-', bars);
  });

  it('does not match when the final black fails to close below the first black', () => {
    const bars = [
      ...context('down', 105),
      bar(105.0, 106.1, 100.0, 100.0),
      bar(101.0, 101.5, 100.6, 101.4),
      bar(101.4, 101.8, 101.0, 101.2),
      bar(101.6, 102.2, 101.4, 102.0),
      bar(102.0, 102.1, 100.1, 100.2), // close 100.2 > at4.close 100 -> no breakdown
    ];
    expectNoPattern('Falling 3 Methods C-', bars);
  });
});

describe('Mat Hold C+', () => {
  it('matches a long white, a gapping black star, two descenders, then a long white new closing high, in an uptrend', () => {
    const bars = [
      ...context('up', 101),
      bar(100.0, 105.1, 99.9, 105.0), // at4 long white, bodyTop 105, close 105
      bar(106.5, 106.6, 105.6, 105.7), // at3 black star, bodyBottom 105.7 above at4 body (gap up)
      bar(105.4, 105.5, 104.7, 104.8), // at2 descending
      bar(104.6, 104.7, 104.1, 104.2), // at1 descending
      bar(104.3, 107.6, 104.2, 107.5), // at0 long white, close 107.5 above at4.close 105 and at3.bodyTop 106.5
    ];
    expectPattern('Mat Hold C+', bars);
  });

  it('does not match when the final white fails to make a new closing high', () => {
    const bars = [
      ...context('up', 101),
      bar(100.0, 105.1, 99.9, 105.0),
      bar(106.5, 106.6, 105.6, 105.7),
      bar(105.4, 105.5, 104.7, 104.8),
      bar(104.6, 104.7, 104.1, 104.2),
      bar(104.3, 104.9, 104.2, 104.8), // close 104.8 <= at4.close 105 -> no new closing high
    ];
    expectNoPattern('Mat Hold C+', bars);
  });
});

describe('Mat Hold C-', () => {
  it('matches a long black, a gapping white, two short risers, then a long black breakdown, in a downtrend', () => {
    const bars = [
      ...context('down', 105),
      bar(105.0, 105.1, 99.9, 100.0), // at4 long black, bodyBottom 100
      bar(98.5, 99.1, 98.4, 99.0), // at3 white, bodyTop 99 below at4 body (gap down)
      bar(99.2, 99.9, 99.1, 99.8), // at2 short riser
      bar(100.0, 100.6, 99.9, 100.5), // at1 short riser, close 100.5
      bar(100.4, 100.5, 96.9, 97.0), // at0 long black, opens 100.4 < at1.close 100.5, closes 97 < at3.open 98.5
    ];
    expectPattern('Mat Hold C-', bars);
  });

  it('does not match when the final black fails to close below the white open', () => {
    const bars = [
      ...context('down', 105),
      bar(105.0, 105.1, 99.9, 100.0),
      bar(98.5, 99.1, 98.4, 99.0),
      bar(99.2, 99.9, 99.1, 99.8),
      bar(100.0, 100.6, 99.9, 100.5),
      bar(100.4, 100.5, 98.6, 98.7), // close 98.7 >= at3.open 98.5 -> no breakdown
    ];
    expectNoPattern('Mat Hold C-', bars);
  });
});

describe('3 Line Strike C+', () => {
  it('matches three rising white soldiers then a higher-opening black closing below the first open, in an uptrend', () => {
    const bars = [
      ...context('up', 101),
      bar(100.0, 103.2, 99.9, 103.0), // at3 long white, open 100, close 103 near high
      bar(101.5, 105.2, 101.4, 105.0), // at2 long white, opens in at3 body (100..103), higher close, near high
      bar(103.5, 107.2, 103.4, 107.0), // at1 long white, opens in at2 body (101.5..105), higher close, near high
      bar(108.0, 108.1, 99.5, 99.6), // at0 black, opens above at1.close, closes below at3.open 100
    ];
    expectPattern('3 Line Strike C+', bars);
  });

  it('does not match when the black fails to close below the first white open', () => {
    const bars = [
      ...context('up', 101),
      bar(100.0, 103.2, 99.9, 103.0),
      bar(101.5, 105.2, 101.4, 105.0),
      bar(103.5, 107.2, 103.4, 107.0),
      bar(108.0, 108.1, 100.9, 101.0), // close 101 > at3.open 100 -> no full strike
    ];
    expectNoPattern('3 Line Strike C+', bars);
  });
});

describe('3 Line Strike C-', () => {
  it('matches three declining black crows then a lower-opening white closing above the first open, in a downtrend', () => {
    const bars = [
      ...context('down', 105),
      bar(106.0, 106.1, 102.8, 103.0), // at3 long black, open 106, close 103 near low
      bar(104.5, 104.6, 100.8, 101.0), // at2 long black, opens in at3 body (103..106), lower close, near low
      bar(102.5, 102.6, 98.8, 99.0), // at1 long black, opens in at2 body (101..104.5), lower close, near low
      bar(98.0, 106.5, 97.9, 106.4), // at0 white, opens below at1.close, closes above at3.open 106
    ];
    expectPattern('3 Line Strike C-', bars);
  });

  it('does not match when the white fails to close above the first black open', () => {
    const bars = [
      ...context('down', 105),
      bar(106.0, 106.1, 102.8, 103.0),
      bar(104.5, 104.6, 100.8, 101.0),
      bar(102.5, 102.6, 98.8, 99.0),
      bar(98.0, 105.6, 97.9, 105.5), // close 105.5 < at3.open 106 -> no full strike
    ];
    expectNoPattern('3 Line Strike C-', bars);
  });
});
