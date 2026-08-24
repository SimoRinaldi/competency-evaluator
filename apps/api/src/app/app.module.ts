import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServerUsersModule } from '@server/users';
import { DatabaseModule } from '@org/database';
import { ServerAuthModule } from '@server/auth';
import { ServerRubricsModule } from '@server/rubrics';
import { ServerEvaluationsModule } from '@server/evaluations';
import { ServerTestManagementModule } from '@server/test-management';
import { ServerCompetenciesModule } from '@server/competencies';

@Module({
  imports: [
    ServerUsersModule,
    DatabaseModule,
    ServerAuthModule,
    ServerTestManagementModule,
    ServerCompetenciesModule,
    ServerRubricsModule, 
    ServerEvaluationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
