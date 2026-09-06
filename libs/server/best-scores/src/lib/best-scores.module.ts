import { Module } from '@nestjs/common';
import { BestCompetencyScoreModule } from './best-competency-score/best-competency-score.module';
import { BestSubCompetencyScoreModule } from './best-subcompetency-score/best-subcompetency-score.module';
import { BestScoresService } from './best-scores.service';
import { BestScoresController } from './best-scores.controller';
import { CompetencyModule } from '@server/competencies-management';

@Module({
  imports: [BestCompetencyScoreModule, BestSubCompetencyScoreModule, CompetencyModule],
  controllers: [BestScoresController],
  providers: [BestScoresService],
  exports: [BestCompetencyScoreModule, BestSubCompetencyScoreModule, BestScoresService],
})
export class ServerBestScoresModule {}
