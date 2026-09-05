import { ApiProperty } from '@nestjs/swagger';

export class UserSubCompetencyEvaluationDto {
  @ApiProperty({
    example: 1,
    description: 'ID della sotto-competenza',
  })
  subcompetency_id!: number;

  @ApiProperty({
    example: 'Analisi dei requisiti',
    description: 'Titolo della sotto-competenza',
  })
  title!: string;

  @ApiProperty({
    example: 1,
    description: 'ID della competenza associata',
  })
  competency_id!: number;

  @ApiProperty({
    example: 60,
    description: 'Soglia minima per considerare la sotto-competenza acquisita',
  })
  threshold!: number;

  @ApiProperty({
    example: 75,
    nullable: true,
    description:
      "Punteggio assoluto ottenuto dall'utente (null se mai affrontata)",
  })
  score_absolute!: number | null;

  @ApiProperty({
    example: '75.00',
    nullable: true,
    description:
      "Punteggio percentuale ottenuto dall'utente (null se mai affrontata)",
  })
  score_percentage!: string | null;
}
