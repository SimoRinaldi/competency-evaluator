import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';  
import { RubricsService } from './rubrics.service';
import { RubricsController } from './rubrics.controller';
import { RubricSetEntity } from './entities/rubric-set.entity';                                              
import { RubricLevelEntity } from './entities/rubric-level.entity';  

@Module({
  imports: [TypeOrmModule.forFeature([RubricSetEntity, RubricLevelEntity])], 
  controllers: [RubricsController],
  providers: [RubricsService],
})
export class RubricsModule {}
