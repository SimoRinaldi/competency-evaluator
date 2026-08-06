import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { RubricsService } from './rubrics.service';
import { CreateRubricSetDto } from './dto/create-rubric.dto'
import { UpdateRubricSetDto } from './dto/update-rubric.dto';

@Controller('rubrics')
export class RubricsController {

  constructor(private readonly rubricsService: RubricsService) {}

  @Post()
  create(@Body() createRubricSetDto: CreateRubricSetDto) {
    return this.rubricsService.create(createRubricSetDto);
  }

  @Get()                                                                                                                                                                     
  findAll() {                                                                                                                                                                
    return this.rubricsService.findAll();                                                                                                                                    
  }                                                                                                                                                                          
                                                                                                                                                                                                                                                                                     
  @Get(':id')                                                                                                                                                                
  findOne(@Param('id', ParseIntPipe) id: number) {                                                                                                                                                                                                                                                             
    return this.rubricsService.findOne(id);                                                                                                                                  
  }            
  
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRubricSetDto: UpdateRubricSetDto) {
    return this.rubricsService.update(id, updateRubricSetDto);
  }

  @Delete(':id')                                                                                                                                         
  remove(@Param('id', ParseIntPipe) id: number) {                                                                                                        
    return this.rubricsService.remove(id);                                                                                                               
  }
}  