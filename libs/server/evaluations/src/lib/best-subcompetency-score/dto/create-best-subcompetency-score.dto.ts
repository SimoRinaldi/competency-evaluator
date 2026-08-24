import { IsInt, Min, IsNotEmpty, IsPositive, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBestSubCompetencyScoreDto {
  @ApiProperty({
    description: 'Punteggio assoluto ottenuto nella sotto-competenza',
    example: 20,
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  best_score_absolute!: number;

  @ApiProperty({
    description: 'Punteggio percentuale ottenuto nella sotto-competenza',
    example: '80.00',
  })
  @IsNumberString()
  @IsNotEmpty()
  best_score_percentage!: string;

  @ApiProperty({
    description: 'ID dell utente valutato',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  user_id!: number;

  @ApiProperty({
    description: 'ID della sotto-competenza valutata',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  subcompetency_id!: number;
}
