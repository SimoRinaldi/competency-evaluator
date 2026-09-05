import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerUsersModule } from '@server/users';
import { TestEntity } from './entities/test.entity';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { TestRepository } from './test.repository';
import { TestDesignerModule } from '../test-designer/test-designer.module';
import { SubCompetencyModule } from '@server/competencies-management';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestEntity]),
    ServerUsersModule,
    TestDesignerModule,
    SubCompetencyModule,
  ],
  controllers: [TestController],
  providers: [TestService, TestRepository],
  exports: [TestService, TestRepository],
})
export class TestModule {}
