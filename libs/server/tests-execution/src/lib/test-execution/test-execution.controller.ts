import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { TestExecutionService } from './test-execution.service';
import { CreateTestExecutionDto } from './dto/create-test-execution.dto';
import { UpdateTestExecutionDto } from './dto/update-test-execution.dto';

@ApiTags('Test Executions APIs')
@Controller('test_executions')
export class TestExecutionController {
  constructor(
    private readonly testExecutionService: TestExecutionService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiBearerAuth()
  create(
    @Body(ValidationPipe)
    dto: CreateTestExecutionDto
  ) {
    return this.testExecutionService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.TEST_DESIGNER,
    UserRole.EVALUATOR,
    UserRole.USER
  )
  @ApiBearerAuth()
  findAll() {
    return this.testExecutionService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.TEST_DESIGNER,
    UserRole.EVALUATOR,
    UserRole.USER
  )
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.testExecutionService.findOne(id);
  }

  @Get('by-user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.TEST_DESIGNER,
    UserRole.EVALUATOR,
    UserRole.USER
  )
  @ApiBearerAuth()
  findByEvaluatedUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.testExecutionService.findByEvaluatedUser(userId);
  }

  @Get('by-test/:testId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.TEST_DESIGNER,
    UserRole.EVALUATOR,
    UserRole.USER
  )
  @ApiBearerAuth()
  findByTest(@Param('testId', ParseIntPipe) testId: number) {
    return this.testExecutionService.findByTest(testId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    dto: UpdateTestExecutionDto
  ) {
    return this.testExecutionService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.testExecutionService.remove(id);
  }
}
