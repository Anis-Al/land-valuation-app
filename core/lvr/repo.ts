import { landValuationRequests, db } from '@core/database';
import { eq, SQL, desc, ilike, inArray, and, count } from 'drizzle-orm';
import first from 'lodash/first';
import trim from 'lodash/trim';
import type {
  CreateLandValuationRequestInput,
  LandValuationRequest,
  UpdateLandValuationRequestColumnMappingInput,
  LandValuationRequestContentsTypes,
  UpdateLandValuationRequestProcessingInput,
  UpdateLandValuationRequestPartialResultInput,
  UpdateLandValuationRequestResultInput,
  LandValuationRequestFilter,
  SearchResult,
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

export async function updateLandValuationRequestProcessing(
  landValuationRequestId: string,
  input: UpdateLandValuationRequestProcessingInput
) {
  await db
    .update(landValuationRequests)
    .set({
      status: input.status,
      processingAt: input.processingAt,
    })
    .where(eq(landValuationRequests.id, idString(landValuationRequestId)));
}

export async function updateLandValuationRequestPartialResult(
  landValuationRequestId: string,
  input: UpdateLandValuationRequestPartialResultInput
) {
  await db
    .update(landValuationRequests)
    .set({
      result: input.result,
    })
    .where(eq(landValuationRequests.id, idString(landValuationRequestId)));
}

export async function updateLandValuationRequestResult(
  landValuationRequestId: string,
  input: UpdateLandValuationRequestResultInput
) {
  await db
    .update(landValuationRequests)
    .set({
      status: input.status,
      result: input.result,
      outputContents: input.outputContents,
      refinedContents: input.refinedContents,
      completedAt: input.completedAt,
    })
    .where(eq(landValuationRequests.id, idString(landValuationRequestId)));
}

export async function findAllLandValuationRequests(
  filter: LandValuationRequestFilter
): Promise<SearchResult<LandValuationRequest>> {
  return await db.transaction(async (tx) => {
    const orderByColumn = landValuationRequests[filter.orderBy];

    const where: SQL[] = [];

    let query = tx
      .select(DEFAULT_SELECT_FIELDS)
      .from(landValuationRequests)
      .orderBy(desc(orderByColumn))
      .$dynamic();

    let totalQuery = tx
      .select({ total: count() })
      .from(landValuationRequests)
      .$dynamic();

    const search = trim(filter.search);

    if (search.length > 0) {
      where.push(ilike(landValuationRequests.fileName, `%${search}%`));
    }

    if (Array.isArray(filter.status) && filter.status.length > 0) {
      where.push(inArray(landValuationRequests.status, filter.status));
    }

    if (where.length > 0) {
      query = query.where(and(...where));
      totalQuery = totalQuery.where(and(...where));
    }

    return {
      items: await query,
      total: first(await totalQuery)?.total ?? 0,
    };
  });
}
