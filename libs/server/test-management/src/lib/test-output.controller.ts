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
import { ServerTestOutputsService } from './test-output.service';
import { CreateTestOutputDto } from './dto/create-test-output.dto';
import { UpdateTestOutputDto } from './dto/update-test-output.dto';

@ApiTags('TestOutputs API')
@Controller('test_outputs')
export class ServerTestOutputController {
  constructor(
    private readonly serverTestOutputsService: ServerTestOutputsService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR, UserRole.USER)
  @ApiBearerAuth()
  create(@Body(ValidationPipe) createTestOutputDto: CreateTestOutputDto) {
    return this.serverTestOutputsService.create(createTestOutputDto);
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
    return this.serverTestOutputsService.findAll();
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
    return this.serverTestOutputsService.findOne(id);
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
    return this.serverTestOutputsService.findByTestExecution(executionId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR, UserRole.USER)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateTestOutputDto: UpdateTestOutputDto
  ) {
    return this.serverTestOutputsService.update(id, updateTestOutputDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR, UserRole.USER)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serverTestOutputsService.remove(id);
  }
}
