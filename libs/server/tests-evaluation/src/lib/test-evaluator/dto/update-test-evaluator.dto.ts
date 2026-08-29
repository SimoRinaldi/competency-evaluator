import { PartialType } from '@nestjs/swagger';
import { CreateTestEvaluatorDto } from './create-test-evaluator.dto';

export class UpdateTestEvaluatorDto extends PartialType(
  CreateTestEvaluatorDto
) {}
