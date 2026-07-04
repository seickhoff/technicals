# Candlestick patterns & tunable thresholds

This module classifies each bar (color, body size, shadows, trend) and detects ~89 named
candlestick patterns. Both the classification and a few pattern-level tests are governed by a
`CandleConfig`, whose **defaults follow Gregory Morris, _Candlestick Charting Explained_ (3rd ed.),
Chapter 6** — the book these patterns were built from. Morris treats every one of these as a
user-adjustable setting, not a fixed rule, so they are exposed here.

## Using it

```ts
import {
  computeCandleMetrics,
  detectCandlePatternMatches,
  DEFAULT_CANDLE_CONFIG, // Morris defaults (used when you pass nothing)
  LEGACY_CANDLE_CONFIG, // this project's original hand-tuned values
  type CandleConfig,
} from '@back-test/technicals';

// Morris defaults:
detectCandlePatternMatches(bars);

// Restore the pre-Morris behavior:
detectCandlePatternMatches(bars, LEGACY_CANDLE_CONFIG);

// Or tweak a single knob:
detectCandlePatternMatches(bars, { ...DEFAULT_CANDLE_CONFIG, longBodyRatio: 1.0 });
```

The same optional `config` argument is accepted by `computeCandleMetrics(bars, config)`. (The
`candle` indicator's `compute` uses the Morris defaults.)

## The knobs

| Field                                   | Morris default | Legacy | What it controls                                                                                                                                                                                                                     |
| --------------------------------------- | -------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `period`                                | 10             | 10     | Days in the trend EMA and the average-body baseline.                                                                                                                                                                                 |
| `longBodyRatio`                         | 1.3            | 0.75   | Long day: `body ≥ ratio × avgBody`. Morris's example is 130% (30% above the recent average); the legacy 0.75 counted below-average bodies as "long".                                                                                 |
| `dojiMaxPctOfRange`                     | 0.03           | `null` | Doji: `body ≤ pct × (high−low)`. Morris measures the doji against the **day's own range** (1–3%).                                                                                                                                    |
| `dojiMaxPctOfAvgBody`                   | `null`         | 0.10   | Legacy doji basis: body vs the average body. Off under Morris.                                                                                                                                                                       |
| `dojiMaxShadowPctOfBody`                | `null`         | 490    | Legacy long-legged-doji proxy (a shadow > this % of body forces Doji). Off under Morris.                                                                                                                                             |
| `spinningTopMinShadowPctOfBody`         | 100            | 100    | Spinning Top: short body with both shadows longer than the body.                                                                                                                                                                     |
| `equalTolerancePct`                     | 0.02           | 0      | "Equal" prices (Meeting/Matching/Separating/On-Neck) within this fraction of the bar's **high-low range** (not price). Morris ties this to the doji tolerance (1–3%). Legacy used exact `===`, which almost never matches real data. |
| `hammerLowerShadowMinPctOfBody`         | 200            | 200    | Hammer/Hanging Man: lower shadow ≥ 2× body.                                                                                                                                                                                          |
| `umbrellaShortShadowMaxPctOfRange`      | 10             | 10     | Umbrella patterns: the small opposite shadow ≤ 10% of the range.                                                                                                                                                                     |
| `shootingStarUpperShadowMinPctOfBody`   | 300            | 300    | Shooting Star: upper shadow ≥ 3× body.                                                                                                                                                                                               |
| `invertedHammerUpperShadowMinPctOfBody` | 0              | 50     | Inverted Hammer: minimum upper shadow. Morris gives no floor; legacy required ≥ 0.5× body.                                                                                                                                           |
| `invertedHammerUpperShadowMaxPctOfBody` | 200            | `null` | Inverted Hammer: upper shadow "no more than 2× body" (Morris). Legacy left this effectively uncapped (a metric bug).                                                                                                                 |

## Your previous (legacy) configuration

Exported as `LEGACY_CANDLE_CONFIG`. Pasteable if you want the old behavior back:

```ts
const LEGACY_CANDLE_CONFIG: CandleConfig = {
  period: 10,
  longBodyRatio: 0.75,
  dojiMaxPctOfRange: null,
  dojiMaxPctOfAvgBody: 0.1,
  dojiMaxShadowPctOfBody: 490,
  spinningTopMinShadowPctOfBody: 100,
  equalTolerancePct: 0,
  hammerLowerShadowMinPctOfBody: 200,
  umbrellaShortShadowMaxPctOfRange: 10,
  shootingStarUpperShadowMinPctOfBody: 300,
  invertedHammerUpperShadowMinPctOfBody: 50,
  invertedHammerUpperShadowMaxPctOfBody: null,
};
```

## What changed when defaulting to Morris

- **Long bodies are stricter** (130% vs 75% of average) → fewer bars classify as "Long", so
  long-body patterns fire less often but more selectively.
- **Doji is measured against the day's range** (≤3%), not the average body — this is Morris's
  definition and directly catches long-legged dojis (dropping the old 490%-shadow proxy).
- **"Equal" prices use a tolerance** (~2% of range) instead of exact `===`, so Meeting Lines,
  Matching High/Low, Separating Lines, and On-Neck can actually fire on real data.
- **Inverted Hammer** now enforces Morris's "upper shadow ≤ 2× body" cap (the old code left it
  uncapped through a metric bug).

Definitions cross-checked against Morris are catalogued in the `candle-morris-audit` skill
(`~/.claude/skills/candle-morris-audit/morris-rules.md`).
