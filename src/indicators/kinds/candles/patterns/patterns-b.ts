import { CandlePattern } from '../candle-pattern';
import { pricesEqual } from '../candle-pattern';
import { DEFAULT_CANDLE_CONFIG } from '../candle-config';

export const PATTERNS_B: CandlePattern[] = [
  {
    // Morris "Downside Gap Two Rabbits" (R+):
    // 1. A long black day occurs during a downtrend.
    // 2. The second day is a downward gapping white day.
    name: 'Downside Gap Two Rabbits R+',
    length: 2,
    matches: (at) =>
      at(1).color === 'Black' &&
      at(1).bodyType === 'Long' &&
      at(0).color === 'White' &&
      at(0).bodyTop < at(1).bodyBottom &&
      at(1).trend < 0,
  },
  {
    // Morris "Unique Three River Bottom" (R+):
    // 1. The first day is a long black day.
    // 2. The second day is a Harami day, but the body is also black.
    // 3. The second day has a lower shadow that sets a new low.
    // 4. The third day is a short white day that is below the middle day.
    name: 'Unique Three River Bottom R+',
    length: 3,
    matches: (at) =>
      at(2).color === 'Black' &&
      at(2).bodyType === 'Long' &&
      at(1).color === 'Black' &&
      at(1).bodyTop <= at(2).bodyTop &&
      at(1).bodyBottom >= at(2).bodyBottom &&
      at(1).low < at(2).low &&
      at(0).color === 'White' &&
      at(0).bodyType === 'Short' &&
      at(0).bodyTop < at(1).bodyBottom &&
      at(2).trend < 0,
  },
  {
    // Morris "Unique Three Mountain Top" (R-):
    // 1. The first day is a long white day that occurs during an uptrend.
    // 2. The next day opens lower, rallies to make a new high, but then trades
    //    down to close near the low of the day, producing a small white body
    //    with a long upper shadow.
    // 3. The third day opens higher, but not higher than the second day's high.
    // 4. A relatively small black body forms on the third day, closing above the
    //    close of the second day.
    name: 'Unique Three Mountain Top R-',
    length: 3,
    matches: (at) =>
      at(2).color === 'White' &&
      at(2).bodyType === 'Long' &&
      at(1).color === 'White' &&
      at(1).bodyType === 'Short' &&
      at(1).high > at(2).high &&
      at(1).upperShadowHl >= 40 &&
      at(0).color === 'Black' &&
      at(0).bodyType === 'Short' &&
      at(0).open > at(1).close &&
      at(0).open <= at(1).high &&
      at(0).close > at(1).close &&
      at(2).trend > 0,
  },
  {
    // Morris "Three White Soldiers" (R+):
    // 1. Three consecutive long white lines occur, each with a higher close.
    // 2. Each should open within the previous body.
    // 3. Each should close at or near the high for the day.
    name: 'Three White Soldiers R+',
    length: 3,
    matches: (at) =>
      at(0).color === 'White' &&
      at(1).color === 'White' &&
      at(2).color === 'White' &&
      at(0).bodyType === 'Long' &&
      at(1).bodyType === 'Long' &&
      at(2).bodyType === 'Long' &&
      at(0).close > at(1).close &&
      at(1).close > at(2).close &&
      at(0).open > at(1).bodyBottom &&
      at(0).open < at(1).bodyTop &&
      at(1).open > at(2).bodyBottom &&
      at(1).open < at(2).bodyTop &&
      at(0).upperShadowHl <= 10 &&
      at(1).upperShadowHl <= 10 &&
      at(2).upperShadowHl <= 10 &&
      at(2).trend < 0,
  },
  {
    // Morris "Identical Three Crows" (R-):
    // 1. Three long black days are stair-stepping downward.
    // 2. Each day starts at the previous day's close.
    name: 'Identical Three Crows R-',
    length: 3,
    matches: (at, cfg = DEFAULT_CANDLE_CONFIG) =>
      at(0).color === 'Black' &&
      at(1).color === 'Black' &&
      at(2).color === 'Black' &&
      at(0).bodyType === 'Long' &&
      at(1).bodyType === 'Long' &&
      at(2).bodyType === 'Long' &&
      at(2).close > at(1).close &&
      at(1).close > at(0).close &&
      pricesEqual(at(1).open, at(2).close, at(1).highLow, cfg) &&
      pricesEqual(at(0).open, at(1).close, at(0).highLow, cfg) &&
      at(2).trend > 0,
  },
  {
    // Morris "Three Black Crows" (R-):
    // 1. Three consecutive long black days occur.
    // 2. Each day closes at a new low.
    // 3. Each day opens within the body of the previous day.
    // 4. Each day closes at or near its lows.
    name: 'Three Black Crows R-',
    length: 3,
    matches: (at) =>
      at(0).color === 'Black' &&
      at(1).color === 'Black' &&
      at(2).color === 'Black' &&
      at(0).bodyType === 'Long' &&
      at(1).bodyType === 'Long' &&
      at(2).bodyType === 'Long' &&
      at(0).close < at(1).close &&
      at(1).close < at(2).close &&
      at(0).open < at(1).bodyTop &&
      at(0).open > at(1).bodyBottom &&
      at(1).open < at(2).bodyTop &&
      at(1).open > at(2).bodyBottom &&
      at(0).lowerShadowHl <= 10 &&
      at(1).lowerShadowHl <= 10 &&
      at(2).lowerShadowHl <= 10 &&
      at(2).trend > 0,
  },
  {
    // Morris "Advance Block" (R-):
    // 1. Three white days occur with consecutively higher closes.
    // 2. Each day opens within the previous day's body.
    // 3. A definite deterioration in the upward strength is evidenced by long
    //    upper shadows on the second and third days.
    name: 'Advance Block R-',
    length: 3,
    matches: (at) =>
      at(0).color === 'White' &&
      at(1).color === 'White' &&
      at(2).color === 'White' &&
      at(0).bodyType !== 'Doji' &&
      at(1).bodyType !== 'Doji' &&
      at(2).bodyType === 'Long' &&
      at(0).close > at(1).close &&
      at(1).close > at(2).close &&
      at(0).upperShadowHl >= 40 &&
      at(1).upperShadowHl >= 40 &&
      at(0).open >= at(1).bodyBottom &&
      at(0).open <= at(1).bodyTop &&
      at(1).open >= at(2).bodyBottom &&
      at(1).open <= at(2).bodyTop &&
      at(2).trend > 0,
  },
  {
    // Morris "Descent Block" (R+):
    // 1. The pattern begins with a long black day that occurs in a downtrend.
    // 2. The next two days are also black days, each closing below the prior
    //    day's close.
    // 3. The last two days also have long lower shadows.
    name: 'Descent Block R+',
    length: 3,
    matches: (at) =>
      at(0).color === 'Black' &&
      at(1).color === 'Black' &&
      at(2).color === 'Black' &&
      at(0).bodyType !== 'Doji' &&
      at(1).bodyType !== 'Doji' &&
      at(2).bodyType === 'Long' &&
      at(0).close < at(1).close &&
      at(1).close < at(2).close &&
      at(0).lowerShadowHl >= 40 &&
      at(1).lowerShadowHl >= 40 &&
      at(0).open >= at(1).bodyBottom &&
      at(0).open <= at(1).bodyTop &&
      at(1).open >= at(2).bodyBottom &&
      at(1).open <= at(2).bodyTop &&
      at(2).trend < 0,
  },
  {
    // Morris "Bearish Deliberation" (R-):
    // 1. The first and second day have long white bodies.
    // 2. The third day opens near the second day's close.
    // 3. The third day is a Spinning Top and most probably a star.
    name: 'Deliberation R-',
    length: 3,
    matches: (at, cfg = DEFAULT_CANDLE_CONFIG) =>
      at(2).color === 'White' &&
      at(1).color === 'White' &&
      at(2).bodyDay === 'Long' &&
      at(1).bodyDay === 'Long' &&
      at(0).bodyType === 'Short' &&
      at(0).upperShadow > cfg.spinningTopMinShadowPctOfBody &&
      at(0).lowerShadow > cfg.spinningTopMinShadowPctOfBody &&
      pricesEqual(at(0).open, at(1).close, at(0).highLow, cfg) &&
      at(2).trend > 0,
  },
  {
    // Morris "Bullish Deliberation" (R+):
    // 1. The first day of the pattern is a long black day that occurs in a
    //    downtrend.
    // 2. The second day is also a long black day.
    // 3. The third day is a Star or relatively small black day that may gap away
    //    from the prior day's black real body.
    name: 'Deliberation R+',
    length: 3,
    matches: (at) =>
      at(2).color === 'Black' &&
      at(1).color === 'Black' &&
      at(2).bodyDay === 'Long' &&
      at(1).bodyDay === 'Long' &&
      at(0).bodyType !== 'Long' &&
      at(2).trend < 0,
  },
  {
    // Morris "Two Crows" (R-):
    // 1. The trend continues with a long white day.
    // 2. The second day is a gap up and a black day.
    // 3. The third day is also a black day.
    // 4. The third day opens inside the body of the second day and closes inside
    //    the body of the first day.
    name: 'Two Crows R-',
    length: 3,
    matches: (at) =>
      at(2).color === 'White' &&
      at(2).bodyType === 'Long' &&
      at(1).color === 'Black' &&
      at(0).color === 'Black' &&
      at(1).bodyBottom > at(2).bodyTop &&
      at(0).open <= at(1).bodyTop &&
      at(0).open >= at(1).bodyBottom &&
      at(0).close >= at(2).bodyBottom &&
      at(0).close <= at(2).bodyTop &&
      at(2).trend > 0,
  },
  {
    // Morris "Two Rabbits" (R+):
    // 1. The pattern begins with a black day that occurs during a downtrend.
    // 2. The second day is a downward gapping white day.
    // 3. The third day is also a white day that opens inside the body of the
    //    second day and then closes inside the body of the first day.
    name: 'Two Rabbits R+',
    length: 3,
    matches: (at) =>
      at(2).color === 'Black' &&
      at(1).color === 'White' &&
      at(0).color === 'White' &&
      at(1).bodyTop < at(2).bodyBottom &&
      at(0).open >= at(1).bodyBottom &&
      at(0).open <= at(1).bodyTop &&
      at(0).close >= at(2).bodyBottom &&
      at(0).close <= at(2).bodyTop &&
      at(2).trend < 0,
  },
  {
    // Morris "Three Inside Up" (R+):
    // 1. A Harami pattern is first identified using all previously set rules.
    // 2. The third day shows a higher close.
    name: 'Three Inside Up R+',
    length: 3,
    matches: (at) =>
      at(0).color === 'White' &&
      at(1).color === 'White' &&
      at(2).color === 'Black' &&
      at(2).bodyType === 'Long' &&
      at(1).bodyType !== 'Doji' &&
      ((at(1).bodyTop <= at(2).bodyTop && at(1).bodyBottom > at(2).bodyBottom) ||
        (at(1).bodyTop < at(2).bodyTop && at(1).bodyBottom >= at(2).bodyBottom)) &&
      at(0).close > at(2).bodyTop &&
      at(2).trend < 0,
  },
  {
    // Morris "Three Inside Down" (R-):
    // 1. A Harami pattern is first identified using all previously set rules.
    // 2. The third day shows a lower close.
    name: 'Three Inside Down R-',
    length: 3,
    matches: (at) =>
      at(0).color === 'Black' &&
      at(1).color === 'Black' &&
      at(2).color === 'White' &&
      at(2).bodyType === 'Long' &&
      at(1).bodyType !== 'Doji' &&
      ((at(1).bodyTop <= at(2).bodyTop && at(1).bodyBottom > at(2).bodyBottom) ||
        (at(1).bodyTop < at(2).bodyTop && at(1).bodyBottom >= at(2).bodyBottom)) &&
      at(0).close < at(2).bodyBottom &&
      at(2).trend > 0,
  },
  {
    // Morris "Three Outside Up" (R+):
    // 1. An Engulfing pattern is formed using all of the previously set rules.
    // 2. The third day has a higher close.
    name: 'Three Outside Up R+',
    length: 3,
    matches: (at) =>
      at(2).color === 'Black' &&
      at(1).color === 'White' &&
      at(0).color === 'White' &&
      ((at(1).bodyTop >= at(2).bodyTop && at(1).bodyBottom < at(2).bodyBottom) ||
        (at(1).bodyTop > at(2).bodyTop && at(1).bodyBottom <= at(2).bodyBottom)) &&
      at(0).close > at(1).close &&
      at(2).trend < 0,
  },
  {
    // Morris "Three Outside Down" (R-):
    // 1. An Engulfing pattern is formed using all of the previously set rules.
    // 2. The third day has a lower close.
    name: 'Three Outside Down R-',
    length: 3,
    matches: (at) =>
      at(2).color === 'White' &&
      at(1).color === 'Black' &&
      at(0).color === 'Black' &&
      ((at(1).bodyTop >= at(2).bodyTop && at(1).bodyBottom < at(2).bodyBottom) ||
        (at(1).bodyTop > at(2).bodyTop && at(1).bodyBottom <= at(2).bodyBottom)) &&
      at(0).close < at(1).close &&
      at(2).trend > 0,
  },
  {
    // Morris "Three Stars in the South" (R+):
    // 1. The first day is a long black day with a long lower shadow (Hammer-like).
    // 2. The second day has the same basic shape as the first, only smaller. Its
    //    low is above the previous day's low.
    // 3. The third day is a small Black Marubozu that opens and closes inside the
    //    previous day's range.
    name: 'Three Stars in the South R+',
    length: 3,
    matches: (at) =>
      at(2).color === 'Black' &&
      at(2).bodyType !== 'Doji' &&
      at(2).lowerShadow > 50 &&
      at(1).color === 'Black' &&
      at(1).body < at(2).body &&
      at(1).lowerShadow < at(2).lowerShadow &&
      at(1).low > at(2).low &&
      at(0).color === 'Black' &&
      at(0).body < at(1).body &&
      at(0).high <= at(1).high &&
      at(0).low >= at(1).low &&
      at(0).upperShadowHl <= 10 &&
      at(0).lowerShadowHl <= 10 &&
      at(2).trend < 0,
  },
  {
    // Morris "Three Stars in the North" (R-):
    // 1. Three white days; the second and third each make a lower high and a
    //    higher low than the preceding day.
    // 2. Begins with a long white day; midpoint above a 10-period average
    //    (uptrend in place).
    // 3. First day's upper shadow > 40% of the range, little/no lower shadow
    //    (< 7.5% of the range).
    // 4. The second day opens below the close of the first, trades higher, and
    //    closes above the close of the first. Its high is below the first day's
    //    high; same shadow requirements as the first day.
    // 5. The third day is a small White Marubozu that opens and closes inside the
    //    high-low range of the second day.
    name: 'Three Stars in the North R-',
    length: 3,
    matches: (at) =>
      at(2).color === 'White' &&
      at(2).bodyType === 'Long' &&
      at(2).upperShadowHl >= 40 &&
      at(2).lowerShadowHl <= 7.5 &&
      at(1).color === 'White' &&
      at(1).upperShadowHl >= 40 &&
      at(1).lowerShadowHl <= 7.5 &&
      at(1).high < at(2).high &&
      at(1).low > at(2).low &&
      at(1).open < at(2).close &&
      at(1).close > at(2).close &&
      at(0).color === 'White' &&
      at(0).high < at(1).high &&
      at(0).low > at(1).low &&
      at(0).open >= at(1).low &&
      at(0).close <= at(1).high &&
      at(0).upperShadowHl <= 10 &&
      at(0).lowerShadowHl <= 10 &&
      at(2).trend > 0,
  },
  {
    // Morris "Bullish Stick Sandwich" (R+):
    // 1. A black body in a downtrend is followed by a white body that trades
    //    above the close of the previous black body.
    // 2. The third day is a black day with a close equal to the first day.
    name: 'Stick Sandwich R+',
    length: 3,
    matches: (at, cfg = DEFAULT_CANDLE_CONFIG) =>
      at(2).color === 'Black' &&
      at(1).color === 'White' &&
      at(0).color === 'Black' &&
      at(1).bodyTop > at(2).close &&
      pricesEqual(at(0).close, at(2).close, at(0).highLow, cfg) &&
      at(2).trend < 0,
  },
  {
    // Morris "Bearish Stick Sandwich" (R-):
    // 1. The pattern starts with a white day that occurs during an uptrend.
    // 2. The second day is a black real body that opens below the previous day's
    //    close and closes below the previous day's open.
    // 3. The third day is a white real body that engulfs the second day's black
    //    real body.
    name: 'Stick Sandwich R-',
    length: 3,
    matches: (at) =>
      at(2).color === 'White' &&
      at(1).color === 'Black' &&
      at(0).color === 'White' &&
      at(1).open < at(2).close &&
      at(1).close < at(2).open &&
      at(0).bodyTop >= at(1).bodyTop &&
      at(0).bodyBottom <= at(1).bodyBottom &&
      at(2).trend > 0,
  },
  {
    // Morris "Bullish Squeeze Alert" (R+):
    // 1. The pattern occurs in a downtrend.
    // 2. The first day is relatively long; the second and third days each have
    //    lower highs and higher lows than the previous day.
    // 3. The sizes of the bodies of the three days do not matter.
    name: 'Squeeze Alert R+',
    length: 3,
    matches: (at) =>
      at(2).color === 'Black' &&
      at(2).bodyType === 'Long' &&
      at(1).high < at(2).high &&
      at(1).low > at(2).low &&
      at(0).high < at(1).high &&
      at(0).low > at(1).low &&
      at(2).trend < 0,
  },
  {
    // Morris "Bearish Squeeze Alert" (R-):
    // 1. The pattern occurs in an uptrend.
    // 2. The first day is relatively long; the second and third days each have
    //    lower highs and higher lows than the previous day.
    // 3. The sizes of the bodies of the three days do not matter.
    name: 'Squeeze Alert R-',
    length: 3,
    matches: (at) =>
      at(2).color === 'White' &&
      at(2).bodyType === 'Long' &&
      at(1).high < at(2).high &&
      at(1).low > at(2).low &&
      at(0).high < at(1).high &&
      at(0).low > at(1).low &&
      at(2).trend > 0,
  },
  {
    // Morris "Breakaway" (R+):
    // 1. The first day is a long day with color representing the current trend.
    // 2. The second day is the same color and the body gaps in the trend
    //    direction.
    // 3. The third and fourth days continue the trend direction, with closes
    //    consecutively greater in the direction of the trend.
    // 4. The fifth day is a long opposite-color day that closes inside the gap
    //    caused by the first and second days.
    name: 'Breakaway R+',
    length: 5,
    matches: (at) =>
      at(0).bodyType === 'Long' &&
      at(4).bodyType === 'Long' &&
      at(0).color === 'White' &&
      at(1).color === 'Black' &&
      at(3).color === 'Black' &&
      at(4).color === 'Black' &&
      at(4).low > at(3).high &&
      at(3).bodyTop > at(2).bodyTop &&
      at(2).bodyTop > at(1).bodyTop &&
      at(0).bodyTop > at(3).bodyTop &&
      at(0).bodyTop < at(4).bodyBottom &&
      at(4).trend < 0,
  },
  {
    // Morris "Breakaway" (R-):
    // 1. The first day is a long day with color representing the current trend.
    // 2. The second day is the same color and the body gaps in the trend
    //    direction.
    // 3. The third and fourth days continue the trend direction, with closes
    //    consecutively greater in the direction of the trend.
    // 4. The fifth day is a long opposite-color day that closes inside the gap
    //    caused by the first and second days.
    name: 'Breakaway R-',
    length: 5,
    matches: (at) =>
      at(0).bodyType === 'Long' &&
      at(4).bodyType === 'Long' &&
      at(0).color === 'Black' &&
      at(1).color === 'White' &&
      at(3).color === 'White' &&
      at(4).color === 'White' &&
      at(4).high < at(3).low &&
      at(3).bodyTop < at(2).bodyTop &&
      at(2).bodyTop < at(1).bodyTop &&
      at(0).bodyBottom < at(3).bodyBottom &&
      at(0).bodyBottom > at(4).bodyTop &&
      at(4).trend > 0,
  },
];
