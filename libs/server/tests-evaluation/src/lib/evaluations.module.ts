import { Module } from '@nestjs/common';
import { RubricLevelAssignmentModule } from './rubric-level-assignment/rubric-level-assignment.module';
import { ServerTestsEvaluationService } from './evaluations.service';
import { ServerHistoricalScoresModule } from '@server/historical-scores';
import { ServerTestsExecutionModule } from '@server/tests-execution';

@Module({
  imports: [
    RubricLevelAssignmentModule,
    ServerHistoricalScoresModule,
    ServerTestsExecutionModule,
  ],
  controllers: [],
  providers: [ServerTestsEvaluationService],
  exports: [RubricLevelAssignmentModule, ServerTestsEvaluationService],
})
export class ServerTestsEvaluationModule {}

export { ServerTestsEvaluationModule as ServerEvaluationsModule };
