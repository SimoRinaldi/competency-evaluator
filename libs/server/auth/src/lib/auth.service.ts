import { NotFoundException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole, UsersService } from '@server/users';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { AuthResponse } from './interfaces/auth-response.interface';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class ServerAuthService {
  // Injecting the used services
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<AuthenticatedUser> {
    try {
      const user = await this.usersService.findByEmail(email);

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) {
        throw new UnauthorizedException('Credentials not valid!');
      }

      const { passwordHash, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException('Credentials not valid!');
    }
  }

  async login(user: AuthenticatedUser): Promise<AuthResponse> {
    const payload = { sub: user.id, name: user.name, email: user.email, role: user.role };
    return { access_token: await this.jwtService.signAsync(payload), user };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const dto_within_role = { ...dto, role: UserRole.USER };
    const user = await this.usersService.create(dto_within_role);

    const { passwordHash, ...result } = user;
    return this.login(result);
  }
}
