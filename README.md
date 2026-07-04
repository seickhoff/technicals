# @seickhoff/technicals

Reusable technical-analysis library extracted from the back-test project:

- **Price model** — `PriceBar`, `ComputedSeries`, price columns, series values.
- **Indicators** — a registry with SMA, EMA, RSI, MACD, ADX, Bollinger, MFI, price channel,
  Fibonacci, and candlesticks (`createDefaultIndicatorRegistry`).
- **Candlestick patterns** — ~89 named patterns with tunable, Morris-compliant thresholds
  (`detectCandlePatternMatches`, `computeCandleMetrics`, `CandleConfig`).
- **Math** — moving averages, Wilder smoothing, directional movement, Fibonacci levels.

Everything is pure and framework-agnostic: no I/O, no HTTP, no database.

## Install

Not published to npm — consume it directly from GitHub, pinned to a tag:

```jsonc
// package.json
"dependencies": {
  "@seickhoff/technicals": "github:seickhoff/technicals#v1.0.0"
}
```

On install, the package's `prepare` script builds `dist/` (bundled ESM + type declarations)
via [tsup], so consumers get compiled JS and `.d.ts` with no build step of their own. Bump
the tag to upgrade.

## Usage

```ts
import {
  createDefaultIndicatorRegistry,
  detectCandlePatternMatches,
  DEFAULT_CANDLE_CONFIG,
  type PriceBar,
} from '@seickhoff/technicals';

const registry = createDefaultIndicatorRegistry();
const matches = detectCandlePatternMatches(bars); // bars: PriceBar[]
```

See [`src/indicators/kinds/candles/README.md`](src/indicators/kinds/candles/README.md) for the
candlestick configuration knobs and their Morris defaults.

## Develop

```sh
npm install     # also builds dist via prepare
npm run typecheck
npm test
npm run build   # tsup -> dist/index.js + dist/index.d.ts
```

To iterate on this library against a consuming app without publishing a tag, use `npm link`
(or a temporary `"file:../technicals"` dependency), then switch back to the `github:#tag` pin
before committing the consumer.

[tsup]: https://tsup.egoist.dev
