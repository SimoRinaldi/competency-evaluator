import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MethodEntity } from './entities/method.entity';
import { MethodController } from './method.controller';
import { MethodService } from './method.service';
import { MethodRepository } from './method.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MethodEntity])],
  controllers: [MethodController],
  providers: [MethodService, MethodRepository],
  exports: [MethodService, MethodRepository],
})
export class MethodModule {}
