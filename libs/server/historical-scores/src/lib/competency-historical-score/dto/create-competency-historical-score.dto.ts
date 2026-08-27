import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumberString, IsPositive } from 'class-validator';

export class CreateCompetencyHistoricalScoreDto {
  @ApiProperty({
    example: 45,
    description: 'Punteggio assoluto calcolato',
  })
  @IsInt()
  @IsNotEmpty()
  score_absolute!: number;

  @ApiProperty({
    example: '85.50',
    description: 'Punteggio percentuale',
  })
  @IsNumberString()
  @IsNotEmpty()
  score_percentage!: string;

  @ApiProperty({
    example: 1,
    description: "ID dell'utente valutato",
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  user_id!: number;

  @ApiProperty({
    example: 1,
    description: 'ID della competenza associata',
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  competency_id!: number;
}
