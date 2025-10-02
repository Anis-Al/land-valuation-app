import { getCurrentUserId } from '@/auth';
import type { Route } from './+types/column-mapping';
import {
  findLandValuationRequest,
  updateLandValuationRequestColumnMapping,
} from '@core/lvr';
import { redirect } from 'react-router';
import * as z from 'zod';

const schema = z.object({
  columnMapping: z.object({
    state: z.string().trim(),
    county: z.string().trim(),
    acres: z.string().trim(),
    lat: z.string().trim(),
    lng: z.string().trim(),
    apn: z.string().trim(),
  }),
});

export async function action({ request, params }: Route.ActionArgs) {
  try {
    if (request.method !== 'PUT') {
      throw 'Wrong method';
    }

    const { columnMapping } = schema.parse(await request.json());

    const currentUserId = await getCurrentUserId(request);

    const lvr = await findLandValuationRequest(params.id);

    if (!lvr || lvr.createdBy !== currentUserId) {
      throw 'Not found';
    }

    if (lvr.status !== 'Draft') {
      throw 'Invalid state';
    }

    await updateLandValuationRequestColumnMapping(lvr.id, {
      status: 'Pending',
      columnMapping,
    });
  } catch {
    return redirect('/');
  }
}
