import type { AuthenticatedUser } from './authenticated-user.interface';

export class AuthResponse {
  access_token: string;
  user: AuthenticatedUser;
}
