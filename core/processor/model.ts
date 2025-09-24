import type { CSVItem } from '@core/utils';

export type ProgressStats = {
  total: number;
  processed: number;
};

export type ColumnMapping = {
  state: string;
  county: string;
  acres: string;
  lat: string;
  lng: string;
  apn: string;
};

export const DEFAULT_COLUMN_MAPPING: ColumnMapping = {
  state: 'SITUS STATE',
  county: 'COUNTY',
  acres: 'LOT ACREAGE',
  lat: 'LATITUDE',
  lng: 'LONGITUDE',
  apn: 'APN - FORMATTED',
};

export type ColumnMappingKey = keyof ColumnMapping;

export type ProcessOptions = {
  onProgress?: (result: LandValuationResult) => void;
  distanceCoefficient: number;
  areaCoefficient: number;
  columnMapping: ColumnMapping;
};

export const DEFAULT_PROCESS_OPTIONS: ProcessOptions = {
  distanceCoefficient: 1,
  areaCoefficient: 2,
  columnMapping: DEFAULT_COLUMN_MAPPING,
};

export const MATCHING_STRATEGIES = ['Coordinates', 'County'] as const;

export type MatchingStrategy = (typeof MATCHING_STRATEGIES)[number];

export type LandValuationResult = {
  total: number;
  success: number;
  error: number;
  matchingStrategy: { [key in MatchingStrategy]: number };
};

export type FullLandValuationResult = LandValuationResult & {
  output: CSVItem[];
  refined: CSVItem[];
};
