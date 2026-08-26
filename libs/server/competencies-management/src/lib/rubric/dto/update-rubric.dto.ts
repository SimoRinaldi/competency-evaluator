import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateRubricSetDto, CreateRubricLevelDto } from './create-rubric.dto';
import { IsOptional, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRubricLevelDto extends PartialType(CreateRubricLevelDto) {
  @IsOptional()
  @IsInt()
  id?: number;
}

export class UpdateRubricSetDto extends PartialType(
  OmitType(CreateRubricSetDto, ['levels'] as const)
) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRubricLevelDto)
  levels?: UpdateRubricLevelDto[];
}
