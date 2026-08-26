import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubCompetencyDto {
  @ApiProperty({
    description: 'Titolo della sotto-competenza',
    example: 'Intervista con il committente',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Peso o importanza della sotto-competenza',
    example: 3,
  })
  @IsNumber()
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

  @ApiProperty({ description: 'ID della competenza padre', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  competency_id!: number;

  @ApiPropertyOptional({
    description: 'ID degli strumenti associati',
    type: [Number],
    example: [1, 2],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  tool_ids?: number[];

  @ApiPropertyOptional({
    description: 'ID dei metodi associati',
    type: [Number],
    example: [1],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  method_ids?: number[];

  @ApiPropertyOptional({
    description: 'ID delle abilità associate',
    type: [Number],
    example: [3],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  skill_ids?: number[];
}
