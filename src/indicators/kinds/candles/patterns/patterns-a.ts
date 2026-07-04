import { CandlePattern, pricesEqual } from '../candle-pattern';
import { DEFAULT_CANDLE_CONFIG } from '../candle-config';

export const PATTERNS_A: CandlePattern[] = [
  {
    name: 'Hammer R+',
    length: 1,
    matches: (at, cfg = DEFAULT_CANDLE_CONFIG) =>
      at(0).bodyType === 'Short' &&
      at(0).lowerShadow >= cfg.hammerLowerShadowMinPctOfBody &&
      at(0).upperShadowHl <= cfg.umbrellaShortShadowMaxPctOfRange &&
      at(0).trend < 0,
  },
  {
    name: 'Hanging Man R-',
    length: 1,
    matches: (at, cfg = DEFAULT_CANDLE_CONFIG) =>
      at(0).bodyType === 'Short' &&
      at(0).lowerShadow >= cfg.hammerLowerShadowMinPctOfBody &&
      at(0).upperShadowHl <= cfg.umbrellaShortShadowMaxPctOfRange &&
      at(0).trend > 0,
  },
  {
    // Morris: a white line that opens on its low (no lower shadow). A full
    // opening marubozu (also no upper shadow) qualifies, so require only the
    // open-end shadow to be absent.
    name: 'Belt Hold R+',
    length: 1,
    matches: (at) =>
      at(0).color === 'White' &&
      at(0).bodyType === 'Long' &&
      at(0).lowerShadow === 0 &&
      at(0).trend < 0,
  },
  {
    // Morris: a black line that opens on its high (no upper shadow).
    name: 'Belt Hold R-',
    length: 1,
    matches: (at) =>
      at(0).color === 'Black' &&
      at(0).bodyType === 'Long' &&
      at(0).upperShadow === 0 &&
      at(0).trend > 0,
  },
  {
    // Morris: 2nd day's body completely engulfed by the prior body; the two
    // bodies are opposite colors; first-day color reflects the trend. The
    // engulf geometry already encodes the large>small relationship, so no
    // Long/Short classification is imposed.
    name: 'Engulfing R+',
    length: 2,
    matches: (at) =>
      at(0).color === 'White' &&
      at(1).color === 'Black' &&
      ((at(0).bodyTop >= at(1).bodyTop && at(0).bodyBottom < at(1).bodyBottom) ||
        (at(0).bodyTop > at(1).bodyTop && at(0).bodyBottom <= at(1).bodyBottom)) &&
      at(1).trend < 0,
  },
  {
    name: 'Engulfing R-',
    length: 2,
    matches: (at) =>
      at(0).color === 'Black' &&
      at(1).color === 'White' &&
      ((at(0).bodyTop >= at(1).bodyTop && at(0).bodyBottom < at(1).bodyBottom) ||
        (at(0).bodyTop > at(1).bodyTop && at(0).bodyBottom <= at(1).bodyBottom)) &&
      at(1).trend > 0,
  },
  {
    // Morris: long first day (reflecting the trend), short opposite-color second
    // day whose body is completely inside the first body.
    name: 'Harami R+',
    length: 2,
    matches: (at) =>
      at(0).color === 'White' &&
      at(1).color === 'Black' &&
      at(0).bodyType === 'Short' &&
      at(1).bodyType === 'Long' &&
      ((at(0).bodyTop <= at(1).bodyTop && at(0).bodyBottom > at(1).bodyBottom) ||
        (at(0).bodyTop < at(1).bodyTop && at(0).bodyBottom >= at(1).bodyBottom)) &&
      at(1).trend < 0,
  },
  {
    name: 'Harami R-',
    length: 2,
    matches: (at) =>
      at(0).color === 'Black' &&
      at(1).color === 'White' &&
      at(0).bodyType === 'Short' &&
      at(1).bodyType === 'Long' &&
      ((at(0).bodyTop <= at(1).bodyTop && at(0).bodyBottom > at(1).bodyBottom) ||
        (at(0).bodyTop < at(1).bodyTop && at(0).bodyBottom >= at(1).bodyBottom)) &&
      at(1).trend > 0,
  },
  {
    // Morris: long day within a trend, followed by a doji whose range is inside
    // the long day's body.
    name: 'Harami Cross R+',
    length: 2,
    matches: (at) =>
      at(1).color === 'Black' &&
      at(0).bodyType === 'Doji' &&
      at(1).bodyType === 'Long' &&
      at(0).high <= at(1).bodyTop &&
      at(0).low >= at(1).bodyBottom &&
      at(1).trend < 0,
  },
  {
    name: 'Harami Cross R-',
    length: 2,
    matches: (at) =>
      at(1).color === 'White' &&
      at(0).bodyType === 'Doji' &&
      at(1).bodyType === 'Long' &&
      at(0).high <= at(1).bodyTop &&
      at(0).low >= at(1).bodyBottom &&
      at(1).trend > 0,
  },
  {
    // Morris: small body near the LOW of the range, upper shadow no more than
    // 2x the body, virtually no lower shadow. No gap down is required.
    name: 'Inverted Hammer R+',
    length: 1,
    matches: (at, cfg = DEFAULT_CANDLE_CONFIG) =>
      at(0).bodyType === 'Short' &&
      at(0).lowerShadowHl <= cfg.umbrellaShortShadowMaxPctOfRange &&
      at(0).upperShadow >= cfg.invertedHammerUpperShadowMinPctOfBody && // % of body
      (cfg.invertedHammerUpperShadowMaxPctOfBody === null ||
        at(0).upperShadow <= cfg.invertedHammerUpperShadowMaxPctOfBody) &&
      at(0).trend < 0,
  },
  {
    // Morris: prices gap open after an uptrend, small body near the low of the
    // range, upper shadow at least 3x the body, virtually no lower shadow.
    name: 'Shooting Star R-',
    length: 2,
    matches: (at, cfg = DEFAULT_CANDLE_CONFIG) =>
      at(0).bodyType === 'Short' &&
      at(0).lowerShadowHl <= cfg.umbrellaShortShadowMaxPctOfRange &&
      at(0).upperShadow >= cfg.shootingStarUpperShadowMinPctOfBody &&
      at(0).bodyBottom >= at(1).bodyTop &&
      at(0).trend > 0,
  },
  {
    // Morris: 1st day long black continuing the downtrend; 2nd day white opens
    // below the prior day's LOW (not close) and closes within but above the
    // midpoint of the prior body.
    name: 'Piercing Line R+',
    length: 2,
    matches: (at) =>
      at(1).bodyType === 'Long' &&
      at(0).color === 'White' &&
      at(1).color === 'Black' &&
      at(0).bodyBottom < at(1).low &&
      at(0).bodyTop < at(1).bodyTop &&
      at(0).bodyTop >= (at(1).open + at(1).close) / 2 &&
      at(0).trend < 0,
  },
  {
    // Morris: 1st day long white continuing the uptrend; 2nd day black opens
    // above the prior day's HIGH (not close) and closes within and below the
    // midpoint of the prior white body.
    name: 'Dark Cloud Cover R-',
    length: 2,
    matches: (at) =>
      at(1).bodyType === 'Long' &&
      at(0).color === 'Black' &&
      at(1).color === 'White' &&
      at(0).bodyTop > at(1).high &&
      at(0).bodyBottom > at(1).bodyBottom &&
      at(0).bodyBottom <= (at(1).open + at(1).close) / 2 &&
      at(0).trend > 0,
  },
  {
    // Morris: 1st day long, 2nd day a doji that gaps in the direction of the
    // prior trend (a real gap from the prior body).
    name: 'Doji Star R+',
    length: 2,
    matches: (at) =>
      at(0).bodyType === 'Doji' &&
      at(1).bodyType === 'Long' &&
      at(1).color === 'Black' &&
      at(0).bodyTop < at(1).bodyBottom &&
      at(0).trend < 0,
  },
  {
    name: 'Doji Star R-',
    length: 2,
    matches: (at) =>
      at(0).bodyType === 'Doji' &&
      at(1).bodyType === 'Long' &&
      at(1).color === 'White' &&
      at(0).bodyBottom > at(1).bodyTop &&
      at(0).trend > 0,
  },
  {
    name: 'Meeting Lines R+',
    length: 2,
    matches: (at, cfg = DEFAULT_CANDLE_CONFIG) =>
      at(0).bodyType === 'Long' &&
      at(1).bodyType === 'Long' &&
      at(0).color === 'White' &&
      at(1).color === 'Black' &&
      pricesEqual(at(0).close, at(1).close, at(0).highLow, cfg) &&
      at(0).trend < 0,
  },
  {
    name: 'Meeting Lines R-',
    length: 2,
    matches: (at, cfg = DEFAULT_CANDLE_CONFIG) =>
      at(0).bodyType === 'Long' &&
      at(1).bodyType === 'Long' &&
      at(0).color === 'Black' &&
      at(1).color === 'White' &&
      pricesEqual(at(0).close, at(1).close, at(0).highLow, cfg) &&
      at(0).trend > 0,
  },
  {
    // Morris: long black body in a downtrend, then a short black body completely
    // inside the previous day's body.
    name: 'Homing Pigeon R+',
    length: 2,
    matches: (at) =>
      at(0).color === 'Black' &&
      at(1).color === 'Black' &&
      at(0).bodyType === 'Short' &&
      at(1).bodyType === 'Long' &&
      at(0).bodyTop < at(1).bodyTop &&
      at(0).bodyBottom > at(1).bodyBottom &&
      at(1).trend < 0,
  },
  {
    // Morris: long white body in an uptrend; both bodies white and long; the
    // second body is completely engulfed by the first.
    name: 'Descending Hawk R-',
    length: 2,
    matches: (at) =>
      at(0).color === 'White' &&
      at(1).color === 'White' &&
      at(0).bodyType === 'Long' &&
      at(1).bodyType === 'Long' &&
      at(0).bodyTop < at(1).bodyTop &&
      at(0).bodyBottom > at(1).bodyBottom &&
      at(1).trend > 0,
  },
  {
    // Morris: a long black day, then a second black day whose close equals the
    // first day's close (within tolerance).
    name: 'Matching Low R+',
    length: 2,
    matches: (at, cfg = DEFAULT_CANDLE_CONFIG) =>
      at(0).color === 'Black' &&
      at(1).color === 'Black' &&
      at(1).bodyType === 'Long' &&
      pricesEqual(at(0).close, at(1).close, at(0).highLow, cfg) &&
      at(1).trend < 0,
  },
  {
    // Morris: first day a long white day in an uptrend; second day has the same
    // closing price; both days have little or no upper shadow.
    name: 'Matching High R-',
    length: 2,
    matches: (at, cfg = DEFAULT_CANDLE_CONFIG) =>
      at(0).color === 'White' &&
      at(1).color === 'White' &&
      at(1).bodyType === 'Long' &&
      pricesEqual(at(0).close, at(1).close, at(0).highLow, cfg) &&
      at(1).trend > 0 &&
      at(0).upperShadowHl <= cfg.umbrellaShortShadowMaxPctOfRange &&
      at(1).upperShadowHl <= cfg.umbrellaShortShadowMaxPctOfRange,
  },
  {
    // Morris: a marubozu of one color followed by an opposite-color marubozu,
    // with a gap between the two lines. No trend required.
    name: 'Kicking R+',
    length: 2,
    matches: (at) =>
      at(0).baseBody === 'Marubozu' &&
      at(1).baseBody === 'Marubozu' &&
      at(0).color === 'White' &&
      at(1).color === 'Black' &&
      at(0).bodyBottom > at(1).bodyTop,
  },
  {
    name: 'Kicking R-',
    length: 2,
    matches: (at) =>
      at(0).baseBody === 'Marubozu' &&
      at(1).baseBody === 'Marubozu' &&
      at(0).color === 'Black' &&
      at(1).color === 'White' &&
      at(0).bodyTop < at(1).bodyBottom,
  },
  {
    // Morris: 1st day long black; 2nd day long white that opens at or above the
    // prior close and closes above the high of the previous day.
    name: 'One White Soldier R+',
    length: 2,
    matches: (at) =>
      at(0).bodyType === 'Long' &&
      at(1).bodyType === 'Long' &&
      at(0).color === 'White' &&
      at(1).color === 'Black' &&
      at(0).bodyBottom >= at(1).bodyBottom &&
      at(0).bodyTop > at(1).high &&
      at(1).trend < 0,
  },
  {
    // Morris: 1st day long white; 2nd day long black that opens at or below the
    // prior close and closes below the low of the previous day.
    name: 'One Black Crow R-',
    length: 2,
    matches: (at) =>
      at(0).bodyType === 'Long' &&
      at(1).bodyType === 'Long' &&
      at(0).color === 'Black' &&
      at(1).color === 'White' &&
      at(0).bodyTop <= at(1).bodyTop &&
      at(0).bodyBottom < at(1).low &&
      at(1).trend > 0,
  },
  {
    // Morris: 1st day long black (reflecting the downtrend); 2nd day the star,
    // gapped from the first day's body; 3rd day long white (opposite color of
    // the first). Trend is tied to the first day of the pattern.
    name: 'Morning Star R+',
    length: 3,
    matches: (at) =>
      at(2).color === 'Black' &&
      at(0).color === 'White' &&
      at(2).bodyType === 'Long' &&
      at(1).bodyType === 'Short' &&
      at(0).bodyType === 'Long' &&
      at(2).bodyBottom > at(1).bodyTop &&
      at(0).bodyBottom > at(1).bodyTop &&
      at(2).trend < 0,
  },
  {
    name: 'Evening Star R-',
    length: 3,
    matches: (at) =>
      at(2).color === 'White' &&
      at(0).color === 'Black' &&
      at(2).bodyType === 'Long' &&
      at(1).bodyType === 'Short' &&
      at(0).bodyType === 'Long' &&
      at(2).bodyTop < at(1).bodyBottom &&
      at(0).bodyTop < at(1).bodyBottom &&
      at(2).trend > 0,
  },
  {
    // Morris: like Morning Star but the star is a doji that gaps.
    name: 'Morning Doji Star R+',
    length: 3,
    matches: (at) =>
      at(2).color === 'Black' &&
      at(0).color === 'White' &&
      at(2).bodyType === 'Long' &&
      at(1).bodyType === 'Doji' &&
      at(0).bodyType === 'Long' &&
      at(2).bodyBottom > at(1).bodyTop &&
      at(0).bodyBottom > at(1).bodyTop &&
      at(2).trend < 0,
  },
  {
    name: 'Evening Doji Star R-',
    length: 3,
    matches: (at) =>
      at(2).color === 'White' &&
      at(0).color === 'Black' &&
      at(2).bodyType === 'Long' &&
      at(1).bodyType === 'Doji' &&
      at(0).bodyType === 'Long' &&
      at(2).bodyTop < at(1).bodyBottom &&
      at(0).bodyTop < at(1).bodyBottom &&
      at(2).trend > 0,
  },
  {
    // Morris: 1st day reflects the trend; 2nd day a doji whose shadow gaps
    // fully above/below the prior shadow; 3rd day opposite color gapping the
    // other way with no shadows overlapping.
    name: 'Abandoned Baby R+',
    length: 3,
    matches: (at) =>
      at(2).color === 'Black' &&
      at(0).color === 'White' &&
      at(2).bodyType === 'Long' &&
      at(1).bodyType === 'Doji' &&
      at(0).bodyType === 'Long' &&
      at(2).low > at(1).high &&
      at(0).low > at(1).high &&
      at(2).trend < 0,
  },
  {
    name: 'Abandoned Baby R-',
    length: 3,
    matches: (at) =>
      at(2).color === 'White' &&
      at(0).color === 'Black' &&
      at(2).bodyType === 'Long' &&
      at(1).bodyType === 'Doji' &&
      at(0).bodyType === 'Long' &&
      at(2).high < at(1).low &&
      at(0).high < at(1).low &&
      at(2).trend > 0,
  },
  {
    // Morris: all three days are doji; the second gaps above/below the first
    // and third. R+ (bottom): the middle doji gaps below.
    name: 'Tri Star R+',
    length: 3,
    matches: (at) =>
      at(2).bodyType === 'Doji' &&
      at(1).bodyType === 'Doji' &&
      at(0).bodyType === 'Doji' &&
      at(2).bodyBottom > at(1).bodyTop &&
      at(0).bodyBottom > at(1).bodyTop &&
      at(2).trend < 0,
  },
  {
    name: 'Tri Star R-',
    length: 3,
    matches: (at) =>
      at(2).bodyType === 'Doji' &&
      at(1).bodyType === 'Doji' &&
      at(0).bodyType === 'Doji' &&
      at(2).bodyTop < at(1).bodyBottom &&
      at(0).bodyTop < at(1).bodyBottom &&
      at(2).trend > 0,
  },
  {
    // Morris: uptrend with a long white day; an upward-gapping black day; a
    // second black day that opens above the first black body and engulfs it,
    // still closing above the long white day's close.
    name: 'Upside Gap Two Crows R-',
    length: 3,
    matches: (at) =>
      at(2).color === 'White' &&
      at(2).bodyType === 'Long' &&
      at(1).color === 'Black' &&
      at(0).color === 'Black' &&
      at(1).bodyBottom > at(2).bodyTop &&
      at(0).bodyTop > at(1).bodyTop &&
      at(0).bodyBottom < at(1).bodyBottom &&
      at(0).bodyBottom > at(2).bodyTop &&
      at(2).trend > 0,
  },
];
