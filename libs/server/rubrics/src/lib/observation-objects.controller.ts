import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common';
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.observationObjectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateIndicatorDto: UpdateObservationObjectDto) {
    return this.observationObjectsService.update(id, updateIndicatorDto);
  }

  @Delete('id')
    remove(@Param('id', ParseIntPipe) id: number) {
    return this.observationObjectsService.remove(id);
  }
}