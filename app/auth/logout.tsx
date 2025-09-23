import { redirect } from 'react-router';
import { sessionStorage } from './session';
import type { Route } from './+types/logout';

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== 'DELETE') {
    throw new Response(
      JSON.stringify({
        error: 'error',
      }),
      { status: 401 }
    );
  }

  const session = await sessionStorage.getSession(
    request.headers.get('cookie')
  );

  return redirect('/', {
    headers: { 'Set-Cookie': await sessionStorage.destroySession(session) },
  });
}
