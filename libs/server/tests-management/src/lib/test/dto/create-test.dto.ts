import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateTestDto {
  @ApiProperty({
    required: true,
    description:
      'Descrizione del contesto e della situazione di valutazione del test',
    example: 'Assessment di laboratorio sulle architetture software ad eventi.',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  assessment_situation!: string;

  @ApiProperty({
    required: true,
    description: 'ID del Test Designer responsabile della creazione del test',
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  test_designer_id!: number;

  @ApiProperty({
    required: true,
    description: 'Array di ID delle sotto-competenze valutate in questo test',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsNotEmpty()
  subcompetency_ids!: number[];

  @ApiPropertyOptional({
    description: 'Array di ID dei Test Evaluator (test_evaluator.id) assegnati a questo test',
    example: [1, 2],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsOptional()
  test_evaluator_ids?: number[];

  @ApiPropertyOptional({
    description: 'Array di ID degli Evaluated User assegnati a questo test',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsOptional()
  evaluated_user_ids?: number[];
}
