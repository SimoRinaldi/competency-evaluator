import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerRubricsModule } from '@server/rubrics';
import { RubricLevelAssignmentEntity } from './entities/rubric-level-assignment.entity';
import { RubricLevelAssignmentController } from './rubric-level-assignment.controller';
import { RubricLevelAssignmentService } from './rubric-level-assignment.service';
import { RubricLevelAssignmentRepository } from './rubric-level-assignment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([RubricLevelAssignmentEntity]),
    ServerRubricsModule,
  ],
  controllers: [RubricLevelAssignmentController],
  providers: [RubricLevelAssignmentService, RubricLevelAssignmentRepository],
  exports: [RubricLevelAssignmentService, RubricLevelAssignmentRepository],
})
export class RubricLevelAssignmentModule {}
