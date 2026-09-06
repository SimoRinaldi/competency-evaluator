import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumberString, IsPositive } from 'class-validator';

export class CreateBestCompetencyScoreDto {
  @ApiProperty({
    required: true,
    example: 45,
    description: 'Punteggio assoluto calcolato',
  })
  @IsInt()
  @IsNotEmpty()
  best_score_absolute!: number;

  @ApiProperty({
    required: true,
    example: '85.50',
    description: 'Punteggio percentuale',
  })
  @IsNumberString()
  @IsNotEmpty()
  best_score_percentage!: string;

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
