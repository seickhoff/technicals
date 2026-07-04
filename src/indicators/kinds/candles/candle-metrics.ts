import { PriceBar } from '../../../price/price-bar';
import { roundTo } from '../../../shared/rounding';
import { emaSeries, rollingMean } from '../../math/moving-average';
import { CandleConfig, DEFAULT_CANDLE_CONFIG } from './candle-config';

export type CandleColor = 'White' | 'Black';
export type BodyType = 'Long' | 'Short' | 'Doji';
export type BodyDay = 'Long' | 'Short';

/**
 * Per-bar candlestick metrics: color, body
 * geometry, shadow percentages (of body and of the high-low range, rounded to
 * whole percents), body classification, base body (Marubozu/Spinning Top), and
 * trend (the bar midpoint vs the 10-day EMA, in percent).
 */
export interface CandleMetrics {
  color: CandleColor;
  open: number;
  high: number;
  low: number;
  close: number;
  body: number;
  bodyTop: number;
  bodyBottom: number;
  bodyMid: number;
  highLow: number;
  upperShadow: number;
  lowerShadow: number;
  upperShadowHl: number;
  lowerShadowHl: number;
  bodyDay: BodyDay;
  bodyType: BodyType;
  baseBody: string;
  trend: number;
  smaBody: number;
}

export function computeCandleMetrics(
  bars: readonly PriceBar[],
  config: CandleConfig = DEFAULT_CANDLE_CONFIG,
): CandleMetrics[] {
  const closes = bars.map((bar) => bar.close);
  const bodies = bars.map((bar) => Math.abs(bar.close - bar.open));
  const emaClose = emaSeries(closes, config.period);
  const smaBody = rollingMean(bodies, config.period);
  return bars.map((bar, i) => buildMetrics(bar, emaClose[i], smaBody[i] ?? 0, config));
}

function buildMetrics(
  bar: PriceBar,
  ema: number | undefined,
  smaBody: number,
  config: CandleConfig,
): CandleMetrics {
  const { open, high, low, close } = bar;
  const color: CandleColor = close < open ? 'Black' : 'White';
  const bodyTop = close < open ? open : close;
  const bodyBottom = close < open ? close : open;
  const body = Math.abs(close - open);
  const highLow = high - low;

  const { upper: upperShadow, lower: lowerShadow } = shadows(bar, body);
  const { upper: upperShadowHl, lower: lowerShadowHl } = shadows(bar, highLow);

  const bodyDay: BodyDay = 2 * Math.abs(open - close) >= high - low ? 'Long' : 'Short';
  const bodyMid = roundTo((open + close) / 2, 2);
  const bodyType = classifyBody(body, smaBody, highLow, upperShadow, lowerShadow, config);
  const baseBody = classifyBaseBody(
    bodyType,
    color,
    upperShadow,
    lowerShadow,
    upperShadowHl,
    config,
  );
  const trend =
    ema !== undefined && ema !== 0 ? roundTo((((high + low) / 2 - ema) / ema) * 100, 2) : 0;

  return {
    color,
    open,
    high,
    low,
    close,
    body,
    bodyTop,
    bodyBottom,
    bodyMid,
    highLow,
    upperShadow,
    lowerShadow,
    upperShadowHl,
    lowerShadowHl,
    bodyDay,
    bodyType,
    baseBody,
    trend,
    smaBody,
  };
}

/** Shadow sizes as whole-percent of `scale` (the body, or the high-low range). 0 when scale is 0. */
function shadows(bar: PriceBar, scale: number): { upper: number; lower: number } {
  if (scale === 0) {
    return { upper: 0, lower: 0 };
  }
  const { open, high, low, close } = bar;
  if (open > close) {
    return {
      upper: Math.round(((high - open) / scale) * 100),
      lower: Math.round(((close - low) / scale) * 100),
    };
  }
  return {
    upper: Math.round(((high - close) / scale) * 100),
    lower: Math.round(((open - low) / scale) * 100),
  };
}

function classifyBody(
  body: number,
  smaBody: number,
  highLow: number,
  upperShadow: number,
  lowerShadow: number,
  config: CandleConfig,
): BodyType {
  if (body >= smaBody * config.longBodyRatio) {
    return 'Long';
  }
  const isDoji =
    (config.dojiMaxPctOfRange !== null && body <= config.dojiMaxPctOfRange * highLow) ||
    (config.dojiMaxPctOfAvgBody !== null && body <= config.dojiMaxPctOfAvgBody * smaBody) ||
    (config.dojiMaxShadowPctOfBody !== null &&
      (lowerShadow > config.dojiMaxShadowPctOfBody || upperShadow > config.dojiMaxShadowPctOfBody));
  if (isDoji) {
    return 'Doji';
  }
  return 'Short';
}

function classifyBaseBody(
  bodyType: BodyType,
  color: CandleColor,
  upperShadow: number,
  lowerShadow: number,
  upperShadowHl: number,
  config: CandleConfig,
): string {
  if (bodyType === 'Long') {
    let baseBody = '';
    if ((color === 'White' && lowerShadow === 0) || (color === 'Black' && upperShadowHl === 0)) {
      baseBody = 'Opening Marubozu';
    }
    if ((color === 'Black' && lowerShadow === 0) || (color === 'White' && upperShadowHl === 0)) {
      baseBody = 'Closing Marubozu';
    }
    if (upperShadowHl === 0 && lowerShadow === 0) {
      baseBody = 'Marubozu';
    }
    return baseBody;
  }
  if (
    bodyType === 'Short' &&
    upperShadow > config.spinningTopMinShadowPctOfBody &&
    lowerShadow > config.spinningTopMinShadowPctOfBody
  ) {
    return 'Spinning Top';
  }
  return '';
}
