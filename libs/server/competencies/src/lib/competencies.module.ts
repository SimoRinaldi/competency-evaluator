import { Module } from '@nestjs/common';
import { CompetencyModule } from './competency/competency.module';
import { SubCompetencyModule } from './sub-competency/sub-competency.module';
import { SkillModule } from './skill/skill.module';
import { ToolModule } from './tool/tool.module';
import { MethodModule } from './method/method.module';

@Module({
  controllers: [],
  providers: [],
  exports: [],
  imports: [
    CompetencyModule,
    SubCompetencyModule,
    SkillModule,
    ToolModule,
    MethodModule,
  ],
})
export class ServerCompetenciesModule {}
