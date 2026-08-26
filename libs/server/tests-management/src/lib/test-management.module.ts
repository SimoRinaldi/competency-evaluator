import { Module } from '@nestjs/common';
import { TestSubModule } from './test/test.module';

@Module({
  imports: [TestSubModule],
  exports: [TestSubModule],
})
export class ServerTestsManagementModule {}

export {
  ServerTestsManagementModule as ServerTestManagementModule,
  ServerTestsManagementModule as ServerTestsModule,
};
