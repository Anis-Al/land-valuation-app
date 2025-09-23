import { Form, redirect } from 'react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Route } from './+types/login';
import { authenticator } from './authenticator';
import { isAuth } from './';
import { sessionStorage } from './session';

export async function loader({ request }: Route.LoaderArgs) {
  const isAuthenticated = await isAuth(request);
  if (isAuthenticated) {
    return redirect('/');
  }
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const userId = await authenticator.authenticate('password', request);
    if (!userId) throw 'user not found';
    const session = await sessionStorage.getSession(
      request.headers.get('cookie')
    );
    session.set('userId', userId);

    return redirect('/', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      return {
        error: err.message,
      };
    }
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  const error = actionData?.error;
  return (
    <div className="flex flex-col justify-between h-[80vh] lg:h-[100vh] lg:grid lg:grid-cols-2">
      <div className="flex flex-col bg-app-primary gap-10 py-8">
        <div className="grid grow place-content-center place-items-center lg:p-0">
          <img src="/logo-light.webp" className="w-50 lg:w-96" alt="" />
        </div>
      </div>
      <div className="flex flex-col lg:grid place-content-center place-items-center gap-16 pt-16 lg:pt-0">
        <h1 className="text-4xl lg:text-5xl font-extralight lg:block">
          Land Valuation App
        </h1>

        <h2 className="text-2xl lg:text-3xl font-extralight">Login</h2>
        {error && <div className="text-red-600 text-center">{error}</div>}
        <Form
          className="grid gap-4 w-[100%] max-w-[400px] lg:w-[400px] px-2 lg:p-0"
          method="post"
          reloadDocument
        >
          <Input name="username" placeholder="Username" />
          <Input name="password" type="password" placeholder="Password" />
          <Button type="submit" className="bg-gray-900 cursor-pointer">
            Sign in
          </Button>
        </Form>
      </div>
    </div>
  );
}
