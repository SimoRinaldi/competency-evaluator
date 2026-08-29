import { Module } from '@nestjs/common';
import { CompetencyHistoricalScoreModule } from './competency-historical-score/competency-historical-score.module';
import { SubCompetencyHistoricalScoreModule } from './subcompetency-historical-score/subcompetency-historical-score.module';
import { HistoricalScoresService } from './historical-scores.service';

@Module({
  imports: [
    CompetencyHistoricalScoreModule,
    SubCompetencyHistoricalScoreModule,
  ],
  providers: [HistoricalScoresService],
  exports: [
    CompetencyHistoricalScoreModule,
    SubCompetencyHistoricalScoreModule,
    HistoricalScoresService,
  ],
})
export class ServerHistoricalScoresModule {}
