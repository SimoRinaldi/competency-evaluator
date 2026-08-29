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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { IndicatorService } from './indicator.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';
import { UserRole } from '@server/users';
import { JwtAuthGuard, RolesGuard, Roles } from '@server/security';

@ApiTags('Indicators APIs')
@Controller('indicators')
export class IndicatorController {
  constructor(private readonly indicatorService: IndicatorService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inserisce a sistema un nuovo indicatore' })
  create(
    @Body(ValidationPipe) createIndicatorDto: CreateIndicatorDto
  ) {
    return this.indicatorService.create(createIndicatorDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Recupera l'elenco di tutti gli indicatori disponibili",
  })
  findAll() {
    return this.indicatorService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recupera il dettaglio di un singolo indicatore' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: "ID numerico dell'indicatore",
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.indicatorService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifica un indicatore esistente' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: "ID numerico dell'indicatore da aggiornare",
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateIndicatorDto: UpdateIndicatorDto
  ) {
    return this.indicatorService.update(id, updateIndicatorDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Elimina un indicatore dal sistema' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: "ID numerico dell'indicatore da eliminare",
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.indicatorService.remove(id);
  }
}

export { IndicatorController as IndicatorsController };
