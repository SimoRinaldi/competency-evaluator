import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerUsersModule } from '@server/users';
import { ServerTestManagementModule } from '@server/test-management';
import { TestExecutionEntity } from './entities/test-execution.entity';
import { TestExecutionController } from './test-execution.controller';
import { TestExecutionService } from './test-execution.service';
import { TestExecutionRepository } from './test-execution.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestExecutionEntity]),
    ServerUsersModule,
    ServerTestManagementModule,
  ],
  controllers: [TestExecutionController],
  providers: [TestExecutionService, TestExecutionRepository],
  exports: [TestExecutionService, TestExecutionRepository],
})
export class TestExecutionSubModule {}
