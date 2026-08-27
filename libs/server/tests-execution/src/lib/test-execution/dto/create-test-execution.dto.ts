import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsOptional,
  IsNumberString,
} from 'class-validator';

export class CreateTestExecutionDto {
  @ApiProperty({
    description: 'ID del test eseguito',
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  test_id!: number;

  @ApiProperty({
    description: "ID dell'utente valutato (evaluated_user)",
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  user_id!: number;

  @ApiPropertyOptional({
    description: 'Punteggio ottenuto nel test',
    example: '85.50',
    type: String,
  })
  @IsNumberString()
  @IsOptional()
  test_score?: string;

  @ApiPropertyOptional({
    description: 'Punteggio massimo raggiungibile nel test',
    example: '100.00',
    type: String,
  })
  @IsNumberString()
  @IsOptional()
  max_score?: string;
}
