import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluatedUserEntity } from './entities/evaluated-user.entity';
import { EvaluatedUserController } from './evaluated-user.controller';
import { EvaluatedUserService } from './evaluated-user.service';
import { EvaluatedUserRepository } from './evaluated-user.repository';
import { ServerUsersModule } from '@server/users';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvaluatedUserEntity]),
    ServerUsersModule,
  ],
  controllers: [EvaluatedUserController],
  providers: [EvaluatedUserService, EvaluatedUserRepository],
  exports: [EvaluatedUserService, EvaluatedUserRepository],
})
export class EvaluatedUserSubModule {}
