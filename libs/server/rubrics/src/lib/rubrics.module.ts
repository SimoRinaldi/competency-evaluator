import { Module } from '@nestjs/common';
import { ServerRubricsController } from './rubrics.controller';
import { ServerRubricsService } from './rubrics.service';

@Module({
  controllers: [ServerRubricsController],
  providers: [ServerRubricsService],
  exports: [ServerRubricsService],
})
export class ServerRubricsModule {}
