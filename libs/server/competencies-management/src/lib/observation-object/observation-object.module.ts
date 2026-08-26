import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservationObjectEntity } from './entities/observation-object.entity';
import { ObservationObjectController } from './observation-object.controller';
import { ObservationObjectService } from './observation-object.service';
import { ObservationObjectRepository } from './observation-object.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ObservationObjectEntity])],
  controllers: [ObservationObjectController],
  providers: [ObservationObjectService, ObservationObjectRepository],
  exports: [ObservationObjectService, ObservationObjectRepository],
})
export class ObservationObjectModule {}
