import { Module } from '@nestjs/common';
import { EvaluatedUserSubModule } from './evaluated-user/evaluated-user.module';
import { TestExecutionSubModule } from './test-execution/test-execution.module';
import { TestOutputSubModule } from './test-output/test-output.module';

@Module({
  imports: [
    EvaluatedUserSubModule,
    TestExecutionSubModule,
    TestOutputSubModule,
  ],
  exports: [
    EvaluatedUserSubModule,
    TestExecutionSubModule,
    TestOutputSubModule,
  ],
})
export class ServerTestsExecutionModule {}

export {
  ServerTestsExecutionModule as ServerTestExecutionModule,
  ServerTestsExecutionModule as ServerTestExecutionsModule,
};
