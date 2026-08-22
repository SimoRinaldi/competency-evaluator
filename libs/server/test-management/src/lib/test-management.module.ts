import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerUsersModule } from '@server/users';

import { TestEntity } from './entities/test.entity';
import { TestExecutionEntity } from './entities/test-execution.entity';
import { TestOutputEntity } from './entities/test-output.entity';

import { ServerTestController } from './test.controller';
import { ServerTestExecutionController } from './test-execution.controller';
import { ServerTestOutputController } from './test-output.controller';

import { ServerTestsService } from './test.service';
import { ServerTestExecutionsService } from './test-execution.service';
import { ServerTestOutputsService } from './test-output.service';

import { ServerTestsRepository } from './test.repository';
import { ServerTestExecutionsRepository } from './test-execution.repository';
import { ServerTestOutputsRepository } from './test-output.repository';

@Module({
  imports: [
    ServerUsersModule,
    TypeOrmModule.forFeature([
      TestEntity,
      TestExecutionEntity,
      TestOutputEntity,
    ]),
  ],
  controllers: [
    ServerTestController,
    ServerTestExecutionController,
    ServerTestOutputController,
  ],
  providers: [
    // Services
    ServerTestsService,
    ServerTestExecutionsService,
    ServerTestOutputsService,
    // Repositories
    ServerTestsRepository,
    ServerTestExecutionsRepository,
    ServerTestOutputsRepository,
  ],
  exports: [
    ServerTestsService,
    ServerTestExecutionsService,
    ServerTestOutputsService,
    ServerTestsRepository,
    ServerTestExecutionsRepository,
    ServerTestOutputsRepository,
  ],
})
export class ServerTestManagementModule {}


