import { PartialType } from '@nestjs/swagger';
import { CreateSubCompetencyDto } from './create-subcompetency.dto';

export class UpdateSubCompetencyDto extends PartialType(
  CreateSubCompetencyDto
) {}
