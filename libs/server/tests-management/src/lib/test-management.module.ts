import { Module } from '@nestjs/common';
import { TestSubModule } from './test/test.module';
import { TestDesignerSubModule } from './test-designer/test-designer.module';

@Module({
  imports: [TestSubModule, TestDesignerSubModule],
  exports: [TestSubModule, TestDesignerSubModule],
})
export class ServerTestsManagementModule {}

export {
  ServerTestsManagementModule as ServerTestManagementModule,
  ServerTestsManagementModule as ServerTestsModule,
};
