import { Indicator } from './indicator';
import { DuplicateIndicatorKindError, UnknownIndicatorKindError } from '../shared/domain-error';

/**
 * Maps an indicator kind to its implementation. The registry is the one place
 * that knows the full set of indicators, so the rest of the engine stays open
 * for extension and closed for modification.
 */
export class IndicatorRegistry {
  private readonly byKind = new Map<string, Indicator<unknown>>();

  register<P>(indicator: Indicator<P>): this {
    if (this.byKind.has(indicator.kind)) {
      throw new DuplicateIndicatorKindError(indicator.kind);
    }
    this.byKind.set(indicator.kind, indicator as unknown as Indicator<unknown>);
    return this;
  }

  resolve(kind: string): Indicator<unknown> {
    const indicator = this.byKind.get(kind);
    if (!indicator) {
      throw new UnknownIndicatorKindError(kind);
    }
    return indicator;
  }

  has(kind: string): boolean {
    return this.byKind.has(kind);
  }

  kinds(): string[] {
    return [...this.byKind.keys()];
  }
}
