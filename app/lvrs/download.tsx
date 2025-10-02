import { getCurrentUserId } from '@/auth';
import type { Route } from './+types/download';
import {
  findLandValuationRequest,
  findLandValuationRequestContents,
  LAND_VALUATION_REQUEST_CONTENTS_TYPES,
  type LandValuationRequestContentsTypes,
} from '@core/lvr';
import { redirect } from 'react-router';
import { decompressCSV } from '@core/utils';
import { createReadableStreamFromReadable } from '@react-router/node';
import { Readable } from 'node:stream';

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const contentsType =
      params.contentsType as LandValuationRequestContentsTypes;

    if (
      !contentsType ||
      !LAND_VALUATION_REQUEST_CONTENTS_TYPES.includes(contentsType)
    ) {
      throw 'invalid type';
    }

    const currentUserId = await getCurrentUserId(request);

    const lvr = await findLandValuationRequest(params.id);

    if (!lvr || lvr.createdBy !== currentUserId) {
      throw 'not found';
    }

    const contents = await findLandValuationRequestContents(
      lvr.id,
      contentsType
    );

    if (!contents) {
      throw 'not found';
    }

    const fileName =
      contentsType === 'raw'
        ? lvr.fileName
        : lvr.fileName?.replace(/\.csv/gi, `.${contentsType}.csv`);

    const file = createReadableStreamFromReadable(
      Readable.from(await decompressCSV(contents))
    );

    return new Response(file, {
      headers: {
        'Content-Disposition': `attachment; filename=${encodeURIComponent(
          fileName!
        )}`,
        'Content-Type': 'text/csv',
      },
    });
  } catch {
    return redirect('/');
  }
}
