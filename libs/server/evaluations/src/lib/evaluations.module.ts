import { Module } from '@nestjs/common';
import { ServerEvaluationsController } from './evaluations.controller';
import { ServerEvaluationsService } from './evaluations.service';

@Module({
  controllers: [ServerEvaluationsController],
  providers: [ServerEvaluationsService],
  exports: [ServerEvaluationsService],
})
export class ServerEvaluationsModule {}
