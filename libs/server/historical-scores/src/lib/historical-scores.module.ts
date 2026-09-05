import { Module } from '@nestjs/common';
import { CompetencyModule } from '@server/competencies-management';
import { CompetencyHistoricalScoreModule } from './competency-historical-score/competency-historical-score.module';
import { SubCompetencyHistoricalScoreModule } from './subcompetency-historical-score/subcompetency-historical-score.module';
import { HistoricalScoresService } from './historical-scores.service';
import { HistoricalScoresController } from './historical-scores.controller';

@Module({
  imports: [
    CompetencyHistoricalScoreModule,
    SubCompetencyHistoricalScoreModule,
    CompetencyModule,
  ],
  controllers: [HistoricalScoresController],
  providers: [HistoricalScoresService],
  exports: [
    CompetencyHistoricalScoreModule,
    SubCompetencyHistoricalScoreModule,
    HistoricalScoresService,
  ],
})
export class ServerHistoricalScoresModule {}
