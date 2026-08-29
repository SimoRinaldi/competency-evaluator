import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetencyHistoricalScoreEntity } from './entities/competency-historical-score.entity';
import { CompetencyHistoricalScoreController } from './competency-historical-score.controller';
import { CompetencyHistoricalScoreService } from './competency-historical-score.service';
import { CompetencyHistoricalScoreRepository } from './competency-historical-score.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CompetencyHistoricalScoreEntity])],
  controllers: [CompetencyHistoricalScoreController],
  providers: [
    CompetencyHistoricalScoreService,
    CompetencyHistoricalScoreRepository,
  ],
  exports: [
    CompetencyHistoricalScoreService,
    CompetencyHistoricalScoreRepository,
  ],
})
export class CompetencyHistoricalScoreModule {}
