import { landValuationRequests, db } from '@core/database';
import { eq } from 'drizzle-orm';
import { first } from 'lodash';
import type {
  CreateLandValuationRequestInput,
  LandValuationRequest,
  UpdateLandValuationRequestColumnMappingInput,
  LandValuationRequestContentsTypes,
} from './model';
import { idString } from '@core/utils';

const DEFAULT_SELECT_FIELDS = {
  id: landValuationRequests.id,
  status: landValuationRequests.status,
  fileName: landValuationRequests.fileName,
  fileSize: landValuationRequests.fileSize,
  columnMapping: landValuationRequests.columnMapping,
  result: landValuationRequests.result,
  createdAt: landValuationRequests.createdAt,
  createdBy: landValuationRequests.createdBy,
  processingAt: landValuationRequests.processingAt,
  completedAt: landValuationRequests.completedAt,
};

export async function findLandValuationRequest(landValuationRequestId: string) {
  const result = (await db
    .select(DEFAULT_SELECT_FIELDS)
    .from(landValuationRequests)
    .where(
      eq(landValuationRequests.id, idString(landValuationRequestId))
    )) as LandValuationRequest[];

  return first(result);
}

export async function findLandValuationRequestContents(
  landValuationRequestId: string,
  contentsType: LandValuationRequestContentsTypes
) {
  const result = await db
    .select({
      contents: landValuationRequests[`${contentsType}Contents`],
    })
    .from(landValuationRequests)
    .where(eq(landValuationRequests.id, idString(landValuationRequestId)));

  return first(result)?.contents;
}

export async function deleteLandValuationRequest(
  landValuationRequestId: string
) {
  const result = await db
    .delete(landValuationRequests)
    .where(eq(landValuationRequests.id, idString(landValuationRequestId)));

  return result;
}

export async function createLandValuationRequest(
  input: CreateLandValuationRequestInput
) {
  const result = await db
    .insert(landValuationRequests)
    .values({
      status: 'Draft',
      fileName: input.fileName,
      fileSize: input.fileSize,
      rawContents: input.rawContents,
      createdBy: input.createdBy,
    })
    .returning(DEFAULT_SELECT_FIELDS);

  return first(result);
}

export async function updateLandValuationRequestColumnMapping(
  landValuationRequestId: string,
  input: UpdateLandValuationRequestColumnMappingInput
) {
  const result = await db
    .update(landValuationRequests)
    .set({
      status: input.status,
      columnMapping: input.columnMapping,
    })
    .where(eq(landValuationRequests.id, idString(landValuationRequestId)))
    .returning(DEFAULT_SELECT_FIELDS);

  return first(result);
}
