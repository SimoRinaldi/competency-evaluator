import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerUsersModule } from '@server/users';
import { TestEntity } from './entities/test.entity';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { TestRepository } from './test.repository';
import { TestDesignerSubModule } from '../test-designer/test-designer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestEntity]),
    ServerUsersModule,
    TestDesignerSubModule,
  ],
  controllers: [TestController],
  providers: [TestService, TestRepository],
  exports: [TestService, TestRepository],
})
export class TestSubModule {}
