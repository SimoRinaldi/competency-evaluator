import { PartialType } from '@nestjs/swagger';
import { CreateRubricLevelAssignmentDto } from './create-rubric-level-assignment.dto';

export class UpdateRubricLevelAssignmentDto extends PartialType(
  CreateRubricLevelAssignmentDto
) {}
