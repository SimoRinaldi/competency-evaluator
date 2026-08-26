import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestDesignerEntity } from './entities/test-designer.entity';
import { TestDesignerController } from './test-designer.controller';
import { TestDesignerService } from './test-designer.service';
import { TestDesignerRepository } from './test-designer.repository';
import { ServerUsersModule } from '@server/users';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestDesignerEntity]),
    ServerUsersModule,
  ],
  controllers: [TestDesignerController],
  providers: [TestDesignerService, TestDesignerRepository],
  exports: [TestDesignerService, TestDesignerRepository],
})
export class TestDesignerModule {}
