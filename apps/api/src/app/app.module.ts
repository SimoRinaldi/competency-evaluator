import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServerUsersModule } from '@server/users';
import { DatabaseModule } from '@org/database';
import { ServerAuthModule } from '@server/auth';
import { ServerRubricsModule } from '@server/rubrics';

@Module({
  imports: [ServerUsersModule, DatabaseModule, ServerAuthModule, ServerRubricsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
