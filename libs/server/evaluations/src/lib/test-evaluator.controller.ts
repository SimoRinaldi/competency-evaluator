import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { ServerTestEvaluatorsService } from './test-evaluator.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateTestEvaluatorDto } from './dto/create-test-evaluator.dto';
import { UpdateTestEvaluatorDto } from './dto/update-test-evaluator.dto';

@ApiTags('TestEvaluators API')
@Controller('test_evaluators')
export class ServerTestEvaluatorController {
  constructor( private readonly serverTestEvaluatorsService: ServerTestEvaluatorsService ) {}

  // guardie, roles e decoratori di swagger

  @Post()
  create(@Body(ValidationPipe) createTestEvaluatorDto: CreateTestEvaluatorDto) {
    return this.serverTestEvaluatorsService.create(createTestEvaluatorDto);
  }

  @Get()
  findAll() {
    return this.serverTestEvaluatorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serverTestEvaluatorsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateTestEvaluatorDto: UpdateTestEvaluatorDto) {
    return this.serverTestEvaluatorsService.update(id, updateTestEvaluatorDto);
  }

  @Delete('id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.serverTestEvaluatorsService.delete(id);
  }
}