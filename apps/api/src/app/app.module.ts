import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServerUsersModule } from '@server/users';
import { DatabaseModule } from '@org/database';
import { ServerAuthModule } from '@server/auth';
import { ServerRubricsModule } from '@server/rubrics';
import { ServerEvaluationsModule } from '@server/evaluations';

@Module({
  imports: [ServerUsersModule, DatabaseModule, ServerAuthModule, ServerRubricsModule, ServerEvaluationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
