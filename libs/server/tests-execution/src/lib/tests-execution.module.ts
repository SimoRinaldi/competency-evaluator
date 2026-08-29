import { Module } from '@nestjs/common';
import { EvaluatedUserModule } from './evaluated-user/evaluated-user.module';
import { TestExecutionModule } from './test-execution/test-execution.module';
import { TestOutputModule } from './test-output/test-output.module';

@Module({
  imports: [
    EvaluatedUserModule,
    TestExecutionModule,
    TestOutputModule,
  ],
  exports: [
    EvaluatedUserModule,
    TestExecutionModule,
    TestOutputModule,
  ],
})
export class ServerTestsExecutionModule {}
