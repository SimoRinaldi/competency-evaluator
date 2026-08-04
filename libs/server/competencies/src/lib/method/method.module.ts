import { Module } from '@nestjs/common';
import { MethodService } from './method.service';
import { MethodController } from './method.controller';

@Module({
  controllers: [MethodController],
  providers: [MethodService],
})
export class MethodModule {}
