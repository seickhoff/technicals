import { describe, expect, it } from 'vitest';
import {
  createDefaultIndicatorRegistry,
  DuplicateIndicatorKindError,
  IndicatorRegistry,
  UnknownIndicatorKindError,
  UnknownLabelError,
} from '../src/index';
import { closesToBars } from './helpers';

const registry = createDefaultIndicatorRegistry();

describe('default indicator registry', () => {
  it('registers every built-in kind', () => {
    expect(registry.kinds().sort()).toEqual(
      [
        'ADX',
        'BOLLINGER',
        'CANDLE',
        'EMA',
        'FIB',
        'MACD',
        'MFI',
        'PRICECHANNEL',
        'RSI',
        'SMA',
      ].sort(),
    );
  });

  it('reports membership through has()', () => {
    expect(registry.has('RSI')).toBe(true);
    expect(registry.has('NOPE')).toBe(false);
  });

  it('throws for an unregistered kind', () => {
    expect(() => registry.resolve('NOPE')).toThrow(UnknownIndicatorKindError);
  });

  it('rejects registering the same kind twice', () => {
    const sma = registry.resolve('SMA');
    expect(() => new IndicatorRegistry().register(sma).register(sma)).toThrow(
      DuplicateIndicatorKindError,
    );
  });
});

describe('indicator lookback', () => {
  it('returns the warm-up each indicator needs before its first value', () => {
    expect(registry.resolve('SMA').lookback({ column: 'CLOSE', period: 5 })).toBe(5);
    expect(registry.resolve('EMA').lookback({ column: 'CLOSE', period: 5 })).toBe(5);
    expect(registry.resolve('RSI').lookback({ period: 14 })).toBe(14);
    expect(registry.resolve('ADX').lookback({ period: 14 })).toBe(28);
    expect(registry.resolve('MACD').lookback({ fast: 12, slow: 26, signal: 9 })).toBe(47);
    expect(registry.resolve('BOLLINGER').lookback({ period: 20, multiplier: 2 })).toBe(20);
    expect(
      registry
        .resolve('PRICECHANNEL')
        .lookback({ period: 20, highColumn: 'HIGH', lowColumn: 'LOW' }),
    ).toBe(20);
    expect(registry.resolve('MFI').lookback({ period: 14 })).toBe(14);
    expect(registry.resolve('FIB').lookback({ startDate: '20200101', endDate: '20201231' })).toBe(
      0,
    );
    expect(registry.resolve('CANDLE').lookback({})).toBe(10);
  });
});

describe('indicator output labels', () => {
  it('names each indicator series under its canonical labels', () => {
    const closes = Array.from({ length: 30 }, (_, i) => i + 1);
    const bars = closesToBars('2020-01-01', closes);

    expect(registry.resolve('SMA').compute(bars, { column: 'CLOSE', period: 3 }).labels).toEqual([
      'sma',
    ]);
    expect(registry.resolve('MACD').compute(bars, { fast: 3, slow: 6, signal: 3 }).labels).toEqual([
      'macd',
      'signal',
      'histogram',
    ]);
    expect(registry.resolve('ADX').compute(bars, { period: 3 }).labels).toEqual([
      'adx',
      '+di',
      '-di',
    ]);
    expect(
      registry.resolve('BOLLINGER').compute(bars, { period: 3, multiplier: 2 }).labels,
    ).toEqual(['mid', 'upper', 'lower']);
    expect(registry.resolve('CANDLE').compute(bars, {}).labels).toEqual([
      'color',
      'trend',
      'patterns',
    ]);
  });

  it('throws when an unknown series label is requested', () => {
    const result = registry.resolve('SMA').compute(closesToBars('2020-01-01', [1, 2, 3]), {
      column: 'CLOSE',
      period: 2,
    });
    expect(() => result.get('missing')).toThrow(UnknownLabelError);
  });
});

describe('indicators on empty input', () => {
  it('produce empty, bar-aligned series rather than throwing', () => {
    expect(
      registry.resolve('SMA').compute([], { column: 'CLOSE', period: 3 }).get('sma').values,
    ).toEqual([]);
    expect(registry.resolve('RSI').compute([], { period: 14 }).get('rsi').values).toEqual([]);
    expect(registry.resolve('MFI').compute([], { period: 14 }).get('mfi').values).toEqual([]);
    expect(registry.resolve('CANDLE').compute([], {}).get('color').values).toEqual([]);
  });
});
