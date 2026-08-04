import { Module } from '@nestjs/common';
import { SubCompetencyService } from './sub-competency.service';
import { SubCompetencyController } from './sub-competency.controller';

@Module({
  controllers: [SubCompetencyController],
  providers: [SubCompetencyService],
})
export class SubCompetencyModule {}
