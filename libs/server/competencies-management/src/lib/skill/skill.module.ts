import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillEntity } from './entities/skill.entity';
import { SkillService } from './skill.service';
import { SkillController } from './skill.controller';
import { SkillRepository } from './skill.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SkillEntity])],
  controllers: [SkillController],
  providers: [SkillService, SkillRepository],
  exports: [SkillService, SkillRepository],
})
export class SkillModule {}
