import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolEntity } from './entities/tool.entity';
import { ToolService } from './tool.service';
import { ToolController } from './tool.controller';
import { ToolRepository } from './tool.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ToolEntity])],
  controllers: [ToolController],
  providers: [ToolService, ToolRepository],
  exports: [ToolService, ToolRepository],
})
export class ToolModule {}
