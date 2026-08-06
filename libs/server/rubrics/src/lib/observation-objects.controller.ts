import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ObservationObjectsService } from './observation-objects.service';
import { CreateObservationObjectDto } from './dto/create-observation-object.dto';

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
}