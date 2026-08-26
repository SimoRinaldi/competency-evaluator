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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { RubricService } from './rubric.service';
import { CreateRubricSetDto } from './dto/create-rubric.dto';
import { UpdateRubricSetDto } from './dto/update-rubric.dto';
import { UserRole } from '@server/users';
import { JwtAuthGuard, RolesGuard, Roles } from '@server/security';

@ApiTags('Rubrics APIs')
@Controller('rubrics')
export class RubricController {
  constructor(private readonly rubricService: RubricService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inserisce a sistema una nuova rubrica' })
  create(@Body(ValidationPipe) createRubricSetDto: CreateRubricSetDto) {
    return this.rubricService.create(createRubricSetDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recupera tutte le rubriche disponibili' })
  findAll() {
    return this.rubricService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recupera il dettaglio di una singola rubrica' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID numerico della rubrica',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rubricService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifica una rubrica' })
  @ApiParam({ name: 'id', type: 'number' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateRubricSetDto: UpdateRubricSetDto
  ) {
    return this.rubricService.update(id, updateRubricSetDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Elimina un intero set di rubriche dal sistema' })
  @ApiParam({ name: 'id', type: 'number' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rubricService.remove(id);
  }
}

export { RubricController as RubricsController };
