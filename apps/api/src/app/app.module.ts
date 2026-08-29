import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServerUsersModule } from '@server/users';
import { DatabaseModule } from '@org/database';
import { ServerAuthModule } from '@server/auth';
import { ServerTestsEvaluationModule } from '@server/tests-evaluation';
import { ServerHistoricalScoresModule } from '@server/historical-scores';
import { ServerTestsManagementModule } from '@server/tests-management';
import { ServerTestsExecutionModule } from '@server/tests-execution';
import { ServerCompetenciesManagementModule } from '@server/competencies-management';

@Module({
  imports: [
    ServerUsersModule,
    DatabaseModule,
    ServerAuthModule,
    ServerTestsManagementModule,
    ServerTestsExecutionModule,
    ServerCompetenciesManagementModule,
    ServerHistoricalScoresModule,
    ServerTestsEvaluationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
