import {
    createSession,
    deleteSession,
    findSession,
    updateSession,
  } from '@core/session';
  import { env, envN } from '@core/utils/env';
  import {
    type Cookie,
    type CookieOptions,
    createCookie,
    createSessionStorage,
    type SessionData,
  } from 'react-router';
  
  export type SessionOptions = {
    cookie:
      | Cookie
      | (CookieOptions & {
          name?: string;
        });
  };
  
  const COOKIE_NAME = env('SESSION_COOKIE_NAME', '__session');
  const COOKIE_SECRET = env('SESSION_COOKIE_SECRET', 'Secret123!');
  const SESSION_EXPIRES = envN('SESSION_EXPIRES', 60);
  
  function createDatabaseSessionStorage(options: SessionOptions) {
    return createSessionStorage({
      cookie: options.cookie,
      async createData(data, expires) {
        return createSession({
          data,
          expires,
        });
      },
      async readData(id) {
        const session = await findSession(id);
  
        return (session ? session.data : null) as SessionData;
      },
      async updateData(id, data, expires) {
        await updateSession(id, {
          data,
          expires,
        });
      },
      async deleteData(id) {
        return deleteSession(id);
      },
    });
  }
  
  export const sessionCookie = createCookie(COOKIE_NAME, {
    sameSite: 'lax',
    httpOnly: true,
    maxAge: 60 * SESSION_EXPIRES,
    secrets: [COOKIE_SECRET as string],
  });
  
  export const sessionStorage = createDatabaseSessionStorage({
    cookie: sessionCookie,
  });
  
  export async function rollingSession(
    responseHeaders: Headers,
    request: Request
  ) {
    let cookieValue = await sessionCookie.parse(
      responseHeaders.get('set-cookie')
    );
  
    if (!cookieValue) {
      cookieValue = await sessionCookie.parse(request.headers.get('cookie'));
  
      if (cookieValue) {
        responseHeaders.append(
          'Set-Cookie',
          await sessionCookie.serialize(cookieValue)
        );
      }
    }
  }
  