import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { ServerUsersController } from './users.controller';
import { ServerUsersService } from './users.service';
import { UsersRepository } from './users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [ServerUsersController],
  providers: [
    ServerUsersService,
    UsersRepository
  ],
  exports: [ServerUsersService]
})
export class ServerUsersModule {}

