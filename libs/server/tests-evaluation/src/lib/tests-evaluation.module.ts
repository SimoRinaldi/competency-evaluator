import { Module } from '@nestjs/common';
import { ServerCompetenciesManagementModule } from '@server/competencies-management';
import { RubricLevelAssignmentModule } from './rubric-level-assignment/rubric-level-assignment.module';
import { TestEvaluatorModule } from './test-evaluator/test-evaluator.module';
import { TestsEvaluationService } from './tests-evaluation.service';
import { ServerBestScoresModule } from '@server/best_scores';
import { ServerTestsExecutionModule } from '@server/tests-execution';

import { TestsEvaluationController } from './tests-evaluation.controller';

@Module({
  imports: [
    ServerCompetenciesManagementModule,
    RubricLevelAssignmentModule,
    TestEvaluatorModule,
    ServerBestScoresModule,
    ServerTestsExecutionModule,
  ],
  controllers: [TestsEvaluationController],
  providers: [TestsEvaluationService],
  exports: [RubricLevelAssignmentModule, TestEvaluatorModule, TestsEvaluationService],
})
export class ServerTestsEvaluationModule {}
