import { PartialType } from '@nestjs/swagger';
import { CreateObservationObjectDto } from './create-observation-object.dto';

export class UpdateObservationObjectDto extends PartialType(
  CreateObservationObjectDto
) {}