import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TestDesignerEntity } from './entities/test-designer.entity';
import { TestEntity } from './entities/test.entity';
import { EvaluatedUserEntity } from './entities/evaluated-user.entity';
import { TestExecutionEntity } from './entities/test-execution.entity';
import { TestOutputEntity } from './entities/test-output.entity';

import { ServerTestDesignerController } from './test-designer.controller';
import { ServerTestController } from './test.controller';
import { ServerEvaluatedUserController } from './evaluated-user.controller';
import { ServerTestExecutionController } from './test-execution.controller';
import { ServerTestOutputController } from './test-output.controller';

import { ServerTestDesignersService } from './test-designer.service';
import { ServerTestsService } from './test.service';
import { ServerEvaluatedUsersService } from './evaluated-user.service';
import { ServerTestExecutionsService } from './test-execution.service';
import { ServerTestOutputsService } from './test-output.service';

import { ServerTestDesignersRepository } from './test-designer.repository';
import { ServerTestsRepository } from './test.repository';
import { ServerEvaluatedUsersRepository } from './evaluated-user.repository';
import { ServerTestExecutionsRepository } from './test-execution.repository';
import { ServerTestOutputsRepository } from './test-output.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TestDesignerEntity,
      TestEntity,
      EvaluatedUserEntity,
      TestExecutionEntity,
      TestOutputEntity,
    ]),
  ],
  controllers: [
    ServerTestDesignerController,
    ServerTestController,
    ServerEvaluatedUserController,
    ServerTestExecutionController,
    ServerTestOutputController,
  ],
  providers: [
    // Services
    ServerTestDesignersService,
    ServerTestsService,
    ServerEvaluatedUsersService,
    ServerTestExecutionsService,
    ServerTestOutputsService,
    // Repositories
    ServerTestDesignersRepository,
    ServerTestsRepository,
    ServerEvaluatedUsersRepository,
    ServerTestExecutionsRepository,
    ServerTestOutputsRepository,
  ],
  exports: [
    ServerTestDesignersService,
    ServerTestsService,
    ServerEvaluatedUsersService,
    ServerTestExecutionsService,
    ServerTestOutputsService,
    ServerTestDesignersRepository,
    ServerTestsRepository,
    ServerEvaluatedUsersRepository,
    ServerTestExecutionsRepository,
    ServerTestOutputsRepository,
  ],
})
export class ServerTestManagementModule {}
