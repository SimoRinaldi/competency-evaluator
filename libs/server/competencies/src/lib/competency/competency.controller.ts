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
import { CompetencyService } from './competency.service';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';

@ApiTags('Competencies APIs')
@Controller('competencies')
export class CompetencyController {
  constructor(private readonly competencyService: CompetencyService) {}

  @Get() // GET /competencies
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  getCompetencies() {
    return this.competencyService.getCompetencies();
  }

  @Get(':id') // GET /competencies/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  getOneCompetency(@Param('id', ParseIntPipe) id: number) {
    return this.competencyService.getOneCompetency(id);
  }

  @Post() // POST /competencies
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: '' },
        weight: { type: 'number', example: 5 },
      },
      required: ['title', 'weight'],
    },
  })
  create(@Body(ValidationPipe) competency: CreateCompetencyDto) {
    return this.competencyService.create(competency);
  }

  @Patch(':id') // PATCH /competencies/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: '' },
        weight: { type: 'number', example: 5 },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) competencyUpdate: UpdateCompetencyDto
  ) {
    return this.competencyService.update(id, competencyUpdate);
  }

  @Delete(':id') // DELETE /competencies/:id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  removeCompetency(@Param('id', ParseIntPipe) id: number) {
    return this.competencyService.removeCompetency(id);
  }
}
