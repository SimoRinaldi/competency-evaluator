import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RubricSetEntity } from './entities/rubric-set.entity';
import { RubricLevelEntity } from './entities/rubric-level.entity';
import { RubricController } from './rubric.controller';
import { RubricService } from './rubric.service';
import { RubricRepository } from './rubric.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([RubricSetEntity, RubricLevelEntity]),
  ],
  controllers: [RubricController],
  providers: [RubricService, RubricRepository],
  exports: [RubricService, RubricRepository],
})
export class RubricModule {}
