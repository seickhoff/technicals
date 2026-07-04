import { CandlePattern } from '../candle-pattern';
import { PATTERNS_A } from './patterns-a';
import { PATTERNS_B } from './patterns-b';
import { PATTERNS_C } from './patterns-c';

/** Every candlestick pattern, in detection order. */
export const ALL_CANDLE_PATTERNS: CandlePattern[] = [...PATTERNS_A, ...PATTERNS_B, ...PATTERNS_C];

/** The name of every candlestick pattern (each carries its R±/C± tag suffix). */
export const CANDLE_PATTERN_NAMES: readonly string[] = ALL_CANDLE_PATTERNS.map(
  (pattern) => pattern.name,
);
