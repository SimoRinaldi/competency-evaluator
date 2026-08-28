import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsRubricLevelsCountValid } from '../validators/rubric-levels-count.validator';

export class CreateRubricLevelDto {
  @ApiProperty({
    required: true,
    example: 'Inadeguato',
    description: 'Testo che descrive questo livello',
  })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty({
    required: true,
    example: 1,
    description: 'Valore numerico del livello',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rank!: number;
}

export class CreateRubricSetDto {
  @ApiProperty({
    required: true,
    example: false,
    description:
      'True per valutazione binaria (Si/No), False per scala standard',
  })
  @IsNotEmpty()
  @IsBoolean()
  yes_no!: boolean;

  @ApiProperty({
    required: true,
    type: () => [CreateRubricLevelDto],
    description: 'Elenco dei livelli da creare insieme al set',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRubricLevelDto)
  @IsNotEmpty()
  @IsRubricLevelsCountValid()
  levels!: CreateRubricLevelDto[];
}
