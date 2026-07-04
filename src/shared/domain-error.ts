/**
 * Category drives how the delivery layer maps an error to a transport status:
 * - `config`    the user's strategy is invalid (parse/validation/linking)
 * - `data`      the market-data provider could not supply prices
 * - `execution` an unexpected failure while running the simulation
 */
export type DomainErrorCategory = 'config' | 'data' | 'execution';

/** Where in the source config an error occurred (1-based). */
export interface SourceLocation {
  line: number;
  column?: number;
}

/** Base class for every error the domain raises. Carries a stable machine code. */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly category: DomainErrorCategory;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** The strategy text could not be parsed. */
export class ConfigParseError extends DomainError {
  readonly code = 'CONFIG_PARSE_ERROR';
  readonly category = 'config';

  constructor(
    message: string,
    readonly location?: SourceLocation,
  ) {
    super(location ? `Line ${location.line}: ${message}` : message);
  }
}

/** The strategy is syntactically fine but semantically invalid. */
export class ConfigValidationError extends DomainError {
  readonly code = 'CONFIG_VALIDATION_ERROR';
  readonly category = 'config';

  constructor(
    message: string,
    readonly location?: SourceLocation,
  ) {
    super(location ? `Line ${location.line}: ${message}` : message);
  }
}

/** A rule references a label that was never declared and is not a price column. */
export class UnknownLabelError extends DomainError {
  readonly code = 'UNKNOWN_LABEL';
  readonly category = 'config';

  constructor(
    readonly label: string,
    message?: string,
  ) {
    super(message ?? `Unknown label "${label}".`);
  }
}

/** A rule reaches further back than the available warm-up history allows. */
export class IndexOutOfRangeError extends DomainError {
  readonly code = 'INDEX_OUT_OF_RANGE';
  readonly category = 'execution';

  constructor(
    readonly label: string,
    readonly index: number,
  ) {
    super(`Reference "${label}" resolved to out-of-range bar index ${index}.`);
  }
}

/** An indicator produced a series whose length did not match the price bars. */
export class SeriesLengthMismatchError extends DomainError {
  readonly code = 'SERIES_LENGTH_MISMATCH';
  readonly category = 'execution';

  constructor(key: string, actual: number, expected: number) {
    super(`Series "${key}" has length ${actual}, expected ${expected} (must align with bars).`);
  }
}

/** A declaration named an indicator kind that is not registered. */
export class UnknownIndicatorKindError extends DomainError {
  readonly code = 'UNKNOWN_INDICATOR_KIND';
  readonly category = 'execution';

  constructor(readonly kind: string) {
    super(`No indicator registered for kind "${kind}".`);
  }
}

/** Two indicators tried to register under the same kind. */
export class DuplicateIndicatorKindError extends DomainError {
  readonly code = 'DUPLICATE_INDICATOR_KIND';
  readonly category = 'execution';

  constructor(readonly kind: string) {
    super(`An indicator is already registered for kind "${kind}".`);
  }
}

/**
 * The configured ACCOUNT is smaller than one share of a symbol, so whole-share
 * sizing would buy zero shares and every run would report a misleading flat 0%.
 */
export class AccountTooSmallError extends DomainError {
  readonly code = 'ACCOUNT_TOO_SMALL';
  readonly category = 'config';

  constructor(
    readonly symbol: string,
    readonly account: number,
    readonly sharePrice: number,
  ) {
    super(
      `ACCOUNT of $${formatDollars(account)} is too small to buy a single share of ${symbol}, ` +
        `which trades around $${formatDollars(sharePrice)}. No trades can execute with whole-share ` +
        `sizing — raise ACCOUNT above the share price.`,
    );
  }
}

function formatDollars(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/** The market-data provider returned no usable price history. */
export class PriceDataUnavailableError extends DomainError {
  readonly code = 'PRICE_DATA_UNAVAILABLE';
  readonly category = 'data';

  constructor(
    readonly symbol: string,
    message?: string,
  ) {
    super(message ?? `No price data available for "${symbol}".`);
  }
}

/** The data provider could not supply fundamentals for the symbol. */
export class FundamentalsUnavailableError extends DomainError {
  readonly code = 'FUNDAMENTALS_UNAVAILABLE';
  readonly category = 'data';

  constructor(
    readonly symbol: string,
    message?: string,
  ) {
    super(message ?? `No fundamental data available for "${symbol}".`);
  }
}
