import {
  IsArray,
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubCompetencyDto {
  @ApiProperty({
    required: true,
    description: 'Titolo della sotto-competenza',
    example: 'Intervista con il committente',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    required: true,
    description: 'Peso o importanza della sotto-competenza',
    example: 3,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  weight!: number;

  @ApiPropertyOptional({
    description: 'Input richiesto',
    example: 'Set di domande',
  })
  @IsString()
  @IsOptional()
  input?: string;

  @ApiPropertyOptional({
    description: 'Output atteso',
    example: 'Punteggio di valutazione',
  })
  @IsString()
  @IsOptional()
  output?: string;

  @ApiPropertyOptional({
    description: 'Azione eseguita',
    example: 'Chiamare un cliente fittizio',
  })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiProperty({
    required: true,
    description: 'ID della competenza padre',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  competency_id!: number;

  @ApiPropertyOptional({
    description: 'ID degli strumenti associati',
    type: [Number],
    example: [1, 2],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  tool_ids?: number[];

  @ApiPropertyOptional({
    description: 'ID dei metodi associati',
    type: [Number],
    example: [1],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  method_ids?: number[];

  @ApiPropertyOptional({
    description: 'ID delle abilità associate',
    type: [Number],
    example: [3],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  skill_ids?: number[];

  @ApiProperty({
    required: true,
    description: 'Soglia di acquisizione della sotto-competenza',
    example: '30',
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  threshold!: number;
}
