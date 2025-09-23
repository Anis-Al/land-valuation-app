import { Authenticator } from 'remix-auth';
import { passwordStrategy } from './password';

export const authenticator = new Authenticator<string>();

authenticator.use(passwordStrategy, 'password');
