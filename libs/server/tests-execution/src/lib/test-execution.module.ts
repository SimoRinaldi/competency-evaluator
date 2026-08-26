import { Module } from '@nestjs/common';
import { TestExecutionSubModule } from './test-execution/test-execution.module';
import { TestOutputSubModule } from './test-output/test-output.module';

@Module({
  imports: [TestExecutionSubModule, TestOutputSubModule],
  exports: [TestExecutionSubModule, TestOutputSubModule],
})
export class ServerTestsExecutionModule {}

export {
  ServerTestsExecutionModule as ServerTestExecutionModule,
  ServerTestsExecutionModule as ServerTestExecutionsModule,
};
