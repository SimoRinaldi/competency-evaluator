import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';  
import { RubricsService } from './rubrics.service';
import { RubricsController } from './rubrics.controller';
import { RubricSet } from './entities/rubric-set.entity';                                              
import { RubricLevel } from './entities/rubric-level.entity';  

@Module({
  imports: [TypeOrmModule.forFeature([RubricSet, RubricLevel])], 
  controllers: [RubricsController],
  providers: [RubricsService],
})
export class RubricsModule {}
