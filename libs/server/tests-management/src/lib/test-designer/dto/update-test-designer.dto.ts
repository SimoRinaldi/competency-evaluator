import { PartialType } from '@nestjs/swagger';
import { CreateTestDesignerDto } from './create-test-designer.dto';

export class UpdateTestDesignerDto extends PartialType(CreateTestDesignerDto) {}
