import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';

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
}