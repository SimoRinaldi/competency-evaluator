import { NotFoundException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ServerUsersService } from '@server/users';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import type { AuthResponse } from './interfaces/auth-response.interface';
import type { RegisterDto } from './dto/register.dto';

@Injectable()
export class ServerAuthService {
  // Injecting the used services
  constructor(
    private readonly usersService: ServerUsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<AuthenticatedUser> {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new NotFoundException('Credentials not valid');

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credentials not valid!');
    }

    const { passwordHash: _passwordHash, ...result } = user;
    return result;
  }

  async login(user: AuthenticatedUser): Promise<AuthResponse> {
    const payload = { sub: user.id, name: user.name, email: user.email, role: user.role };
    return { access_token: await this.jwtService.signAsync(payload), user };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const user = await this.usersService.create(dto);

    const { passwordHash: _passwordHash, ...result } = user;
    return this.login(result);
  }
}
