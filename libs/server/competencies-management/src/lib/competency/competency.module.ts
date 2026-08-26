import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetencyEntity } from './entities/competency.entity';
import { CompetencyController } from './competency.controller';
import { CompetencyService } from './competency.service';
import { CompetencyRepository } from './competency.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CompetencyEntity])],
  controllers: [CompetencyController],
  providers: [CompetencyService, CompetencyRepository],
  exports: [CompetencyService, CompetencyRepository],
})
export class CompetencyModule {}
