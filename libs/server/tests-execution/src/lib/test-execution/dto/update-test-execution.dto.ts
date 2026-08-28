import { PartialType } from '@nestjs/swagger';
import { CreateTestExecutionDto } from './create-test-execution.dto';

export class UpdateTestExecutionDto extends PartialType(
  CreateTestExecutionDto
) {}
