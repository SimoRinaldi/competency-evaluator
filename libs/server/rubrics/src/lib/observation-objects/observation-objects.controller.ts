import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ObservationObjectsService } from './observation-objects.service';
import { CreateObservationObjectDto } from './dto/create-observation-object.dto';
import { UpdateObservationObjectDto } from './dto/update-observation-object.dto';

@Controller('observation-objects')
export class ObservationObjectsController {
  constructor(
    private readonly observationObjectsService: ObservationObjectsService
  ) {}

  @Post()
  create(@Body() createObservationObjectDto: CreateObservationObjectDto) {
    return this.observationObjectsService.create(createObservationObjectDto);
  }

  @Get()
  findAll() {
    return this.observationObjectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.observationObjectsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateObservationObjectDto: UpdateObservationObjectDto
  ) {
    return this.observationObjectsService.update(
      +id,
      updateObservationObjectDto
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.observationObjectsService.remove(+id);
  }
}
