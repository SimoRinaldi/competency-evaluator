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
import { TestOutputService } from './test-output.service';
import { CreateTestOutputDto } from './dto/create-test-output.dto';
import { UpdateTestOutputDto } from './dto/update-test-output.dto';

@ApiTags('TestOutputs API')
@Controller('test_outputs')
export class TestOutputController {
  constructor(
    private readonly testOutputService: TestOutputService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR, UserRole.USER)
  @ApiBearerAuth()
  create(@Body(ValidationPipe) createTestOutputDto: CreateTestOutputDto) {
    return this.testOutputService.create(createTestOutputDto);
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
    return this.testOutputService.findAll();
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
    return this.testOutputService.findOne(id);
  }

  @Get('by-execution/:executionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.EVALUATOR,
    UserRole.TEST_DESIGNER,
    UserRole.USER
  )
  @ApiBearerAuth()
  findByExecution(
    @Param('executionId', ParseIntPipe) executionId: number
  ) {
    return this.testOutputService.findByTestExecution(executionId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR, UserRole.USER)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateTestOutputDto: UpdateTestOutputDto
  ) {
    return this.testOutputService.update(id, updateTestOutputDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR, UserRole.USER)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.testOutputService.remove(id);
  }
}
