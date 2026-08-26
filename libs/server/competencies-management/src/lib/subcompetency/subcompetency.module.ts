import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCompetencyEntity } from './entities/subcompetency.entity';
import { SubCompetencyController } from './subcompetency.controller';
import { SubCompetencyService } from './subcompetency.service';
import { SubCompetencyRepository } from './subcompetency.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubCompetencyEntity])],
  controllers: [SubCompetencyController],
  providers: [SubCompetencyService, SubCompetencyRepository],
  exports: [SubCompetencyService, SubCompetencyRepository],
})
export class SubCompetencyModule {}
