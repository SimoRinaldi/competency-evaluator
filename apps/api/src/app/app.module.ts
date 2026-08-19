import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServerUsersModule } from '@server/users';
import { DatabaseModule } from '@org/database';
import { ServerAuthModule } from '@server/auth';
import { ServerTestManagementModule } from '@server/test-management';

@Module({
  imports: [
    ServerUsersModule,
    DatabaseModule,
    ServerAuthModule,
    ServerTestManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
