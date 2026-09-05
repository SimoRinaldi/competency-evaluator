import { ApiProperty } from '@nestjs/swagger';
import { UserSubCompetencyEvaluationDto } from '../../best-subcompetency-score/dto/user-subcompetency-evaluation.dto';

export class UserCompetencyEvaluationDto {
  @ApiProperty({
    example: 1,
    description: 'ID della competenza',
  })
  competency_id!: number;

  @ApiProperty({
    example: 'Problem Solving',
    description: 'Titolo della competenza',
  })
  title!: string;

  @ApiProperty({
    example: 60,
    description: 'Soglia minima per considerare la competenza acquisita',
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

  @ApiProperty({
    type: () => [UserSubCompetencyEvaluationDto],
    description: 'Elenco delle sotto-competenze associate',
  })
  subcompetencies!: UserSubCompetencyEvaluationDto[];
}
