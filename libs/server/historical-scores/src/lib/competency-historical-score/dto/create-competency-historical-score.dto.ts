import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumberString, IsPositive } from 'class-validator';

export class CreateCompetencyHistoricalScoreDto {
  @ApiProperty({
    required: true,
    example: 45,
    description: 'Punteggio assoluto calcolato',
  })
  @IsInt()
  @IsNotEmpty()
  score_absolute!: number;

  @ApiProperty({
    required: true,
    example: '85.50',
    description: 'Punteggio percentuale',
  })
  @IsNumberString()
  @IsNotEmpty()
  score_percentage!: string;

  @ApiProperty({
    required: true,
    example: 1,
    description: "ID dell'utente valutato",
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  user_id!: number;

  @ApiProperty({
    required: true,
    example: 1,
    description: 'ID della competenza associata',
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  competency_id!: number;
}
