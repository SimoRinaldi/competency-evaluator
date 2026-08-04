import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CompetencyService } from './competency.service';
import { CreateCompetencyDto } from './dto/create-competency.dto';
import { UpdateCompetencyDto } from './dto/update-competency.dto';

@Controller('competency')
export class CompetencyController {
  constructor(private readonly competencyService: CompetencyService) {}

  @Post()
  create(@Body() createCompetencyDto: CreateCompetencyDto) {
    return this.competencyService.create(createCompetencyDto);
  }

  @Get()
  findAll() {
    return this.competencyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.competencyService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompetencyDto: UpdateCompetencyDto
  ) {
    return this.competencyService.update(+id, updateCompetencyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.competencyService.remove(+id);
  }
}
