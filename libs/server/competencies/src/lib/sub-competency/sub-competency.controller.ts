import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { SubCompetencyService } from './sub-competency.service';
import { CreateSubCompetencyDto } from './dto/create-sub-competency.dto';
import { UpdateSubCompetencyDto } from './dto/update-sub-competency.dto';

@ApiTags('SubCompetencies APIs')
@Controller('sub-competencies')
export class SubCompetencyController {
  constructor(
    private readonly subCompetencyService: SubCompetencyService
  ) {}

  @Get() // GET /sub-competencies
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  getSubCompetencies() {
    return this.subCompetencyService.getSubCompetencies();
  }

  @Get(':id') // GET /sub-competencies/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  getOneSubCompetency(@Param('id', ParseIntPipe) id: number) {
    return this.subCompetencyService.getOneSubCompetency(id);
  }

  @Post() // POST /sub-competencies
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: '' },
        weight: { type: 'number', example: 5 },
        input: { type: 'string', example: '' },
        output: { type: 'string', example: '' },
        action: { type: 'string', example: '' },
        competency_id: { type: 'number', example: 1 },
      },
      required: ['title', 'weight', 'competency_id'],
    },
  })
  create(@Body(ValidationPipe) subCompetency: CreateSubCompetencyDto) {
    return this.subCompetencyService.create(subCompetency);
  }

  @Patch(':id') // PATCH /sub-competencies/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: '' },
        weight: { type: 'number', example: 5 },
        input: { type: 'string', example: '' },
        output: { type: 'string', example: '' },
        action: { type: 'string', example: '' },
        competency_id: { type: 'number', example: 1 },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) subCompetencyUpdate: UpdateSubCompetencyDto
  ) {
    return this.subCompetencyService.update(id, subCompetencyUpdate);
  }

  @Delete(':id') // DELETE /sub-competencies/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  removeSubCompetency(@Param('id', ParseIntPipe) id: number) {
    return this.subCompetencyService.removeSubCompetency(id);
  }
}
