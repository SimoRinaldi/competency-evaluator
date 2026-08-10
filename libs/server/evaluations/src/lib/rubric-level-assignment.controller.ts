import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { ServerRubricLevelAssignmentsService } from './rubric-level-assignment.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateBestSubCompetencyScoreDto as CreateRubricLevelAssignmentDto } from './dto/create-best-subcompetency-score.dto';
import { UpdateBestSubCompetencyScoreDto as UpdateRubricLevelAssignmentDto } from './dto/update-best-subcompetency-score.dto';

@ApiTags('RubricLevelAssignments API')
@Controller('rubric_level_assignments')
export class ServerRubricLevelAssignmentController {
  constructor( private readonly serverRubricLevelAssignmentsService: ServerRubricLevelAssignmentsService ) {}

  // guardie, roles e decoratori di swagger

  @Post()
  create(@Body(ValidationPipe) createRubricLevelAssignmentDto: CreateRubricLevelAssignmentDto) {
    return this.serverRubricLevelAssignmentsService.create(createRubricLevelAssignmentDto);
  }

  @Get()
  findAll() {
    return this.serverRubricLevelAssignmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serverRubricLevelAssignmentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateRubricLevelAssignmentDto: UpdateRubricLevelAssignmentDto) {
    return this.serverRubricLevelAssignmentsService.update(id, updateRubricLevelAssignmentDto);
  }

  @Delete('id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serverRubricLevelAssignmentsService.delete(id);
  }
}