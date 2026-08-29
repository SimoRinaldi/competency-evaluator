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
import { RubricLevelAssignmentService } from './rubric-level-assignment.service';
import { CreateRubricLevelAssignmentDto } from './dto/create-rubric-level-assignment.dto';
import { UpdateRubricLevelAssignmentDto } from './dto/update-rubric-level-assignment.dto';

@ApiTags('Rubric Level Assignments APIs')
@Controller('rubric_level_assignments')
export class RubricLevelAssignmentController {
  constructor(
    private readonly rubricLevelAssignmentsService: RubricLevelAssignmentService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR)
  @ApiBearerAuth()
  create(
    @Body(ValidationPipe)
    createRubricLevelAssignmentDto: CreateRubricLevelAssignmentDto
  ) {
    return this.rubricLevelAssignmentsService.create(
      createRubricLevelAssignmentDto
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  findAll() {
    return this.rubricLevelAssignmentsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rubricLevelAssignmentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    updateRubricLevelAssignmentDto: UpdateRubricLevelAssignmentDto
  ) {
    return this.rubricLevelAssignmentsService.update(
      id,
      updateRubricLevelAssignmentDto
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVALUATOR)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rubricLevelAssignmentsService.remove(id);
  }
}
