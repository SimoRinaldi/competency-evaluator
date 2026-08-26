import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCompetencyHistoricalScoreEntity } from './entities/subcompetency-historical-score.entity';
import { SubCompetencyHistoricalScoreController } from './subcompetency-historical-score.controller';
import { SubCompetencyHistoricalScoreService } from './subcompetency-historical-score.service';
import { SubCompetencyHistoricalScoreRepository } from './subcompetency-historical-score.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubCompetencyHistoricalScoreEntity])],
  controllers: [SubCompetencyHistoricalScoreController],
  providers: [
    SubCompetencyHistoricalScoreService,
    SubCompetencyHistoricalScoreRepository,
  ],
  exports: [
    SubCompetencyHistoricalScoreService,
    SubCompetencyHistoricalScoreRepository,
  ],
})
export class SubCompetencyHistoricalScoreModule {}
