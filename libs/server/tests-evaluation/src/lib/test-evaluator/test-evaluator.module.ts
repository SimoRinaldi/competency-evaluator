import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestEvaluatorEntity } from './entities/test-evaluator.entity';
import { TestEvaluatorController } from './test-evaluator.controller';
import { TestEvaluatorService } from './test-evaluator.service';
import { TestEvaluatorRepository } from './test-evaluator.repository';
import { ServerUsersModule } from '@server/users';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestEvaluatorEntity]),
    ServerUsersModule,
  ],
  controllers: [TestEvaluatorController],
  providers: [TestEvaluatorService, TestEvaluatorRepository],
  exports: [TestEvaluatorService, TestEvaluatorRepository],
})
export class TestEvaluatorModule {}
