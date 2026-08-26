import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServerUsersModule } from '@server/users';
import { DatabaseModule } from '@org/database';
import { ServerAuthModule } from '@server/auth';
import { ServerEvaluationsModule } from '@server/evaluations';
import { ServerHistoricalScoresModule } from '@server/historical-scores';
import { ServerTestManagementModule } from '@server/test-management';
import { ServerTestExecutionModule } from '@server/test-execution';
import { ServerCompetenciesModule } from '@server/competencies';

@Module({
  imports: [
    ServerUsersModule,
    DatabaseModule,
    ServerAuthModule,
    ServerTestManagementModule,
    ServerTestExecutionModule,
    ServerCompetenciesModule,
    ServerHistoricalScoresModule,
    ServerEvaluationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
