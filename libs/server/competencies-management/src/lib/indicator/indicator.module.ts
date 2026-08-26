import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicatorEntity } from './entities/indicator.entity';
import { IndicatorController } from './indicator.controller';
import { IndicatorService } from './indicator.service';
import { IndicatorRepository } from './indicator.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IndicatorEntity])],
  controllers: [IndicatorController],
  providers: [IndicatorService, IndicatorRepository],
  exports: [IndicatorService, IndicatorRepository],
})
export class IndicatorModule {}
