import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tool } from './entities/tool.entity';
import { ToolService } from './tool.service';
import { ToolController } from './tool.controller';
import { ToolRepository } from './tool.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Tool])],
  controllers: [ToolController],
  providers: [ToolService, ToolRepository],
  exports: [ToolService, ToolRepository],
})
export class ToolModule {}
