import { Module } from '@nestjs/common';
import { ServerCompetenciesManagementModule } from '@server/competencies-management';
import { RubricLevelAssignmentModule } from './rubric-level-assignment/rubric-level-assignment.module';
import { TestEvaluatorModule } from './test-evaluator/test-evaluator.module';
import { TestsEvaluationService } from './tests-evaluation.service';
import { ServerHistoricalScoresModule } from '@server/historical-scores';
import { ServerTestsExecutionModule } from '@server/tests-execution';

@Module({
  imports: [
    ServerCompetenciesManagementModule,
    RubricLevelAssignmentModule,
    TestEvaluatorModule,
    ServerHistoricalScoresModule,
    ServerTestsExecutionModule,
  ],
  controllers: [],
  providers: [TestsEvaluationService],
  exports: [
    RubricLevelAssignmentModule,
    TestEvaluatorModule,
    TestsEvaluationService,
  ],
})
export class ServerTestsEvaluationModule {}

