import { verifyPassword } from '@core/utils/password';
import { findUserByUsername } from '@core/user';
import { FormStrategy } from 'remix-auth-form';
import { z } from 'zod';

const schema = z.object({
  username: z.email().trim().toLowerCase(),
  password: z.string().trim().min(1),
});

type LoginInput = z.infer<typeof schema>;

async function validateCredentials(input: LoginInput) {
  try {
    const { username, password } = schema.parse(input);

    const user = await findUserByUsername(username);

    if (!user || !user.auth.password) {
      return undefined;
    }

    if (await verifyPassword(password, user.auth.password)) {
      return user.id;
    } else return null;
  } catch {
    return null;
  }
}

export const passwordStrategy = new FormStrategy(async ({ form }) => {
  const input = Object.fromEntries(form) as LoginInput;
  
  const userId = await validateCredentials(input);

  if (!userId) {
    throw 'invalid username and password';
  }

  return userId;
});
