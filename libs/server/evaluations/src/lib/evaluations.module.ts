import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerRubricsModule } from '@server/rubrics';

import { RubricLevelAssignmentEntity } from './entities/rubric-level-assignment.entity';
import { BestCompetencyScoreEntity } from './entities/best-competency-score.entity';
import { BestSubCompetencyScoreEntity } from './entities/best-subcompetency-score.entity';

import { ServerRubricLevelAssignmentController } from './rubric-level-assignment.controller';
import { ServerBestCompetencyScoreController } from './best-competency-score.controller';
import { ServerBestSubCompetencyScoreController } from './best-subcompetency-score.controller';

import { ServerRubricLevelAssignmentsService } from './rubric-level-assignment.service';
import { ServerBestCompetencyScoresService } from './best-competency-score.service';
import { ServerBestSubCompetencyScoresService } from './best-subcompetency-score.service';
import { ServerEvaluationsService } from './evaluations.service';

import { ServerRubricLevelAssignmentsRepository } from './rubric-level-assignment.repository';
import { ServerBestCompetencyScoresRepository } from './best-competency-score.repository';
import { ServerBestSubCompetencyScoresRepository } from './best-subcompetency-score.repository';

@Module({
  imports: [
    ServerRubricsModule,
    TypeOrmModule.forFeature([
      RubricLevelAssignmentEntity,
      BestCompetencyScoreEntity,
      BestSubCompetencyScoreEntity,
    ]),
  ],
  controllers: [
    ServerRubricLevelAssignmentController,
    ServerBestCompetencyScoreController,
    ServerBestSubCompetencyScoreController,
  ],
  providers: [
    // services
    ServerRubricLevelAssignmentsService,
    ServerBestCompetencyScoresService,
    ServerBestSubCompetencyScoresService,
    ServerEvaluationsService,
    // repositories
    ServerRubricLevelAssignmentsRepository,
    ServerBestCompetencyScoresRepository,
    ServerBestSubCompetencyScoresRepository,
  ],
  exports: [
    ServerRubricLevelAssignmentsService,
    ServerBestCompetencyScoresService,
    ServerBestSubCompetencyScoresService,
    ServerEvaluationsService,
    ServerRubricLevelAssignmentsRepository,
    ServerBestCompetencyScoresRepository,
    ServerBestSubCompetencyScoresRepository,
  ],
})
export class ServerEvaluationsModule {}

