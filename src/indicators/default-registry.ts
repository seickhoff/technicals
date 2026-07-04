import { IndicatorRegistry } from './indicator-registry';
import { sma } from './kinds/sma';
import { ema } from './kinds/ema';
import { rsi } from './kinds/rsi';
import { adx } from './kinds/adx';
import { macd } from './kinds/macd';
import { bollinger } from './kinds/bollinger';
import { priceChannel } from './kinds/price-channel';
import { mfi } from './kinds/mfi';
import { fib } from './kinds/fib';
import { candle } from './kinds/candles/candle-indicator';

/**
 * Builds a registry with all built-in indicators. Each new indicator is added
 * here with a single `register(...)` call — the only edit needed.
 */
export function createDefaultIndicatorRegistry(): IndicatorRegistry {
  return new IndicatorRegistry()
    .register(sma)
    .register(ema)
    .register(rsi)
    .register(adx)
    .register(macd)
    .register(bollinger)
    .register(priceChannel)
    .register(mfi)
    .register(fib)
    .register(candle);
}
