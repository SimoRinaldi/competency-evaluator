import { ApiProperty } from "@nestjs/swagger";
import { UserCompetencyEvaluationDto } from "../best-competency-score/dto/user-competency-evaluation.dto";

export class BestScoresDto {
  @ApiProperty({
    type: () => [UserCompetencyEvaluationDto],
    description: 'Elenco delle competenze acquisite',
  })
  acquired_competencies!: UserCompetencyEvaluationDto[];

  @ApiProperty({
    type: () => [UserCompetencyEvaluationDto],
    description: 'Elenco delle competenze non acquisite',
  })
  unacquired_competencies!: UserCompetencyEvaluationDto[];
}
