import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubCompetencyService } from './sub-competency.service';
import { CreateSubCompetencyDto } from './dto/create-sub-competency.dto';
import { UpdateSubCompetencyDto } from './dto/update-sub-competency.dto';

@Controller('sub-competency')
export class SubCompetencyController {
  constructor(private readonly subCompetencyService: SubCompetencyService) {}

  @Post()
  create(@Body() createSubCompetencyDto: CreateSubCompetencyDto) {
    return this.subCompetencyService.create(createSubCompetencyDto);
  }

  @Get()
  findAll() {
    return this.subCompetencyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subCompetencyService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubCompetencyDto: UpdateSubCompetencyDto
  ) {
    return this.subCompetencyService.update(+id, updateSubCompetencyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subCompetencyService.remove(+id);
  }
}
