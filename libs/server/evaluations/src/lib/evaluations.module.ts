import { Module } from '@nestjs/common';
import { RubricLevelAssignmentModule } from './rubric-level-assignment/rubric-level-assignment.module';
import { ServerEvaluationsService } from './evaluations.service';
import { ServerHistoricalScoresModule } from '@server/historical-scores';
import { ServerTestExecutionModule } from '@server/test-execution';

@Module({
  imports: [
    RubricLevelAssignmentModule,
    ServerHistoricalScoresModule,
    ServerTestExecutionModule,
  ],
  controllers: [],
  providers: [ServerEvaluationsService],
  exports: [RubricLevelAssignmentModule, ServerEvaluationsService],
})
export class ServerEvaluationsModule {}
