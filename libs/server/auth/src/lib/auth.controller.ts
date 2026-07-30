import { Controller, UseGuards, Post, Request, Body, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { ServerAuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserRole } from '@server/users';

type RequestWithUser = Request & {
  user: AuthenticatedUser;
};

@ApiTags('Auth APIs')
@Controller('auth')
export class ServerAuthController {
  constructor(private serverAuthService: ServerAuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({
          schema: {
              type: 'object',
              properties: {
                  email: { type: 'string', example: 'devis.bianchini@unibs.it' },
                  password: {type: 'string', example: 'Password1!'}
              },
              required: ['email', 'password'],
          },
      })
  login(@Request() req: RequestWithUser) {
    return this.serverAuthService.login(req.user);
  }

  @Post('register')
  @ApiBody({
          schema: {
              type: 'object',
              properties: {
                  name: { type: 'string', example: 'Devis' },
                  email: { type: 'string', example: 'devis.bianchini@unibs.it' },
                  password: {type: 'string', example: 'Password1!'},
                  role: { type: 'string', enum: Object.values(UserRole), example: UserRole.USER}
              },
              required: ['name', 'email', 'password', 'role'],
          },
      })
  register(@Body(ValidationPipe) dto: RegisterDto) {
    return this.serverAuthService.register(dto);
  }
}
