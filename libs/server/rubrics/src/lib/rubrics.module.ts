import { Module } from '@nestjs/common';
import { ObservationObjectsModule } from './observation-objects/observation-objects.module';
import { IndicatorsModule } from './indicators/indicators.module';

@Module({
  controllers: [],
  providers: [],
  exports: [],
  imports: [ObservationObjectsModule, IndicatorsModule],
})
export class ServerRubricsModule {}
