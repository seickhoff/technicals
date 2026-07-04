import { describe, expect, it } from 'vitest';
import { PriceBar } from '../src/index';
import { computeCandleMetrics } from '../src/indicators/kinds/candles/candle-metrics';

function bar(open: number, high: number, low: number, close: number): PriceBar {
  return { date: '2020-01-01', open, high, low, close, volume: 1000 };
}

/** Metrics for a single bar (warm-up: smaBody is 0 and the 10-EMA is undefined). */
function metricsOf(open: number, high: number, low: number, close: number) {
  return computeCandleMetrics([bar(open, high, low, close)])[0]!;
}

/** Ten body-4 white bars to prime smaBody, followed by `last`. Returns the last bar's metrics. */
function metricsAfterWarmup(last: PriceBar) {
  const warmup = Array.from({ length: 10 }, () => bar(10, 14, 10, 14));
  const all = computeCandleMetrics([...warmup, last]);
  return all[all.length - 1]!;
}

describe('candle color', () => {
  it('is White when the close is above the open', () => {
    expect(metricsOf(10, 15, 9, 14).color).toBe('White');
  });

  it('is Black when the close is below the open', () => {
    expect(metricsOf(14, 15, 9, 10).color).toBe('Black');
  });

  it('is White for a flat bar where close equals open', () => {
    expect(metricsOf(10, 11, 9, 10).color).toBe('White');
  });
});

describe('candle body geometry', () => {
  it('takes bodyTop/bodyBottom from the open and close, and body as their gap', () => {
    const m = metricsOf(10, 15, 9, 14);
    expect(m.bodyTop).toBe(14);
    expect(m.bodyBottom).toBe(10);
    expect(m.body).toBe(4);
    expect(m.highLow).toBe(6);
  });

  it('orders bodyTop above bodyBottom for a black bar too', () => {
    const m = metricsOf(14, 15, 9, 10);
    expect(m.bodyTop).toBe(14);
    expect(m.bodyBottom).toBe(10);
  });
});

describe('candle shadows', () => {
  it('reports shadows as whole-percent of the body and of the high-low range', () => {
    const m = metricsOf(10, 15, 9, 14);
    expect(m.upperShadow).toBe(25); // (15-14)/4
    expect(m.lowerShadow).toBe(25); // (10-9)/4
    expect(m.upperShadowHl).toBe(17); // (15-14)/6, rounded
    expect(m.lowerShadowHl).toBe(17); // (10-9)/6, rounded
  });

  it('reports zero shadows when the range collapses', () => {
    const m = metricsOf(10, 10, 10, 10);
    expect(m.upperShadow).toBe(0);
    expect(m.lowerShadow).toBe(0);
  });
});

describe('candle bodyDay', () => {
  it('is Long when twice the body covers at least the high-low range', () => {
    expect(metricsOf(10, 13, 9, 12).bodyDay).toBe('Long'); // 2*2 >= 4
  });

  it('is Short when the body is small relative to the range', () => {
    expect(metricsOf(10, 13, 9, 10.5).bodyDay).toBe('Short'); // 2*0.5 < 4
  });
});

describe('candle bodyType (needs a primed smaBody)', () => {
  // Morris default: Long = body >= 130% of the average body. Warm-up primes the
  // average near 4, so a Long body must clear ~5.4 (the bar counts in its own window).
  it('is Long when the body is at least 130% of the average body', () => {
    expect(metricsAfterWarmup(bar(10, 16, 10, 16)).bodyType).toBe('Long'); // body 6 vs sma ~4.2
  });

  it('is Short for a middling body with shadows', () => {
    expect(metricsAfterWarmup(bar(10, 12.5, 8.5, 11)).bodyType).toBe('Short'); // body 1
  });

  // Morris default: Doji = body <= ~3% of the day's high-low range.
  it('is Doji when the body is a tiny fraction of the range', () => {
    expect(metricsAfterWarmup(bar(10, 12, 8, 10.1)).bodyType).toBe('Doji'); // body 0.1, range 4
  });
});

describe('candle baseBody', () => {
  it('labels a shadowless long body a Marubozu', () => {
    expect(metricsAfterWarmup(bar(10, 16, 10, 16)).baseBody).toBe('Marubozu');
  });

  it('labels a long white body with only an upper shadow an Opening Marubozu', () => {
    expect(metricsAfterWarmup(bar(10, 17, 10, 16)).baseBody).toBe('Opening Marubozu');
  });

  it('labels a long white body with only a lower shadow a Closing Marubozu', () => {
    expect(metricsAfterWarmup(bar(10, 16, 9, 16)).baseBody).toBe('Closing Marubozu');
  });

  it('labels a short body with long shadows on both sides a Spinning Top', () => {
    expect(metricsAfterWarmup(bar(10, 12.5, 8.5, 11)).baseBody).toBe('Spinning Top');
  });
});

describe('candle trend', () => {
  it('is zero during the EMA warm-up', () => {
    const m = computeCandleMetrics([bar(10, 11, 9, 10)])[0]!;
    expect(m.trend).toBe(0);
  });

  it('is positive when the bar midpoint sits above the 10-day EMA', () => {
    const m = metricsAfterWarmup(bar(20, 20, 20, 20));
    expect(m.trend).toBeGreaterThan(0);
  });

  it('is negative when the bar midpoint sits below the 10-day EMA', () => {
    const m = metricsAfterWarmup(bar(5, 5, 5, 5));
    expect(m.trend).toBeLessThan(0);
  });
});
