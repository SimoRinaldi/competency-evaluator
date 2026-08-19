import { PartialType } from '@nestjs/swagger';
import { CreateEvaluatedUserDto } from './create-evaluated-user.dto';

export class UpdateEvaluatedUserDto extends PartialType(CreateEvaluatedUserDto) {}
