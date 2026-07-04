import { describe, expect, it } from 'vitest';
import { createDefaultIndicatorRegistry, PriceBar } from '../src/index';
import { ALL_CANDLE_PATTERNS } from '../src/indicators/kinds/candles/patterns';

const registry = createDefaultIndicatorRegistry();

function computeCandle(bars: PriceBar[]) {
  const result = registry.resolve('CANDLE').compute(bars, {});
  return {
    color: result.get('color').values,
    trend: result.get('trend').values,
    patterns: result.get('patterns').values,
  };
}

function bar(date: string, open: number, high: number, low: number, close: number): PriceBar {
  return { date, open, high, low, close, volume: 1000 };
}

describe('candlestick indicator', () => {
  it('registers all 89 patterns', () => {
    expect(ALL_CANDLE_PATTERNS).toHaveLength(89);
  });

  it('emits color/trend/patterns series aligned with the bars', () => {
    const bars = Array.from({ length: 15 }, (_, i) =>
      bar(`2020-02-${String(i + 1).padStart(2, '0')}`, 10, 11, 9, 10.5),
    );
    const { color, trend, patterns } = computeCandle(bars);
    expect(color).toHaveLength(15);
    expect(trend).toHaveLength(15);
    expect(patterns).toHaveLength(15);
    expect(color[14]).toBe('White'); // close 10.5 > open 10
  });

  it('detects a bullish engulfing after a downtrend', () => {
    const bars: PriceBar[] = [];
    // 11 declining black bars with sizeable bodies establish a downtrend.
    for (let i = 0; i <= 10; i++) {
      const close = 100 - i;
      bars.push(
        bar(
          `2020-03-${String(i + 1).padStart(2, '0')}`,
          close + 1,
          close + 1.1,
          close - 0.1,
          close,
        ),
      );
    }
    // A small black bar, then a long white bar that engulfs it.
    bars.push(bar('2020-03-12', 90.3, 90.4, 89.9, 90.0));
    bars.push(bar('2020-03-13', 89.5, 91.6, 89.4, 91.5));

    const { patterns } = computeCandle(bars);
    expect(patterns[patterns.length - 1]).toContain('Engulfing R+');
  });
});
