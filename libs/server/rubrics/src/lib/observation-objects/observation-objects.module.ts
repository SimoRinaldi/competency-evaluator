import { Module } from '@nestjs/common';
import { ObservationObjectsService } from './observation-objects.service';
import { ObservationObjectsController } from './observation-objects.controller';

@Module({
  controllers: [ObservationObjectsController],
  providers: [ObservationObjectsService],
})
export class ObservationObjectsModule {}
