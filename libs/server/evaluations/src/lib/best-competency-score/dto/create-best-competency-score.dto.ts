import { IsInt, Min, IsNotEmpty, IsPositive, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBestCompetencyScoreDto {
  @ApiProperty({
    description: 'Punteggio assoluto ottenuto nella competenza',
    example: 45,
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  best_score_absolute!: number;

  @ApiProperty({
    description: 'Punteggio percentuale ottenuto nella competenza',
    example: '90.00',
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
    description: 'ID della competenza valutata',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  competency_id!: number;
}
