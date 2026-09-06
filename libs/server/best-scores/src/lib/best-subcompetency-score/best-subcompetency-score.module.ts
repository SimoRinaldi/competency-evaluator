import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BestSubCompetencyScoreEntity } from './entities/best-subcompetency-score.entity';
import { BestSubCompetencyScoreController } from './best-subcompetency-score.controller';
import { BestSubCompetencyScoreService } from './best-subcompetency-score.service';
import { BestSubCompetencyScoreRepository } from './best-subcompetency-score.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BestSubCompetencyScoreEntity])],
  controllers: [BestSubCompetencyScoreController],
  providers: [BestSubCompetencyScoreService, BestSubCompetencyScoreRepository],
  exports: [BestSubCompetencyScoreService, BestSubCompetencyScoreRepository],
})
export class BestSubCompetencyScoreModule {}
