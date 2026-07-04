import { PriceColumn } from '../price/price-column';

/**
 * Parameter contracts for every indicator kind. Kept in one place so both the
 * indicator implementations and the config-declaration union share a single
 * source of truth.
 */

export interface SmaParams {
  column: PriceColumn;
  period: number;
}

export interface EmaParams {
  column: PriceColumn;
  period: number;
}

export interface RsiParams {
  period: number;
}

export interface AdxParams {
  period: number;
}

export interface MacdParams {
  fast: number;
  slow: number;
  signal: number;
}

export interface BollingerParams {
  period: number;
  multiplier: number;
}

export interface PriceChannelParams {
  period: number;
  highColumn: PriceColumn;
  lowColumn: PriceColumn;
}

export interface MfiParams {
  period: number;
}

export interface FibParams {
  /** Tested window bounds (YYYYMMDD). High/low are taken over CLOSE within this range. */
  startDate: string;
  endDate: string;
}

export type CandleParams = Record<string, never>;
