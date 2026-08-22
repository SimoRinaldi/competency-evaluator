import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { EvaluatedUserEntity } from './entities/evaluated-user.entity';
import { TestDesignerEntity } from './entities/test-designer.entity';
import { ServerUsersController } from './users.controller';
import { ServerUsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { EvaluatedUsersRepository } from './repositories/evaluated-user.repository';
import { TestDesignersRepository } from './repositories/test-designer.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      EvaluatedUserEntity,
      TestDesignerEntity,
    ]),
  ],
  controllers: [ServerUsersController],
  providers: [
    ServerUsersService,
    UsersRepository,
    EvaluatedUsersRepository,
    TestDesignersRepository,
  ],
  exports: [
    ServerUsersService,
    UsersRepository,
    EvaluatedUsersRepository,
    TestDesignersRepository,
  ],
})
export class ServerUsersModule {}



