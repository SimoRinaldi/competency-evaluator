import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';

@Controller('indicators')
export class IndicatorsController {
  constructor(
    private readonly indicatorsService: IndicatorsService
  ) {}

  @Post()
  create(@Body() createIndicatorDto: CreateIndicatorDto) {
    return this.indicatorsService.create(createIndicatorDto);
  }

  @Get()
  findAll() {
    return this.indicatorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.indicatorsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateIndicatorDto: UpdateIndicatorDto) {
    return this.indicatorsService.update(id, updateIndicatorDto);
  }

  @Delete('id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.indicatorsService.remove(id);
  }
}