import { PartialType } from '@nestjs/swagger';
import { CreateSubCompetencyDto } from './create-sub-competency.dto';

export class UpdateSubCompetencyDto extends PartialType(
  CreateSubCompetencyDto
) {}
