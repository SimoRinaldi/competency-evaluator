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
import { TestEvaluatorService } from './test-evaluator.service';
import { CreateTestEvaluatorDto } from './dto/create-test-evaluator.dto';
import { UpdateTestEvaluatorDto } from './dto/update-test-evaluator.dto';

@ApiTags('Test Evaluators APIs')
@Controller('test_evaluators')
export class TestEvaluatorController {
  constructor(private readonly service: TestEvaluatorService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  create(
    @Body(ValidationPipe)
    dto: CreateTestEvaluatorDto
  ) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  findAll() {
    return this.service.findAll();
  }

  @Get('by-test/:testId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER, UserRole.EVALUATOR, UserRole.USER)
  @ApiBearerAuth()
  findByTest(@Param('testId', ParseIntPipe) testId: number) {
    return this.service.findByTestId(testId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('by-user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR)
  @ApiBearerAuth()
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.findByUserId(userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    dto: UpdateTestEvaluatorDto
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
