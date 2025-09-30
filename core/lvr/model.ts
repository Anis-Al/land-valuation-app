import type { ColumnMapping, LandValuationResult } from '@core/processor/model';
import { landValuationRequests } from '@core/database';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type LandValuationRequestWithContents = InferSelectModel<
  typeof landValuationRequests
>;
export type LandValuationRequestInput = InferInsertModel<
  typeof landValuationRequests
>;

export const LAND_VALUATION_REQUEST_CONTENTS_TYPES = [
  'raw',
  'output',
  'refined',
] as const;

export type LandValuationRequestContentsTypes =
  (typeof LAND_VALUATION_REQUEST_CONTENTS_TYPES)[number];

export const LAND_VALUATION_REQUEST_STATUSES = [
  'Draft',
  'Pending',
  'Processing',
  'Complete',
] as const;

export type LandValuationRequestStatus =
  (typeof LAND_VALUATION_REQUEST_STATUSES)[number];

export type LandValuationRequest = Omit<
  LandValuationRequestWithContents,
  'rawContents' | 'outputContents' | 'refinedContents'
>;

export type CreateLandValuationRequestInput = {
  fileName: string;
  fileSize: number;
  rawContents: Buffer;
  createdBy: string;
};

export type UpdateLandValuationRequestColumnMappingInput = {
  status: LandValuationRequestStatus;
  columnMapping: ColumnMapping;
};

export type UpdateLandValuationRequestProcessingInput = {
  status: LandValuationRequestStatus;
  processingAt: Date;
};

export type UpdateLandValuationRequestPartialResultInput = {
  result: LandValuationResult;
};

export type UpdateLandValuationRequestResultInput = {
  status: LandValuationRequestStatus;
  result: LandValuationResult;
  outputContents: Buffer;
  refinedContents: Buffer;
  completedAt: Date;
};

export type LandValuationRequestFilter = {
  search?: string;
  status?: LandValuationRequestStatus[];
  orderBy: 'createdAt';
  page: number;
  pageSize: number;
};
export type SearchResult<T> = {
  items: T[];
  total: number;
};
