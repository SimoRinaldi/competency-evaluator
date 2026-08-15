import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { ServerRubricLevelAssignmentsService } from './rubric-level-assignment.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { CreateRubricLevelAssignmentDto } from './dto/create-rubric-level-assignment.dto';
import { UpdateRubricLevelAssignmentDto } from './dto/update-rubric-level-assignment.dto';
import { UserRole } from '@server/users';

@ApiTags('RubricLevelAssignments API')
@Controller('rubric_level_assignments')
export class ServerRubricLevelAssignmentController {
  constructor( 
    private readonly serverRubricLevelAssignmentsService: ServerRubricLevelAssignmentsService 
  ) {}

  // decoratori di swagger

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR)
  @ApiBearerAuth()
  create(@Body(ValidationPipe) createRubricLevelAssignmentDto: CreateRubricLevelAssignmentDto) {
    return this.serverRubricLevelAssignmentsService.create(createRubricLevelAssignmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  findAll() {
    return this.serverRubricLevelAssignmentsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serverRubricLevelAssignmentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR)
  @ApiBearerAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateRubricLevelAssignmentDto: UpdateRubricLevelAssignmentDto) {
    return this.serverRubricLevelAssignmentsService.update(id, updateRubricLevelAssignmentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serverRubricLevelAssignmentsService.remove(id);
  }
}