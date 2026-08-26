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
import { ObservationObjectService } from './observation-object.service';
import { CreateObservationObjectDto } from './dto/create-observation-object.dto';
import { UpdateObservationObjectDto } from './dto/update-observation-object.dto';
import { UserRole } from '@server/users';
import { JwtAuthGuard, RolesGuard, Roles } from '@server/security';

@ApiTags('Observation-objects APIs')
@Controller('observation-objects')
export class ObservationObjectController {
  constructor(
    private readonly observationObjectsService: ObservationObjectService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Inserisce a sistema un nuovo oggetto di osservazione',
  })
  create(
    @Body(ValidationPipe)
    createObservationObjectDto: CreateObservationObjectDto
  ) {
    return this.observationObjectsService.create(
      createObservationObjectDto
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Recupera l'elenco di tutti gli oggetti di osservazione disponibili",
  })
  findAll() {
    return this.observationObjectsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Recupera il dettaglio di un singolo oggetto di osservazione',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: "ID numerico dell'oggetto di osservazione",
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.observationObjectsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEST_DESIGNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifica un oggetto di osservazione esistente' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description:
      "ID numerico dell'oggetto di osservazione da aggiornare",
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    updateObservationObjectDto: UpdateObservationObjectDto
  ) {
    return this.observationObjectsService.update(
      id,
      updateObservationObjectDto
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Elimina un oggetto di osservazione dal sistema',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description:
      "ID numerico dell'oggetto di osservazione da eliminare",
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.observationObjectsService.remove(id);
  }
}

export { ObservationObjectController as ObservationObjectsController };
