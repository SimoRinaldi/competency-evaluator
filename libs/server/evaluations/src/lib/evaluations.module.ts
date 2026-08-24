import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RubricLevelAssignmentEntity } from './entities/rubric-level-assignment.entity';
import { BestCompetencyScoreEntity } from './entities/best-competency-score.entity';
import { BestSubCompetencyScoreEntity } from './entities/best-subcompetency-score.entity';

import { ServerTestEvaluatorController } from './test-evaluator.controller';
import { ServerRubricLevelAssignmentController } from './rubric-level-assignment.controller';
import { ServerBestCompetencyScoreController } from './best-competency-score.controller';
import { ServerBestSubCompetencyScoreController } from './best-subcompetency-score.controller';

import { ServerTestEvaluatorsService } from './test-evaluator.service';
import { ServerRubricLevelAssignmentsService } from './rubric-level-assignment.service';
import { ServerBestCompetencyScoresService } from './best-competency-score.service';
import { ServerBestSubCompetencyScoresService } from './best-subcompetency-score.service';

import { ServerTestEvaluatorsRepository } from './test-evaluator.repository';
import { ServerRubricLevelAssignmentsRepository } from './rubric-level-assignment.repository';
import { ServerBestCompetencyScoresRepository } from './best-competency-score.repository';
import { ServerBestSubCompetencyScoresRepository } from './best-subcompetency-score.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RubricLevelAssignmentEntity,
      BestCompetencyScoreEntity,
      BestSubCompetencyScoreEntity
    ])
  ],
  controllers: [
    ServerTestEvaluatorController,
    ServerRubricLevelAssignmentController,
    ServerBestCompetencyScoreController,
    ServerBestSubCompetencyScoreController
  ],
  providers: [
    // services
    ServerTestEvaluatorsService,
    ServerRubricLevelAssignmentsService,
    ServerBestCompetencyScoresService,
    ServerBestSubCompetencyScoresService,
    // repositories
    ServerTestEvaluatorsRepository,
    ServerRubricLevelAssignmentsRepository,
    ServerBestCompetencyScoresRepository,
    ServerBestSubCompetencyScoresRepository
  ],
  exports: [],
})
export class ServerEvaluationsModule {}
