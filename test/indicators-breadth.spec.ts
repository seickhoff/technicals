import { describe, expect, it } from 'vitest';
import { createDefaultIndicatorRegistry, PriceBar } from '../src/index';
import { closesToBars } from './helpers';

const registry = createDefaultIndicatorRegistry();

function series(
  kind: string,
  params: unknown,
  closes: number[],
  label: string,
): readonly (number | string | undefined)[] {
  const result = registry.resolve(kind).compute(closesToBars('2020-01-01', closes), params);
  return result.get(label).values;
}

/** A bar carrying distinct high/low/close (open mirrors the close, unused by ADX). */
function ohlc(date: string, high: number, low: number, close: number): PriceBar {
  return { date, open: close, high, low, close, volume: 1000 };
}

describe('RSI (Wilder)', () => {
  it('matches hand-computed values', () => {
    expect(series('RSI', { period: 2 }, [1, 2, 1, 2], 'rsi')).toEqual([
      undefined,
      undefined,
      50,
      75,
    ]);
  });

  it('is 0 for a monotonic decline and 100 for a monotonic rise', () => {
    expect(series('RSI', { period: 2 }, [4, 3, 2, 1], 'rsi')).toEqual([undefined, undefined, 0, 0]);
    expect(series('RSI', { period: 2 }, [1, 2, 3, 4], 'rsi')).toEqual([
      undefined,
      undefined,
      100,
      100,
    ]);
  });
});

describe('Bollinger Bands', () => {
  it('uses SMA middle and population std for the bands', () => {
    const closes = [2, 4, 6, 8];
    expect(series('BOLLINGER', { period: 2, multiplier: 2 }, closes, 'mid')).toEqual([
      undefined,
      3,
      5,
      7,
    ]);
    expect(series('BOLLINGER', { period: 2, multiplier: 2 }, closes, 'upper')).toEqual([
      undefined,
      5,
      7,
      9,
    ]);
    expect(series('BOLLINGER', { period: 2, multiplier: 2 }, closes, 'lower')).toEqual([
      undefined,
      1,
      3,
      5,
    ]);
  });
});

describe('Price Channels', () => {
  it('tracks the rolling highest high and lowest low', () => {
    const params = { period: 2, highColumn: 'HIGH', lowColumn: 'LOW' };
    expect(series('PRICECHANNEL', params, [1, 2, 3], 'high')).toEqual([undefined, 2, 3]);
    expect(series('PRICECHANNEL', params, [1, 2, 3], 'low')).toEqual([undefined, 1, 2]);
  });
});

describe('MFI', () => {
  it('matches hand-computed money-flow values', () => {
    expect(series('MFI', { period: 2 }, [3, 2, 1], 'mfi')).toEqual([undefined, 60, 0]);
  });
});

describe('MACD', () => {
  it('defines the line from the slow window and histogram = macd - signal', () => {
    const closes = Array.from({ length: 20 }, (_, i) => i + 1);
    const params = { fast: 3, slow: 6, signal: 3 };
    const macd = series('MACD', params, closes, 'macd');
    const signal = series('MACD', params, closes, 'signal');
    const histogram = series('MACD', params, closes, 'histogram');

    expect(macd[4]).toBeUndefined();
    expect(typeof macd[5]).toBe('number');
    const i = 12;
    expect(histogram[i] as number).toBeCloseTo((macd[i] as number) - (signal[i] as number), 6);
  });

  it('matches hand-computed values', () => {
    // fast EMA(1) is the close series itself; slow/signal EMA(3) use k = 0.5.
    // slow EMA(3) = [_,_,4,6,5,3.5]; macd = close - slow.
    // signal EMA(3) of macd seeds with (2+2-1)/3 = 1 at index 4.
    const closes = [2, 4, 6, 8, 4, 2];
    const params = { fast: 1, slow: 3, signal: 3 };
    expect(series('MACD', params, closes, 'macd')).toEqual([undefined, undefined, 2, 2, -1, -1.5]);
    expect(series('MACD', params, closes, 'signal')).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      1,
      -0.25,
    ]);
    expect(series('MACD', params, closes, 'histogram')).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      -2,
      -1.25,
    ]);
  });
});

describe('ADX', () => {
  it('emits +DI/-DI from `period` and ADX from 2*period - 1', () => {
    const closes = [1, 2, 3, 2, 3, 4, 5, 4, 5, 6, 7, 6];
    const params = { period: 3 };
    const adx = series('ADX', params, closes, 'adx');
    const plusDi = series('ADX', params, closes, '+di');

    expect(plusDi[2]).toBeUndefined();
    expect(typeof plusDi[3]).toBe('number');
    expect(adx[4]).toBeUndefined();
    expect(typeof adx[5]).toBe('number');
  });

  it('matches hand-computed Wilder values for a steady uptrend', () => {
    // Each bar rises by 1 with a constant range of 2: every step has TR = 2,
    // +DM = 1, -DM = 0. So +DI = 50, -DI = 0, DX = 100; ADX seeds at index 3
    // with 50, then index 4 = (1*50 + 100)/2 = 75.
    const bars = [10, 11, 12, 13, 14].map((high, i) =>
      ohlc(`2020-01-0${i + 1}`, high, high - 2, high - 1),
    );
    const result = registry.resolve('ADX').compute(bars, { period: 2 });

    expect(result.get('+di').values).toEqual([undefined, undefined, 50, 50, 50]);
    expect(result.get('-di').values).toEqual([undefined, undefined, 0, 0, 0]);
    expect(result.get('adx').values).toEqual([undefined, undefined, undefined, 50, 75]);
  });
});
