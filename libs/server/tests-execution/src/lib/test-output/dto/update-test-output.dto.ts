import { PartialType } from '@nestjs/swagger';
import { CreateTestOutputDto } from './create-test-output.dto';

export class UpdateTestOutputDto extends PartialType(CreateTestOutputDto) {}
