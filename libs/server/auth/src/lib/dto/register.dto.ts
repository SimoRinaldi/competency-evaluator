import { CreateUserDto } from '@server/users';
import { OmitType } from '@nestjs/swagger';

export class RegisterDto extends OmitType(CreateUserDto, ['role'] as const) {}
