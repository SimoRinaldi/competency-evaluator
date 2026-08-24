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
import { ServerTestExecutionsService } from './test-execution.service';
import { CreateTestExecutionDto } from './dto/create-test-execution.dto';
import { UpdateTestExecutionDto } from './dto/update-test-execution.dto';

@ApiTags('TestExecutions API')
@Controller('test_executions')
export class ServerTestExecutionController {
  constructor(
    private readonly serverTestExecutionsService: ServerTestExecutionsService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  create(
    @Body(ValidationPipe) createTestExecutionDto: CreateTestExecutionDto
  ) {
    return this.serverTestExecutionsService.create(createTestExecutionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.EVALUATOR,
    UserRole.TEST_DESIGNER,
    UserRole.USER
  )
  @ApiBearerAuth()
  findAll() {
    return this.serverTestExecutionsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.EVALUATOR,
    UserRole.TEST_DESIGNER,
    UserRole.USER
  )
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serverTestExecutionsService.findOne(id);
  }

  @Get('by-user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.EVALUATOR,
    UserRole.TEST_DESIGNER,
    UserRole.USER
  )
  @ApiBearerAuth()
  findByEvaluatedUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.serverTestExecutionsService.findByEvaluatedUser(userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateTestExecutionDto: UpdateTestExecutionDto
  ) {
    return this.serverTestExecutionsService.update(
      id,
      updateTestExecutionDto
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serverTestExecutionsService.remove(id);
  }
}
