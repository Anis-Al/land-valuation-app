import { findUserById } from '@core/user';
import { sessionStorage } from './session';

export async function getCurrentUserId(request: Request): Promise<string> {
  const session = await sessionStorage.getSession(
    request.headers.get('cookie')
  );

  return session.get('userId');
}

export async function isAuth(request: Request) {
  return !!(await getCurrentUserId(request));
}

export async function getCurrentUser(request: Request) {
  const userId = await getCurrentUserId(request);

  if (!userId) {
    throw 'Not found';
  }

  const user = await findUserById(userId);

  if (!user) {
    throw 'Not found';
  }

  delete user.auth.password;

  return user;
}
