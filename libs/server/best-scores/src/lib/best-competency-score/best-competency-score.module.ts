import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BestCompetencyScoreEntity } from './entities/best-competency-score.entity';
import { BestCompetencyScoreController } from './best-competency-score.controller';
import { BestCompetencyScoreService } from './best-competency-score.service';
import { BestCompetencyScoreRepository } from './best-competency-score.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BestCompetencyScoreEntity])],
  controllers: [BestCompetencyScoreController],
  providers: [BestCompetencyScoreService, BestCompetencyScoreRepository],
  exports: [BestCompetencyScoreService, BestCompetencyScoreRepository],
})
export class BestCompetencyScoreModule {}
