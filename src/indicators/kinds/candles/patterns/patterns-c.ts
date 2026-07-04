import { CandlePattern, pricesEqual } from '../candle-pattern';
import { DEFAULT_CANDLE_CONFIG } from '../candle-config';
import type { CandleMetrics } from '../candle-metrics';

export const PATTERNS_C: CandlePattern[] = [
  {
    // Morris: (1) days 1-2 (oldest, at(3)/at(2)) are Black Marubozu; (2) day 3
    // (at(1)) is black with a gap-down open that trades up into the prior body,
    // producing a long upper shadow; (3) day 4 (at(0)) black engulfs day 3
    // including its shadow. Trend tested on the oldest bar.
    name: 'Concealing Baby Swallow R+',
    length: 4,
    matches: (at) =>
      at(0).color === 'Black' &&
      at(1).color === 'Black' &&
      at(2).color === 'Black' &&
      at(3).color === 'Black' &&
      at(2).baseBody === 'Marubozu' &&
      at(3).baseBody === 'Marubozu' &&
      at(1).bodyTop < at(2).bodyBottom &&
      at(1).high > at(2).bodyBottom &&
      at(1).upperShadowHl >= 40 &&
      at(0).bodyTop > at(1).high &&
      at(0).bodyBottom < at(1).low &&
      at(3).trend < 0,
  },
  {
    // Morris: (1) three long black days (oldest three: at(4)/at(3)/at(2)) with
    // consecutively lower opens and closes; (2) day 4 (at(1)) is black with an
    // upper shadow; (3) day 5 (at(0)) is white and opens above the body of the
    // previous day. Trend tested on the oldest bar.
    name: 'Ladder Bottom R+',
    length: 5,
    matches: (at) =>
      at(0).color === 'White' &&
      at(1).color === 'Black' &&
      at(2).color === 'Black' &&
      at(3).color === 'Black' &&
      at(4).color === 'Black' &&
      at(4).bodyType === 'Long' &&
      at(3).bodyType === 'Long' &&
      at(2).bodyType === 'Long' &&
      at(1).bodyType !== 'Doji' &&
      at(0).bodyType !== 'Doji' &&
      at(3).open < at(4).open &&
      at(2).open < at(3).open &&
      at(3).close < at(4).close &&
      at(2).close < at(3).close &&
      at(1).upperShadowHl >= 40 &&
      at(0).open > at(1).bodyTop &&
      at(4).trend < 0,
  },
  {
    // Morris: (1) three white days (oldest three: at(4)/at(3)/at(2)) with
    // consecutively higher opens and closes; (2) day 4 (at(1)) is white with a
    // lower shadow that extends well down into day 3; (3) day 5 (at(0)) is black
    // that opens below the body of day 4 and closes below the low of day 4.
    // Trend tested on the oldest bar.
    name: 'Ladder Top R-',
    length: 5,
    matches: (at) =>
      at(0).color === 'Black' &&
      at(1).color === 'White' &&
      at(2).color === 'White' &&
      at(3).color === 'White' &&
      at(4).color === 'White' &&
      at(1).bodyType !== 'Doji' &&
      at(0).bodyType !== 'Doji' &&
      at(3).open > at(4).open &&
      at(2).open > at(3).open &&
      at(3).close > at(4).close &&
      at(2).close > at(3).close &&
      at(1).lowerShadowHl >= 40 &&
      at(1).low < at(2).bodyBottom &&
      at(0).open < at(1).bodyBottom &&
      at(0).close < at(1).low &&
      at(4).trend > 0,
  },
  {
    // Morris: (1) long black day in a downtrend (oldest, at(4)); (2) next two days
    // (at(3), at(2)) are also black, each closing lower than the prior close;
    // (3) day 3 (at(2)) gaps down, opening below the close of day 2 (at(3));
    // (4) day 4 (at(1)) is a long white day; (5) day 5 (at(0)) is another long
    // white day that gaps up, opening above the previous day's close. Trend on
    // the oldest bar.
    name: 'After Bottom Gap Up R+',
    length: 5,
    matches: (at) =>
      at(0).color === 'White' &&
      at(1).color === 'White' &&
      at(2).color === 'Black' &&
      at(3).color === 'Black' &&
      at(4).color === 'Black' &&
      at(4).bodyDay === 'Long' &&
      at(3).bodyType !== 'Doji' &&
      at(2).bodyType !== 'Doji' &&
      at(1).bodyDay === 'Long' &&
      at(0).bodyDay === 'Long' &&
      at(3).close < at(4).close &&
      at(2).close < at(3).close &&
      at(2).open < at(3).close &&
      at(0).open > at(1).close &&
      at(4).trend < 0,
  },
  {
    // Morris (mirror of After Bottom Gap Up): (1) long white day in an uptrend
    // (oldest, at(4)); (2) next two days (at(3), at(2)) also white, each closing
    // higher than the prior close; (3) day 3 (at(2)) gaps up, opening above the
    // close of day 2 (at(3)); (4) day 4 (at(1)) is a long black day; (5) day 5
    // (at(0)) is another long black day that gaps down, opening below the
    // previous day's close. Trend on the oldest bar.
    name: 'After Top Gap Down R-',
    length: 5,
    matches: (at) =>
      at(0).color === 'Black' &&
      at(1).color === 'Black' &&
      at(2).color === 'White' &&
      at(3).color === 'White' &&
      at(4).color === 'White' &&
      at(4).bodyDay === 'Long' &&
      at(3).bodyType !== 'Doji' &&
      at(2).bodyType !== 'Doji' &&
      at(1).bodyDay === 'Long' &&
      at(0).bodyDay === 'Long' &&
      at(3).close > at(4).close &&
      at(2).close > at(3).close &&
      at(2).open > at(3).close &&
      at(0).open < at(1).close &&
      at(4).trend > 0,
  },
  {
    // Morris: (1) day 1 (oldest, at(3)) any color; (2) day 2 (at(2)) any color,
    // its body gapping down and away from day 1's body; (3-4) the last two days
    // (at(1), at(0)) are long black days; (5) each of the last two days' bodies
    // gaps down and away from the prior day's body. Trend on the oldest bar.
    name: 'Three Gap Downs R+',
    length: 4,
    matches: (at) =>
      at(1).color === 'Black' &&
      at(0).color === 'Black' &&
      at(1).bodyDay === 'Long' &&
      at(0).bodyDay === 'Long' &&
      at(2).bodyTop < at(3).bodyBottom &&
      at(1).bodyTop < at(2).bodyBottom &&
      at(0).bodyTop < at(1).bodyBottom &&
      at(3).trend < 0,
  },
  {
    // Morris (mirror of Three Gap Downs): (1) day 1 (oldest, at(3)) any color;
    // (2) day 2 (at(2)) any color, its body gapping up and away from day 1's
    // body; (3-4) the last two days (at(1), at(0)) are long white days; (5) each
    // of the last two days' bodies gaps up and away from the prior day's body.
    // Trend on the oldest bar.
    name: 'Three Gap Ups R-',
    length: 4,
    matches: (at) =>
      at(1).color === 'White' &&
      at(0).color === 'White' &&
      at(1).bodyDay === 'Long' &&
      at(0).bodyDay === 'Long' &&
      at(2).bodyBottom > at(3).bodyTop &&
      at(1).bodyBottom > at(2).bodyTop &&
      at(0).bodyBottom > at(1).bodyTop &&
      at(3).trend > 0,
  },
  {
    // Morris: (1) the first day (older, at(1)) is the opposite color of the
    // trend; (2) the second day (at(0)) is the opposite color of the first;
    // (3) the two bodies meet in the middle, at the open price. Continuation
    // pattern: trend tested on the first (oldest) bar.
    name: 'Separating Lines C+',
    length: 2,
    matches: (at, cfg = DEFAULT_CANDLE_CONFIG) =>
      at(0).bodyType !== 'Doji' &&
      at(1).bodyType !== 'Doji' &&
      at(0).color === 'White' &&
      at(1).color === 'Black' &&
      pricesEqual(at(0).open, at(1).open, at(0).highLow, cfg) &&
      at(1).trend > 0,
  },
  {
    // Morris mirror of Separating Lines C+. Trend tested on the first (oldest) bar.
    name: 'Separating Lines C-',
    length: 2,
    matches: (at, cfg = DEFAULT_CANDLE_CONFIG) =>
      at(0).bodyType !== 'Doji' &&
      at(1).bodyType !== 'Doji' &&
      at(0).color === 'Black' &&
      at(1).color === 'White' &&
      pricesEqual(at(0).open, at(1).open, at(0).highLow, cfg) &&
      at(1).trend < 0,
  },
  {
    // Morris Bullish On Neck: (1) first day (at(1)) is a long white day in an
    // uptrend; (2) second day (at(0)) is black, opens above the high of the
    // previous day and closes at the high of the previous day. Continuation
    // pattern: trend tested on the first (oldest) bar.
    name: 'On Neck Line C+',
    length: 2,
    matches: (at, cfg = DEFAULT_CANDLE_CONFIG) =>
      at(1).bodyType === 'Long' &&
      at(0).bodyType !== 'Doji' &&
      at(0).color === 'Black' &&
      at(1).color === 'White' &&
      at(0).open > at(1).high &&
      pricesEqual(at(0).close, at(1).high, at(0).highLow, cfg) &&
      at(1).trend > 0,
  },
  {
    // Morris Bearish On Neck: (1) a long black line forms in a downtrend (first
    // day, at(1)); (2) second day (at(0)) is white and opens below the low of the
    // previous day; (3) the second day closes at the low of the first day.
    // Continuation pattern: trend tested on the first (oldest) bar.
    name: 'On Neck Line C-',
    length: 2,
    matches: (at, cfg = DEFAULT_CANDLE_CONFIG) =>
      at(1).bodyType === 'Long' &&
      at(0).bodyType !== 'Doji' &&
      at(1).color === 'Black' &&
      at(0).color === 'White' &&
      at(0).open < at(1).low &&
      pricesEqual(at(0).close, at(1).low, at(0).highLow, cfg) &&
      at(1).trend < 0,
  },
  {
    // Morris Bullish In Neck: (1) first day (at(1)) is a long white day in an
    // uptrend; (2) second day (at(0)) is black, opens above the high of the
    // previous day and closes just barely into the body of the first day.
    // Continuation pattern: trend tested on the first (oldest) bar.
    name: 'In Neck Line C+',
    length: 2,
    matches: (at) =>
      at(1).bodyType === 'Long' &&
      at(0).bodyType !== 'Doji' &&
      at(0).color === 'Black' &&
      at(1).color === 'White' &&
      at(0).open > at(1).high &&
      at(0).close < at(1).close &&
      at(0).close >= at(1).close - (at(1).high - at(1).low) * 0.05 &&
      at(1).trend > 0,
  },
  {
    // Morris Bearish In Neck: (1) a black line develops in a downtrend (first
    // day, at(1)); (2) second day (at(0)) is white, opening below the first day's
    // low; (3) the close of the second day is just barely into the body of the
    // first day (for all practical purposes the closes are equal). Continuation
    // pattern: trend tested on the first (oldest) bar.
    name: 'In Neck Line C-',
    length: 2,
    matches: (at) =>
      at(1).bodyType === 'Long' &&
      at(0).bodyType !== 'Doji' &&
      at(1).color === 'Black' &&
      at(0).color === 'White' &&
      at(0).open < at(1).low &&
      at(0).close > at(1).close &&
      at(0).close <= at(1).close + (at(1).high - at(1).low) * 0.05 &&
      at(1).trend < 0,
  },
  {
    // Morris Bullish Thrusting: (1) first day (at(1)) is a long white day in an
    // uptrend; (2) second day (at(0)) is black, opens way above the high of the
    // first day, then trades down to close within the body of the first day but
    // does not close below the midpoint of the first day's body. Continuation
    // pattern: trend tested on the first (oldest) bar.
    name: 'Thrusting C+',
    length: 2,
    matches: (at) =>
      at(1).bodyType === 'Long' &&
      at(0).bodyType !== 'Doji' &&
      at(0).color === 'Black' &&
      at(1).color === 'White' &&
      at(0).open > at(1).high + (at(1).high - at(1).low) * 0.3 &&
      at(0).close < at(1).close &&
      at(0).close >= (at(1).open + at(1).close) / 2 &&
      at(1).trend > 0,
  },
  {
    // Morris Bearish Thrusting: (1) a black day forms in a downtrend (first day,
    // at(1)); (2) second day (at(0)) is white and opens considerably lower than
    // the low of the first day; (3) the second day closes well into the body of
    // the first day, but not above its midpoint. Continuation pattern: trend
    // tested on the first (oldest) bar.
    name: 'Thrusting C-',
    length: 2,
    matches: (at) =>
      at(1).bodyType === 'Long' &&
      at(0).bodyType !== 'Doji' &&
      at(1).color === 'Black' &&
      at(0).color === 'White' &&
      at(0).open < at(1).low - (at(1).high - at(1).low) * 0.3 &&
      at(0).close > at(1).close &&
      at(0).close <= (at(1).open + at(1).close) / 2 &&
      at(1).trend < 0,
  },
  {
    // Morris: (1) trend underway with a gap between the first two same-color
    // days (at(2), at(1) both white, up-gap between their bodies); (2) those two
    // represent the uptrend; (3) the third day (at(0)) is the opposite color
    // (black) and opens within the body of the second day; (4) the third day
    // closes into the gap but does not fully close it (its close stays above
    // day-1's body top). Trend on the oldest bar.
    name: 'Upside Tasuki Gap C+',
    length: 3,
    matches: (at) =>
      at(0).bodyType !== 'Doji' &&
      at(1).bodyType !== 'Doji' &&
      at(2).bodyType !== 'Doji' &&
      at(2).color === 'White' &&
      at(1).color === 'White' &&
      at(0).color === 'Black' &&
      at(1).bodyBottom > at(2).bodyTop &&
      at(0).open <= at(1).bodyTop &&
      at(0).open >= at(1).bodyBottom &&
      at(0).close < at(1).bodyBottom &&
      at(0).close > at(2).bodyTop &&
      at(2).trend > 0,
  },
  {
    // Morris mirror of Upside Tasuki Gap: (1) gap between the first two same-color
    // days (at(2), at(1) both black, down-gap between their bodies); (2) those two
    // represent the downtrend; (3) the third day (at(0)) is white and opens within
    // the body of the second day; (4) the third day closes into the gap but does
    // not fully close it (its close stays below day-1's body bottom). Trend on
    // the oldest bar.
    name: 'Downside Tasuki Gap C-',
    length: 3,
    matches: (at) =>
      at(0).bodyType !== 'Doji' &&
      at(1).bodyType !== 'Doji' &&
      at(2).bodyType !== 'Doji' &&
      at(2).color === 'Black' &&
      at(1).color === 'Black' &&
      at(0).color === 'White' &&
      at(1).bodyTop < at(2).bodyBottom &&
      at(0).open >= at(1).bodyBottom &&
      at(0).open <= at(1).bodyTop &&
      at(0).close > at(1).bodyTop &&
      at(0).close < at(2).bodyBottom &&
      at(2).trend < 0,
  },
  {
    // Morris: (1) a gap is made in the direction of the trend (up-gap between
    // day-1 (at(2), white uptrend day) and the pair above it); (2) the second
    // day (at(1)) is a white candle; (3) the third day (at(0)) is also white, of
    // about the same size, opening at about the same price. Trend on the oldest bar.
    name: 'Side by Side White Lines C+',
    length: 3,
    matches: (at) =>
      at(0).bodyType !== 'Doji' &&
      at(1).bodyType !== 'Doji' &&
      at(2).bodyType === 'Long' &&
      at(0).color === 'White' &&
      at(1).color === 'White' &&
      at(2).color === 'White' &&
      at(1).bodyBottom > at(2).bodyTop &&
      at(0).bodyBottom > at(2).bodyTop &&
      Math.abs(((at(1).open - at(0).open) / at(0).open) * 100) < 1 &&
      Math.min(at(0).body, at(1).body) >= Math.max(at(0).body, at(1).body) * 0.5 &&
      at(2).trend > 0,
  },
  {
    // Morris (downtrend variant): (1) a gap is made in the direction of the trend
    // (down-gap between day-1 (at(2), black downtrend day) and the pair below it);
    // (2) the second day (at(1)) is a white candle; (3) the third day (at(0)) is
    // also white, of about the same size, opening at about the same price. Trend
    // on the oldest bar.
    name: 'Side by Side White Lines C-',
    length: 3,
    matches: (at) =>
      at(0).bodyType !== 'Doji' &&
      at(1).bodyType !== 'Doji' &&
      at(2).bodyType === 'Long' &&
      at(0).color === 'White' &&
      at(1).color === 'White' &&
      at(2).color === 'Black' &&
      at(1).bodyTop < at(2).bodyBottom &&
      at(0).bodyTop < at(2).bodyBottom &&
      Math.abs(((at(1).open - at(0).open) / at(0).open) * 100) < 1 &&
      Math.min(at(0).body, at(1).body) >= Math.max(at(0).body, at(1).body) * 0.5 &&
      at(2).trend < 0,
  },
  {
    // Morris Bullish Side-by-Side Black: (1) long white day in an uptrend (day-1,
    // at(2)); (2) second day (at(1)) is black and opens above the previous close;
    // (3) it trades lower but never low enough to close the gap (its body stays
    // above day-1's body); (4) the third day (at(0)) opens higher, above the
    // midpoint of the previous day, then drops and closes down for the day, still
    // not low enough to fill the gap formed by the first two days. Trend on the
    // oldest bar.
    name: 'Side by Side Black Lines C+',
    length: 3,
    matches: (at) =>
      at(0).bodyType !== 'Doji' &&
      at(1).bodyType !== 'Doji' &&
      at(2).bodyDay === 'Long' &&
      at(2).color === 'White' &&
      at(1).color === 'Black' &&
      at(0).color === 'Black' &&
      at(1).open > at(2).close &&
      at(1).bodyBottom > at(2).bodyTop &&
      at(0).open > (at(1).open + at(1).close) / 2 &&
      at(0).bodyBottom > at(2).bodyTop &&
      at(2).trend > 0,
  },
  {
    // Morris Bearish Side-by-Side Black: (1) long black day in a downtrend
    // (day-1, at(2)); (2) second day (at(1)) is also a long black day that opens
    // below the previous close, forming a gap between the two black bodies;
    // (3) the third day (at(0)) opens much higher, but not so high as to fill the
    // gap, then declines and closes down for the day. Trend on the oldest bar.
    name: 'Side by Side Black Lines C-',
    length: 3,
    matches: (at) =>
      at(0).bodyType !== 'Doji' &&
      at(2).bodyDay === 'Long' &&
      at(1).bodyDay === 'Long' &&
      at(2).color === 'Black' &&
      at(1).color === 'Black' &&
      at(0).color === 'Black' &&
      at(1).open < at(2).close &&
      at(1).bodyTop < at(2).bodyBottom &&
      at(0).open > at(1).bodyTop &&
      at(0).bodyTop < at(2).bodyBottom &&
      at(2).trend < 0,
  },
  {
    // Morris: (1) an uptrend continues with two long white days that have a gap
    // between them (at(2), at(1)); (2) the third day (at(0)) fills the gap and is
    // the opposite color (black). Trend on the oldest bar.
    name: 'Upside Gap 3 Methods C+',
    length: 3,
    matches: (at) =>
      at(0).bodyType !== 'Doji' &&
      at(2).bodyType === 'Long' &&
      at(1).bodyType === 'Long' &&
      at(0).color === 'Black' &&
      at(1).color === 'White' &&
      at(2).color === 'White' &&
      at(2).bodyTop < at(1).bodyBottom &&
      at(2).bodyTop > at(0).bodyBottom &&
      at(2).bodyBottom < at(0).bodyBottom &&
      at(1).bodyTop > at(0).bodyTop &&
      at(1).bodyBottom < at(0).bodyTop &&
      at(2).trend > 0,
  },
  {
    // Morris mirror of Upside Gap 3 Methods: (1) a downtrend continues with two
    // long black days that have a gap between them (at(2), at(1)); (2) the third
    // day (at(0)) fills the gap and is the opposite color (white). Trend on the
    // oldest bar.
    name: 'Downside Gap 3 Methods C-',
    length: 3,
    matches: (at) =>
      at(0).bodyType !== 'Doji' &&
      at(2).bodyType === 'Long' &&
      at(1).bodyType === 'Long' &&
      at(0).color === 'White' &&
      at(1).color === 'Black' &&
      at(2).color === 'Black' &&
      at(1).bodyTop < at(2).bodyBottom &&
      at(2).bodyTop > at(0).bodyTop &&
      at(2).bodyBottom < at(0).bodyTop &&
      at(1).bodyTop > at(0).bodyBottom &&
      at(1).bodyBottom < at(0).bodyBottom &&
      at(2).trend < 0,
  },
  {
    // Morris Rest After Battle: (1) the pattern starts with a long white day
    // (the oldest bar, at(2)) whose range midpoint is above the 10-period
    // (exponential) moving average — i.e. an uptrend is in place; (2) the first
    // day's high-low range exceeds the average of the five days' ranges that
    // immediately precede the pattern; (3) that first day has a very long body.
    // Morris states no recognition rules for the two "resting" days that follow,
    // so days 2-3 (at(1)/at(0)) are left unconstrained.
    //
    // Rule 2's five preceding bars sit before this length-3 window but are still
    // in the series, so they are read via at(3..7). Near the start of the series
    // those are undefined; the guard makes the pattern simply not fire there
    // (it can't anyway — rule 1 needs an established 10-period trend first).
    name: 'Rest After Battle C+',
    length: 3,
    matches: (at) => {
      if (
        at(2).bodyType !== 'Long' ||
        at(2).bodyDay !== 'Long' ||
        at(2).color !== 'White' ||
        at(2).trend <= 0
      ) {
        return false;
      }
      const priorRanges = [at(3), at(4), at(5), at(6), at(7)] as (CandleMetrics | undefined)[];
      if (priorRanges.some((barMetrics) => barMetrics === undefined)) {
        return false;
      }
      const avgPriorRange =
        priorRanges.reduce((sum, barMetrics) => sum + barMetrics!.highLow, 0) / priorRanges.length;
      return at(2).highLow > avgPriorRange;
    },
  },
  {
    // Morris: (1) a long candlestick represents the current trend (day-1, at(4),
    // white); (2) it is followed by a group of small real bodies (best if opposite
    // color, but color is only a preference so it is not enforced); (3) the small
    // candles drift opposite to the trend (downward) and remain within the
    // high-low range of the first day; (4) the final day (at(0)) is strong,
    // closing outside the first day's close in the trend direction. Trend on the
    // oldest bar.
    name: 'Rising 3 Methods C+',
    length: 5,
    matches: (at) =>
      at(4).bodyType === 'Long' &&
      at(3).bodyType === 'Short' &&
      at(2).bodyType === 'Short' &&
      at(1).bodyType === 'Short' &&
      at(0).bodyType === 'Long' &&
      at(4).color === 'White' &&
      at(0).color === 'White' &&
      at(3).bodyTop < at(4).high &&
      at(3).bodyBottom > at(4).low &&
      at(2).bodyTop < at(4).high &&
      at(2).bodyBottom > at(4).low &&
      at(1).bodyTop < at(4).high &&
      at(1).bodyBottom > at(4).low &&
      at(1).bodyMid < at(3).bodyMid &&
      at(0).close > at(4).close &&
      at(4).trend > 0,
  },
  {
    // Morris mirror of Rising Three Methods: (1) a long black day represents the
    // downtrend (day-1, at(4)); (2) a group of small real bodies follows (color is
    // only a preference, so not enforced); (3) the small candles drift upward
    // (opposite the trend) and remain within the first day's high-low range;
    // (4) the final day (at(0)) is a strong black day closing below the first
    // day's close. Trend on the oldest bar.
    name: 'Falling 3 Methods C-',
    length: 5,
    matches: (at) =>
      at(4).bodyType === 'Long' &&
      at(3).bodyType === 'Short' &&
      at(2).bodyType === 'Short' &&
      at(1).bodyType === 'Short' &&
      at(0).bodyType === 'Long' &&
      at(4).color === 'Black' &&
      at(0).color === 'Black' &&
      at(3).bodyTop < at(4).high &&
      at(3).bodyBottom > at(4).low &&
      at(2).bodyTop < at(4).high &&
      at(2).bodyBottom > at(4).low &&
      at(1).bodyTop < at(4).high &&
      at(1).bodyBottom > at(4).low &&
      at(1).bodyMid > at(3).bodyMid &&
      at(0).close < at(4).close &&
      at(4).trend < 0,
  },
  {
    // Morris Bullish Mat Hold: (1) a long white day forms in an uptrend (day-1,
    // at(4)); (2) a gap up with a lower close on the second day (at(3)) makes an
    // almost starlike day; (3) the following two days (at(2), at(1)) are reaction
    // days similar to Rising Three Methods, drifting down; (4) the fifth day
    // (at(0)) is a white day making a new closing high (above day-1's close and
    // the reaction highs). Trend on the oldest bar.
    name: 'Mat Hold C+',
    length: 5,
    matches: (at) =>
      at(4).color === 'White' &&
      at(3).color === 'Black' &&
      at(0).color === 'White' &&
      at(4).bodyType === 'Long' &&
      at(0).bodyType === 'Long' &&
      at(3).bodyBottom > at(4).bodyTop &&
      at(2).bodyTop < at(3).bodyTop &&
      at(2).bodyBottom < at(3).bodyBottom &&
      at(1).bodyTop < at(2).bodyTop &&
      at(1).bodyBottom < at(2).bodyBottom &&
      at(0).close > at(4).close &&
      at(0).close > at(3).bodyTop &&
      at(4).trend > 0,
  },
  {
    // Morris Bearish Mat Hold: (1) a long black day begins the pattern in a
    // downtrend (day-1, at(4)); (2) the next day (at(3)) is white whose real body
    // gaps away from the prior black body; (3) two relatively short days follow
    // (at(2), at(1)), each making a higher top and bottom than the preceding day;
    // (4) the fifth day (at(0)) is a long black day that opens below the close of
    // the fourth day (at(1)) and closes below the open of the second day (at(3)).
    // Trend on the oldest bar.
    name: 'Mat Hold C-',
    length: 5,
    matches: (at) =>
      at(4).color === 'Black' &&
      at(3).color === 'White' &&
      at(0).color === 'Black' &&
      at(4).bodyType === 'Long' &&
      at(0).bodyType === 'Long' &&
      at(2).bodyType === 'Short' &&
      at(1).bodyType === 'Short' &&
      at(3).bodyTop < at(4).bodyBottom &&
      at(2).bodyTop > at(3).bodyTop &&
      at(2).bodyBottom > at(3).bodyBottom &&
      at(1).bodyTop > at(2).bodyTop &&
      at(1).bodyBottom > at(2).bodyBottom &&
      at(0).open < at(1).close &&
      at(0).close < at(3).open &&
      at(4).trend < 0,
  },
  {
    // Morris Bullish Three-Line Strike: (1) three days resembling Three White
    // Soldiers continue an uptrend — three consecutive long white lines, each with
    // a higher close, each opening within the previous body and closing at or near
    // its high (days 1-3 = at(3), at(2), at(1)); (2) a higher open on the fourth
    // day (at(0)) drops to close below the open of the first white day. Trend on
    // the oldest bar.
    name: '3 Line Strike C+',
    length: 4,
    matches: (at) =>
      at(3).color === 'White' &&
      at(2).color === 'White' &&
      at(1).color === 'White' &&
      at(0).color === 'Black' &&
      at(3).bodyType === 'Long' &&
      at(2).bodyType === 'Long' &&
      at(1).bodyType === 'Long' &&
      at(0).bodyType !== 'Doji' &&
      at(2).close > at(3).close &&
      at(1).close > at(2).close &&
      at(2).open > at(3).bodyBottom &&
      at(2).open < at(3).bodyTop &&
      at(1).open > at(2).bodyBottom &&
      at(1).open < at(2).bodyTop &&
      at(2).upperShadowHl <= 20 &&
      at(1).upperShadowHl <= 20 &&
      at(0).open > at(1).close &&
      at(0).close < at(3).open &&
      at(3).trend > 0,
  },
  {
    // Morris Bearish Three-Line Strike (mirror): (1) three days resembling Three
    // Black Crows continue a downtrend — three consecutive long black lines, each
    // with a lower close, each opening within the previous body and closing at or
    // near its low (days 1-3 = at(3), at(2), at(1)); (2) a lower open on the fourth
    // day (at(0)) rallies to close above the open of the first black day. Trend on
    // the oldest bar.
    name: '3 Line Strike C-',
    length: 4,
    matches: (at) =>
      at(3).color === 'Black' &&
      at(2).color === 'Black' &&
      at(1).color === 'Black' &&
      at(0).color === 'White' &&
      at(3).bodyType === 'Long' &&
      at(2).bodyType === 'Long' &&
      at(1).bodyType === 'Long' &&
      at(0).bodyType !== 'Doji' &&
      at(2).close < at(3).close &&
      at(1).close < at(2).close &&
      at(2).open < at(3).bodyTop &&
      at(2).open > at(3).bodyBottom &&
      at(1).open < at(2).bodyTop &&
      at(1).open > at(2).bodyBottom &&
      at(2).lowerShadowHl <= 20 &&
      at(1).lowerShadowHl <= 20 &&
      at(0).open < at(1).close &&
      at(0).close > at(3).open &&
      at(3).trend < 0,
  },
];
