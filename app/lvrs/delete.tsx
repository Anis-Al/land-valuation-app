import { getCurrentUserId } from '@/auth';
import type { Route } from './+types/delete';
import {
  deleteLandValuationRequest,
  findLandValuationRequest,
} from '@core/lvr';
import { redirect } from 'react-router';

export async function action({ request, params }: Route.ActionArgs) {
  try {
    const currentUserId = await getCurrentUserId(request);

    if (request.method !== 'DELETE') {
      throw 'Invalid method';
    }

    const lvr = await findLandValuationRequest(params.id);

    if (!lvr || lvr.createdBy !== currentUserId) {
      throw 'Not found';
    }

    await deleteLandValuationRequest(lvr.id);
  } catch {
    return redirect('/');
  }
}
