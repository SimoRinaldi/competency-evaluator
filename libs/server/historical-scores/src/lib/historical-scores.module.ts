import { Module } from '@nestjs/common';
import { CompetencyHistoricalScoreModule } from './competency-historical-score/competency-historical-score.module';
import { SubCompetencyHistoricalScoreModule } from './subcompetency-historical-score/subcompetency-historical-score.module';

@Module({
  imports: [
    CompetencyHistoricalScoreModule,
    SubCompetencyHistoricalScoreModule,
  ],
  exports: [
    CompetencyHistoricalScoreModule,
    SubCompetencyHistoricalScoreModule,
  ],
})
export class ServerHistoricalScoresModule {}
