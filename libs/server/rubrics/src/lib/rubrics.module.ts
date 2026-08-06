import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RubricsController } from './rubrics.controller';
import { RubricsService } from './rubrics.service';
import { ObservationObjectsController } from './observation-objects.controller';
import { ObservationObjectsService } from './observation-objects.service';
import { IndicatorsController } from './indicators.controller';
import { IndicatorsService } from './indicators.service';
import { RubricSetEntity } from './entities/rubric-set.entity';
import { RubricLevelEntity } from './entities/rubric-level.entity';
import { ObservationObjectEntity } from './entities/observation-object.entity';
import { IndicatorEntity } from './entities/indicator.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RubricSetEntity, RubricLevelEntity, ObservationObjectEntity, IndicatorEntity])
  ],
  controllers: [RubricsController, ObservationObjectsController, IndicatorsController],
  providers: [RubricsService, ObservationObjectsService, IndicatorsService],
  exports: [RubricsService, ObservationObjectsService, IndicatorsService],
})
export class ServerRubricsModule {}
