import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestOutputEntity } from './entities/test-output.entity';
import { TestOutputController } from './test-output.controller';
import { TestOutputService } from './test-output.service';
import { TestOutputRepository } from './test-output.repository';
import { TestExecutionModule } from '../test-execution/test-execution.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestOutputEntity]),
    TestExecutionModule
  ],
  controllers: [TestOutputController],
  providers: [TestOutputService, TestOutputRepository],
  exports: [TestOutputService, TestOutputRepository],
})
export class TestOutputModule {}
