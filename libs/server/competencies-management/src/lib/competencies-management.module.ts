import { Module } from '@nestjs/common';
import { CompetencyModule } from './competency/competency.module';
import { SubCompetencyModule } from './subcompetency/subcompetency.module';
import { SkillModule } from './skill/skill.module';
import { ToolModule } from './tool/tool.module';
import { MethodModule } from './method/method.module';
import { RubricModule } from './rubric/rubric.module';
import { ObservationObjectModule } from './observation-object/observation-object.module';
import { IndicatorModule } from './indicator/indicator.module';
import { CompetenciesManagementService } from './competencies-management.service';
import { CompetenciesManagementController } from './competencies-management.controller';

@Module({
  controllers: [CompetenciesManagementController],
  providers: [CompetenciesManagementService],
  exports: [
    CompetencyModule,
    SubCompetencyModule,
    SkillModule,
    ToolModule,
    MethodModule,
    RubricModule,
    ObservationObjectModule,
    IndicatorModule,
    CompetenciesManagementService
  ],
  imports: [
    CompetencyModule,
    SubCompetencyModule,
    SkillModule,
    ToolModule,
    MethodModule,
    RubricModule,
    ObservationObjectModule,
    IndicatorModule,
  ],
})
export class ServerCompetenciesManagementModule {}
