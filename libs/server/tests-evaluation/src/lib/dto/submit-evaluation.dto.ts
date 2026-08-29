import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SingleIndicatorEvaluationDto {
  @ApiProperty({
    description: "ID dell'indicatore da valutare",
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  indicator_id!: number;

  @ApiProperty({
    description:
      'Punteggio/livello assegnato (da 1 a 5, oppure 1 o 5 per rubriche Yes/No)',
    example: 4,
    type: Number,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rubric_rank!: number;
}

export class SubmitEvaluationDto {
  @ApiProperty({
    description: "ID dell'esecuzione del test da valutare",
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  test_execution_id!: number;

  @ApiPropertyOptional({
    description:
      "ID del valutatore (opzionale se valorizzato automaticamente dal token d'accesso)",
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  evaluator_id?: number;

  @ApiProperty({
    description: 'Lista di valutazioni per i singoli indicatori',
    type: [SingleIndicatorEvaluationDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleIndicatorEvaluationDto)
  evaluations!: SingleIndicatorEvaluationDto[];
}
