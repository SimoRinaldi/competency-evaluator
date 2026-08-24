import { Module } from '@nestjs/common';
import { BestCompetencyScoreModule } from './best-competency-score/best-competency-score.module';
import { BestSubCompetencyScoreModule } from './best-subcompetency-score/best-subcompetency-score.module';
import { RubricLevelAssignmentModule } from './rubric-level-assignment/rubric-level-assignment.module';
import { ServerEvaluationsService } from './evaluations.service';

@Module({
  imports: [
    BestCompetencyScoreModule,
    BestSubCompetencyScoreModule,
    RubricLevelAssignmentModule,
  ],
  controllers: [],
  providers: [ServerEvaluationsService],
  exports: [
    BestCompetencyScoreModule,
    BestSubCompetencyScoreModule,
    RubricLevelAssignmentModule,
    ServerEvaluationsService,
  ],
})
export class ServerEvaluationsModule {}
