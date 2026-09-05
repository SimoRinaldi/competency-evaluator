import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsOptional, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateCompetencyDto } from '../competency/dto/create-competency.dto';
import { CreateSubCompetencyDto } from '../subcompetency/dto/create-subcompetency.dto';
import { CreateObservationObjectDto } from '../observation-object/dto/create-observation-object.dto';
import { CreateIndicatorDto } from '../indicator/dto/create-indicator.dto';
import { CreateRubricSetDto } from '../rubric/dto/create-rubric.dto';
import { CreateToolDto } from '../tool/dto/create-tool.dto';
import { CreateMethodDto } from '../method/dto/create-method.dto';
import { CreateSkillDto } from '../skill/dto/create-skill.dto';

export class CreateToolChainDto extends CreateToolDto {}
export class CreateMethodChainDto extends CreateMethodDto {}
export class CreateSkillChainDto extends CreateSkillDto {}

export class CreateIndicatorChainDto extends OmitType(CreateIndicatorDto, [
  'observation_object_id',
] as const) {
  @ApiPropertyOptional({
    description: "ID dell'indicatore (opzionale, utile per update/upsert)",
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRubricSetDto)
  rubricSet?: CreateRubricSetDto;
}

export class CreateObservationObjectChainDto extends OmitType(CreateObservationObjectDto, [
  'subcompetency_id',
] as const) {
  @ApiPropertyOptional({
    description: "ID dell'oggetto di osservazione (opzionale, utile per update/upsert)",
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIndicatorChainDto)
  indicators!: CreateIndicatorChainDto[];
}

export class CreateSubCompetencyChainDto extends OmitType(CreateSubCompetencyDto, [
  'competency_id',
] as const) {
  @ApiPropertyOptional({
    description: "ID della sotto-competenza (opzionale, utile per update/upsert)",
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id?: number;

  @ValidateNested()
  @Type(() => CreateObservationObjectChainDto)
  observationObject!: CreateObservationObjectChainDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateToolChainDto)
  tools?: CreateToolChainDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMethodChainDto)
  methods?: CreateMethodChainDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSkillChainDto)
  skills?: CreateSkillChainDto[];
}

export class CreateCompetencyChainDto extends CreateCompetencyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubCompetencyChainDto)
  subcompetencies!: CreateSubCompetencyChainDto[];
}

