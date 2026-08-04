import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCompetencyEntity } from './entities/sub-competency.entity';
import { SubCompetencyController } from './sub-competency.controller';
import { SubCompetencyService } from './sub-competency.service';
import { SubCompetencyRepository } from './sub-competency.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubCompetencyEntity])],
  controllers: [SubCompetencyController],
  providers: [SubCompetencyService, SubCompetencyRepository],
  exports: [SubCompetencyService, SubCompetencyRepository],
})
export class SubCompetencyModule {}
