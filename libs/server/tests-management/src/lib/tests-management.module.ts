import { Module } from '@nestjs/common';
import { TestModule } from './test/test.module';
import { TestDesignerModule } from './test-designer/test-designer.module';

@Module({
  imports: [TestModule, TestDesignerModule],
  exports: [TestModule, TestDesignerModule],
})
export class ServerTestsManagementModule {}
