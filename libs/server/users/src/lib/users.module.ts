import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), EventEmitterModule.forRoot()],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService, SeedService],
  exports: [UsersRepository, UsersService],
})
export class ServerUsersModule {}
