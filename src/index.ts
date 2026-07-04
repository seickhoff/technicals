// @back-test/technicals — reusable technical-analysis library:
// price model, indicators (incl. candlesticks), math, and the shared error taxonomy.
// This is the package's public API. It re-exports whole modules so every symbol the
// consuming app needs is available without hand-maintaining a symbol list.

// Price model
export * from './price/price-bar';
export * from './price/price-column';
export * from './price/series-value';
export * from './price/computed-series';

// Indicators
export * from './indicators/indicator';
export * from './indicators/indicator-registry';
export * from './indicators/default-registry';
export * from './indicators/params';
export * from './indicators/math/fibonacci';

// Candlesticks
export * from './indicators/kinds/candles/patterns';
export * from './indicators/kinds/candles/candle-indicator';
export * from './indicators/kinds/candles/candle-config';
export * from './indicators/kinds/candles/candle-metrics';

// Shared primitives
export * from './shared/rounding';
export * from './shared/domain-error';
