import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { ServerTestEvaluatorsService } from './test-evaluator.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { CreateTestEvaluatorDto } from './dto/create-test-evaluator.dto';
import { UpdateTestEvaluatorDto } from './dto/update-test-evaluator.dto';
import { UserRole } from '@server/users';

@ApiTags('TestEvaluators API')
@Controller('test_evaluators')
export class ServerTestEvaluatorController {
  constructor( private readonly serverTestEvaluatorsService: ServerTestEvaluatorsService ) {}

  // decoratori di swagger

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  create(@Body(ValidationPipe) createTestEvaluatorDto: CreateTestEvaluatorDto) {
    return this.serverTestEvaluatorsService.create(createTestEvaluatorDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll() {
    return this.serverTestEvaluatorsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serverTestEvaluatorsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateTestEvaluatorDto: UpdateTestEvaluatorDto) {
    return this.serverTestEvaluatorsService.update(id, updateTestEvaluatorDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.serverTestEvaluatorsService.remove(id);
  }
}