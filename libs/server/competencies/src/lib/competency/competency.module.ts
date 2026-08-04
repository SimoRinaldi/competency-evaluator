import { Module } from '@nestjs/common';
import { CompetencyService } from './competency.service';
import { CompetencyController } from './competency.controller';

@Module({
  controllers: [CompetencyController],
  providers: [CompetencyService],
})
export class CompetencyModule {}
